"""Video Generator with FFmpeg and Ken Burns Effects"""

import os
import random
import subprocess
from pathlib import Path
from datetime import datetime
from backend.config_loader import config
from backend.utils import setup_logger, ensure_dir, format_duration
from backend.video.image_fetcher import ImageFetcher

logger = setup_logger(__name__)


class VideoGenerator:
    """Generate videos using FFmpeg with Ken Burns effects"""

    def __init__(self):
        self.width = config.get('video.resolution.width', 1920)
        self.height = config.get('video.resolution.height', 1080)
        self.fps = config.get('video.fps', 30)
        self.codec = config.get('video.codec', 'libx264')
        self.bitrate = config.get('video.bitrate', '8000k')

        self.output_dir = ensure_dir('data/videos')
        self.temp_dir = ensure_dir('data/temp')

        self.image_fetcher = ImageFetcher()

        # Assets
        self.intro_video = config.get('assets.intro_video', '')
        self.outro_video = config.get('assets.outro_video', '')
        self.background_music = config.get('assets.background_music', '')
        self.logo = config.get('assets.logo', '')

    def generate_video(self, script_data, audio_segments, news_articles, video_id=None):
        """
        Generate complete video with intro, news segments, and outro

        Args:
            script_data: Script dict from ScriptGenerator
            audio_segments: Audio files dict from TTSEngine
            news_articles: List of NewsArticle objects
            video_id: Optional video ID

        Returns:
            Path to generated video file
        """
        logger.info("Starting video generation...")

        try:
            # Prepare segments
            video_segments = []

            # 1. Add intro video if exists
            if os.path.exists(self.intro_video):
                video_segments.append({
                    'type': 'intro',
                    'file': self.intro_video,
                })
                logger.info("Added intro video")

            # 2. Generate news segments with images and Ken Burns effects
            news_items = script_data.get('news_items', [])
            for i, news_item in enumerate(news_items):
                logger.info(f"Processing news item {i+1}/{len(news_items)}")

                # Get corresponding article
                article = news_articles[i] if i < len(news_articles) else None

                # Get audio segment
                audio_seg = next(
                    (seg for seg in audio_segments['segments'] if seg.get('type') == 'news' and seg.get('index') == i+1),
                    None
                )

                if audio_seg:
                    # Fetch image for this news item
                    image_path = self.image_fetcher.fetch_image_for_news(article) if article else None

                    if not image_path:
                        # Create placeholder
                        title = news_item.get('title', f'Tin {i+1}')[:30]
                        image_path = self.image_fetcher.create_placeholder_image(title)

                    if image_path:
                        # Get audio duration
                        from backend.tts import TTSEngine
                        tts = TTSEngine()
                        duration = tts.get_audio_duration(audio_seg['file'])

                        # Generate video segment with Ken Burns effect
                        segment_video = self._create_image_video_with_ken_burns(
                            image_path,
                            duration,
                            f"news_{video_id}_{i+1}.mp4" if video_id else f"news_{i+1}.mp4"
                        )

                        if segment_video:
                            video_segments.append({
                                'type': 'news',
                                'file': segment_video,
                                'audio': audio_seg['file'],
                                'duration': duration
                            })

            # 3. Add outro video if exists
            if os.path.exists(self.outro_video):
                video_segments.append({
                    'type': 'outro',
                    'file': self.outro_video,
                })
                logger.info("Added outro video")

            # 4. Combine all video segments
            logger.info(f"Combining {len(video_segments)} video segments...")
            combined_video = self._combine_video_segments(video_segments, video_id)

            # 5. Add voiceover audio
            if audio_segments.get('combined_file'):
                logger.info("Adding voiceover audio...")
                video_with_voice = self._add_voiceover(
                    combined_video,
                    audio_segments['combined_file'],
                    video_id
                )
            else:
                video_with_voice = combined_video

            # 6. Add background music
            if os.path.exists(self.background_music):
                logger.info("Adding background music...")
                final_video = self._add_background_music(
                    video_with_voice,
                    self.background_music,
                    video_id
                )
            else:
                final_video = video_with_voice

            # 7. Add logo watermark
            if os.path.exists(self.logo):
                logger.info("Adding logo watermark...")
                final_video = self._add_watermark(final_video, self.logo, video_id)

            logger.info(f"Video generation completed: {final_video}")
            return final_video

        except Exception as e:
            logger.error(f"Error generating video: {e}", exc_info=True)
            return None

    def _create_image_video_with_ken_burns(self, image_path, duration, output_filename):
        """Create video from image with Ken Burns effect"""
        try:
            output_path = os.path.join(self.temp_dir, output_filename)

            # Choose random Ken Burns direction
            effects = config.get('video.ken_burns_effects', [
                'zoom_in', 'zoom_out', 'pan_left', 'pan_right', 'pan_up', 'pan_down'
            ])
            effect = random.choice(effects)

            # Calculate zoom and pan values
            zoom_start, zoom_end, x_start, x_end, y_start, y_end = self._get_ken_burns_params(effect)

            # FFmpeg command with zoompan filter
            total_frames = int(duration * self.fps)

            cmd = [
                'ffmpeg', '-y',
                '-loop', '1',
                '-i', image_path,
                '-vf', (
                    f"scale={self.width*2}:{self.height*2},"
                    f"zoompan=z='if(lte(zoom,1.0),{zoom_start},{zoom_end})+"
                    f"(on/{total_frames})*({zoom_end}-{zoom_start})':"
                    f"x='iw/2-(iw/zoom/2)+({x_start}+({x_end}-{x_start})*(on/{total_frames}))*iw':"
                    f"y='ih/2-(ih/zoom/2)+({y_start}+({y_end}-{y_start})*(on/{total_frames}))*ih':"
                    f"d={total_frames}:s={self.width}x{self.height}:fps={self.fps}"
                ),
                '-c:v', self.codec,
                '-preset', 'medium',
                '-b:v', self.bitrate,
                '-t', str(duration),
                output_path
            ]

            logger.debug(f"Running FFmpeg with {effect} effect for {duration}s")
            subprocess.run(cmd, check=True, capture_output=True)

            return output_path

        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg error: {e.stderr.decode()}")
            return None
        except Exception as e:
            logger.error(f"Error creating image video: {e}")
            return None

    def _get_ken_burns_params(self, effect):
        """Get zoom and pan parameters for Ken Burns effect"""
        # Returns: zoom_start, zoom_end, x_start, x_end, y_start, y_end

        if effect == 'zoom_in':
            return 1.0, 1.3, 0, 0, 0, 0

        elif effect == 'zoom_out':
            return 1.3, 1.0, 0, 0, 0, 0

        elif effect == 'pan_left':
            return 1.2, 1.2, 0.1, -0.1, 0, 0

        elif effect == 'pan_right':
            return 1.2, 1.2, -0.1, 0.1, 0, 0

        elif effect == 'pan_up':
            return 1.2, 1.2, 0, 0, 0.1, -0.1

        elif effect == 'pan_down':
            return 1.2, 1.2, 0, 0, -0.1, 0.1

        else:  # default zoom in
            return 1.0, 1.3, 0, 0, 0, 0

    def _combine_video_segments(self, segments, video_id=None):
        """Combine multiple video segments into one"""
        try:
            # Create concat file
            concat_file = os.path.join(self.temp_dir, f'concat_{video_id}.txt')

            with open(concat_file, 'w') as f:
                for segment in segments:
                    # Ensure all videos have same codec
                    f.write(f"file '{segment['file']}'\n")

            # Output file
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_filename = f'combined_{video_id}_{timestamp}.mp4' if video_id else f'combined_{timestamp}.mp4'
            output_path = os.path.join(self.temp_dir, output_filename)

            # Combine with FFmpeg
            cmd = [
                'ffmpeg', '-y',
                '-f', 'concat',
                '-safe', '0',
                '-i', concat_file,
                '-c', 'copy',
                output_path
            ]

            subprocess.run(cmd, check=True, capture_output=True)

            return output_path

        except Exception as e:
            logger.error(f"Error combining video segments: {e}")
            return None

    def _add_voiceover(self, video_path, audio_path, video_id=None):
        """Add voiceover audio to video"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_filename = f'with_voice_{video_id}_{timestamp}.mp4' if video_id else f'with_voice_{timestamp}.mp4'
            output_path = os.path.join(self.temp_dir, output_filename)

            cmd = [
                'ffmpeg', '-y',
                '-i', video_path,
                '-i', audio_path,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-shortest',
                output_path
            ]

            subprocess.run(cmd, check=True, capture_output=True)

            return output_path

        except Exception as e:
            logger.error(f"Error adding voiceover: {e}")
            return video_path

    def _add_background_music(self, video_path, music_path, video_id=None):
        """Add background music to video"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_filename = f'with_music_{video_id}_{timestamp}.mp4' if video_id else f'with_music_{timestamp}.mp4'
            output_path = os.path.join(self.output_dir, output_filename)

            # Get background music volume from config
            bg_volume = config.get('audio.background_music_volume', 0.15)

            cmd = [
                'ffmpeg', '-y',
                '-i', video_path,
                '-stream_loop', '-1',  # Loop music
                '-i', music_path,
                '-filter_complex',
                f'[1:a]volume={bg_volume}[a1];[0:a][a1]amix=inputs=2:duration=first[aout]',
                '-map', '0:v',
                '-map', '[aout]',
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-shortest',
                output_path
            ]

            subprocess.run(cmd, check=True, capture_output=True)

            return output_path

        except Exception as e:
            logger.error(f"Error adding background music: {e}")
            return video_path

    def _add_watermark(self, video_path, logo_path, video_id=None):
        """Add logo watermark to video"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_filename = f'final_{video_id}_{timestamp}.mp4' if video_id else f'final_{timestamp}.mp4'
            output_path = os.path.join(self.output_dir, output_filename)

            # Position watermark (bottom right with 20px padding)
            position = config.get('assets.watermark_position', 'bottom_right')

            if position == 'bottom_right':
                overlay_pos = 'overlay=W-w-20:H-h-20'
            elif position == 'bottom_left':
                overlay_pos = 'overlay=20:H-h-20'
            elif position == 'top_right':
                overlay_pos = 'overlay=W-w-20:20'
            elif position == 'top_left':
                overlay_pos = 'overlay=20:20'
            else:
                overlay_pos = 'overlay=W-w-20:H-h-20'

            cmd = [
                'ffmpeg', '-y',
                '-i', video_path,
                '-i', logo_path,
                '-filter_complex', overlay_pos,
                '-c:a', 'copy',
                output_path
            ]

            subprocess.run(cmd, check=True, capture_output=True)

            return output_path

        except Exception as e:
            logger.error(f"Error adding watermark: {e}")
            return video_path

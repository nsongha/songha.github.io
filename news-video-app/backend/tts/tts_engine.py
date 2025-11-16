"""Text-to-Speech Engine for Video Narration"""

import asyncio
import os
from pathlib import Path
import edge_tts
from pydub import AudioSegment
from backend.config_loader import config
from backend.utils import setup_logger, ensure_dir, clean_filename

logger = setup_logger(__name__)


class TTSEngine:
    """Text-to-Speech engine using Edge TTS"""

    def __init__(self):
        self.voice = config.get('audio.voice', 'vi-VN-HoaiMyNeural')
        self.rate = self._format_rate(config.get('audio.speech_rate', 1.0))
        self.output_dir = ensure_dir('data/audio')

    def _format_rate(self, rate):
        """Format speech rate for Edge TTS"""
        # Edge TTS rate format: +X% or -X%
        if rate == 1.0:
            return '+0%'
        elif rate > 1.0:
            percentage = int((rate - 1.0) * 100)
            return f'+{percentage}%'
        else:
            percentage = int((1.0 - rate) * 100)
            return f'-{percentage}%'

    async def _generate_audio_async(self, text, output_path):
        """Generate audio file asynchronously"""
        communicate = edge_tts.Communicate(text, self.voice, rate=self.rate)
        await communicate.save(output_path)

    def generate_audio(self, text, output_filename=None):
        """
        Generate audio from text

        Args:
            text: Text to convert to speech
            output_filename: Optional custom filename

        Returns:
            Path to generated audio file
        """
        if not text:
            logger.error("No text provided for TTS")
            return None

        try:
            # Generate filename
            if output_filename is None:
                from datetime import datetime
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                output_filename = f'speech_{timestamp}.mp3'

            output_path = os.path.join(self.output_dir, output_filename)

            # Generate audio using async function
            logger.info(f"Generating audio with voice: {self.voice}")
            asyncio.run(self._generate_audio_async(text, output_path))

            if os.path.exists(output_path):
                logger.info(f"Audio generated successfully: {output_path}")
                return output_path
            else:
                logger.error("Audio file not created")
                return None

        except Exception as e:
            logger.error(f"Error generating audio: {e}")
            return None

    def generate_script_audio(self, script_data, video_id=None):
        """
        Generate audio for complete video script

        Args:
            script_data: Script dict with intro, news_items, outro
            video_id: Optional video ID for filename

        Returns:
            dict with audio file paths and segments info
        """
        segments = []

        try:
            # Generate intro audio
            if script_data.get('intro'):
                intro_file = self.generate_audio(
                    script_data['intro'],
                    f'intro_{video_id}.mp3' if video_id else None
                )
                if intro_file:
                    segments.append({
                        'type': 'intro',
                        'file': intro_file,
                        'text': script_data['intro']
                    })

            # Generate audio for each news item
            for i, news_item in enumerate(script_data.get('news_items', []), 1):
                script_text = news_item.get('script', '')
                if script_text:
                    news_file = self.generate_audio(
                        script_text,
                        f'news_{video_id}_{i}.mp3' if video_id else None
                    )
                    if news_file:
                        segments.append({
                            'type': 'news',
                            'index': i,
                            'file': news_file,
                            'text': script_text,
                            'title': news_item.get('title', '')
                        })

            # Generate outro audio
            if script_data.get('outro'):
                outro_file = self.generate_audio(
                    script_data['outro'],
                    f'outro_{video_id}.mp3' if video_id else None
                )
                if outro_file:
                    segments.append({
                        'type': 'outro',
                        'file': outro_file,
                        'text': script_data['outro']
                    })

            logger.info(f"Generated {len(segments)} audio segments")

            # Combine all audio segments
            combined_file = self._combine_audio_segments(segments, video_id)

            return {
                'segments': segments,
                'combined_file': combined_file
            }

        except Exception as e:
            logger.error(f"Error generating script audio: {e}")
            return None

    def _combine_audio_segments(self, segments, video_id=None):
        """Combine multiple audio segments into one file"""
        if not segments:
            return None

        try:
            combined = AudioSegment.empty()

            # Add small pause between segments (0.5 seconds)
            pause = AudioSegment.silent(duration=500)

            for segment in segments:
                audio = AudioSegment.from_mp3(segment['file'])
                combined += audio
                combined += pause

            # Export combined audio
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            combined_filename = f'combined_{video_id}_{timestamp}.mp3' if video_id else f'combined_{timestamp}.mp3'
            combined_path = os.path.join(self.output_dir, combined_filename)

            combined.export(combined_path, format='mp3')
            logger.info(f"Combined audio saved: {combined_path}")

            return combined_path

        except Exception as e:
            logger.error(f"Error combining audio segments: {e}")
            return None

    def get_audio_duration(self, audio_path):
        """Get duration of audio file in seconds"""
        try:
            audio = AudioSegment.from_file(audio_path)
            return len(audio) / 1000.0  # Convert ms to seconds
        except Exception as e:
            logger.error(f"Error getting audio duration: {e}")
            return 0

    @staticmethod
    def list_available_voices():
        """List all available Vietnamese voices"""
        async def _list_voices():
            voices = await edge_tts.list_voices()
            vi_voices = [v for v in voices if v['Locale'].startswith('vi-')]
            return vi_voices

        return asyncio.run(_list_voices())

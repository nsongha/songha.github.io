"""Main Application Orchestrator - Coordinates all modules"""

from datetime import datetime
from backend.config_loader import config
from backend.database import db, NewsArticle, Video
from backend.crawlers import CrawlerManager
from backend.ai import ScriptGenerator
from backend.tts import TTSEngine
from backend.video import VideoGenerator
from backend.thumbnail import ThumbnailGenerator
from backend.youtube import YouTubeUploader
from backend.utils import setup_logger, get_date_str

logger = setup_logger(__name__)


class AppOrchestrator:
    """Main orchestrator for the news video automation pipeline"""

    def __init__(self):
        logger.info("Initializing App Orchestrator...")

        self.crawler = CrawlerManager()
        self.script_gen = ScriptGenerator()
        self.tts = TTSEngine()
        self.video_gen = VideoGenerator()
        self.thumbnail_gen = ThumbnailGenerator()
        self.youtube = YouTubeUploader()

        # Initialize database
        db.create_tables()

        logger.info("App Orchestrator initialized successfully")

    def create_daily_video(self, auto_upload=True):
        """
        Complete pipeline: crawl news → generate script → create video → upload to YouTube

        Args:
            auto_upload: Automatically upload to YouTube (default: True)

        Returns:
            dict with result information
        """
        logger.info("=" * 80)
        logger.info("STARTING DAILY VIDEO CREATION PIPELINE")
        logger.info("=" * 80)

        try:
            # Step 1: Crawl news
            logger.info("Step 1: Crawling news from sources...")
            articles = self.crawler.crawl_and_save(limit_per_source=20)

            if not articles:
                logger.error("No articles crawled. Aborting.")
                return {'success': False, 'error': 'No articles found'}

            logger.info(f"Crawled {len(articles)} articles")

            # Step 2: Select top news for video
            logger.info("Step 2: Selecting top news for video...")
            news_count = config.get('video.news_per_video', 7)
            top_articles = self.crawler.get_top_news_for_today(limit=news_count)

            if not top_articles:
                logger.error("No articles selected for video. Aborting.")
                return {'success': False, 'error': 'No articles selected'}

            logger.info(f"Selected {len(top_articles)} articles for video")

            # Step 3: Generate script
            logger.info("Step 3: Generating video script with AI...")
            today = datetime.now()
            script_data = self.script_gen.generate_script(top_articles, video_date=today)

            if not script_data:
                logger.error("Script generation failed. Aborting.")
                return {'success': False, 'error': 'Script generation failed'}

            logger.info("Script generated successfully")

            # Step 4: Create database record for video
            session = db.get_session()
            video_record = Video(
                title=config.get('youtube.default_title', 'Tin Tức Nổi Bật').format(
                    date=get_date_str(today, '%d/%m/%Y')
                ),
                script=str(script_data),
                news_items=[a.id for a in top_articles],
                status='processing'
            )
            session.add(video_record)
            session.commit()
            video_id = video_record.id
            session.close()

            logger.info(f"Created video record ID: {video_id}")

            # Step 5: Generate audio (TTS)
            logger.info("Step 4: Generating audio with Text-to-Speech...")
            audio_data = self.tts.generate_script_audio(script_data, video_id=video_id)

            if not audio_data or not audio_data.get('combined_file'):
                logger.error("Audio generation failed. Aborting.")
                self._update_video_status(video_id, 'failed')
                return {'success': False, 'error': 'Audio generation failed'}

            logger.info(f"Audio generated: {audio_data['combined_file']}")

            # Update video record
            session = db.get_session()
            video_record = session.query(Video).get(video_id)
            video_record.audio_path = audio_data['combined_file']
            session.commit()
            session.close()

            # Step 6: Generate video
            logger.info("Step 5: Generating video with images and effects...")
            video_path = self.video_gen.generate_video(
                script_data,
                audio_data,
                top_articles,
                video_id=video_id
            )

            if not video_path:
                logger.error("Video generation failed. Aborting.")
                self._update_video_status(video_id, 'failed')
                return {'success': False, 'error': 'Video generation failed'}

            logger.info(f"Video generated: {video_path}")

            # Get video duration
            import subprocess
            result = subprocess.run(
                ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                 '-of', 'default=noprint_wrappers=1:nokey=1', video_path],
                capture_output=True, text=True
            )
            duration = float(result.stdout.strip()) if result.stdout.strip() else 0

            # Update video record
            session = db.get_session()
            video_record = session.query(Video).get(video_id)
            video_record.video_path = video_path
            video_record.duration = duration
            video_record.status = 'completed'
            video_record.completed_date = datetime.utcnow()
            session.commit()
            session.close()

            # Step 7: Generate thumbnail
            logger.info("Step 6: Generating thumbnail...")
            thumbnail_path = self.thumbnail_gen.generate_from_video(
                video_path,
                video_record.title,
                get_date_str(today, '%d/%m/%Y')
            )

            if thumbnail_path:
                logger.info(f"Thumbnail generated: {thumbnail_path}")

                # Update video record
                session = db.get_session()
                video_record = session.query(Video).get(video_id)
                video_record.thumbnail_path = thumbnail_path
                session.commit()
                session.close()

            # Step 8: Upload to YouTube
            youtube_result = None
            if auto_upload:
                logger.info("Step 7: Uploading to YouTube...")
                youtube_result = self._upload_to_youtube(video_id)

            # Return result
            result = {
                'success': True,
                'video_id': video_id,
                'video_path': video_path,
                'thumbnail_path': thumbnail_path,
                'duration': duration,
                'news_count': len(top_articles),
            }

            if youtube_result:
                result.update({
                    'youtube_id': youtube_result['id'],
                    'video_url': youtube_result['url'],
                })

            logger.info("=" * 80)
            logger.info("DAILY VIDEO CREATION COMPLETED SUCCESSFULLY!")
            logger.info(f"Video ID: {video_id}")
            if youtube_result:
                logger.info(f"YouTube URL: {youtube_result['url']}")
            logger.info("=" * 80)

            return result

        except Exception as e:
            logger.error(f"Error in daily video creation: {e}", exc_info=True)
            return {'success': False, 'error': str(e)}

    def _upload_to_youtube(self, video_id):
        """Upload video to YouTube"""
        try:
            session = db.get_session()
            video_record = session.query(Video).get(video_id)

            if not video_record:
                logger.error(f"Video record not found: {video_id}")
                return None

            # Prepare YouTube metadata
            title = video_record.title
            news_items = video_record.news_items or []

            # Build description with news list
            news_list = []
            for news_id in news_items[:10]:  # Max 10 items
                article = session.query(NewsArticle).get(news_id)
                if article:
                    news_list.append(f"- {article.title}")

            description = config.get('youtube.default_description', '').format(
                date=get_date_str(datetime.now(), '%d/%m/%Y'),
                news_list='\n'.join(news_list)
            )

            tags = config.get('youtube.default_tags', [])

            # Upload
            result = self.youtube.upload_video(
                video_path=video_record.video_path,
                title=title,
                description=description,
                tags=tags,
                thumbnail_path=video_record.thumbnail_path,
                category_id=config.get('youtube.category_id', '25'),
                privacy_status=config.get('youtube.privacy_status', 'public')
            )

            if result:
                # Update video record
                video_record.youtube_id = result['id']
                video_record.youtube_url = result['url']
                video_record.uploaded_to_youtube = True
                video_record.upload_date = datetime.utcnow()
                session.commit()

                logger.info(f"Video uploaded to YouTube: {result['url']}")

            session.close()
            return result

        except Exception as e:
            logger.error(f"Error uploading to YouTube: {e}")
            return None

    def upload_video_by_id(self, video_id):
        """Upload an existing video to YouTube"""
        return self._upload_to_youtube(video_id)

    def _update_video_status(self, video_id, status):
        """Update video status in database"""
        try:
            session = db.get_session()
            video_record = session.query(Video).get(video_id)
            if video_record:
                video_record.status = status
                session.commit()
            session.close()
        except Exception as e:
            logger.error(f"Error updating video status: {e}")

    def get_video_stats(self, video_id):
        """Get statistics for a video"""
        try:
            session = db.get_session()
            video_record = session.query(Video).get(video_id)

            if not video_record or not video_record.youtube_id:
                return None

            # Get stats from YouTube
            youtube_stats = self.youtube.get_video_stats(video_record.youtube_id)

            if youtube_stats:
                # Update database
                video_record.views = youtube_stats['views']
                video_record.likes = youtube_stats['likes']
                video_record.comments = youtube_stats['comments']
                session.commit()

            session.close()
            return youtube_stats

        except Exception as e:
            logger.error(f"Error getting video stats: {e}")
            return None

"""Task Scheduler for Automated Video Publishing"""

import pytz
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from backend.config_loader import config
from backend.utils import setup_logger

logger = setup_logger(__name__)


class TaskScheduler:
    """Schedule automated tasks for news video generation"""

    def __init__(self, app_orchestrator=None):
        self.orchestrator = app_orchestrator
        self.timezone = pytz.timezone(config.get('scheduler.timezone', 'Asia/Ho_Chi_Minh'))
        self.scheduler = BackgroundScheduler(timezone=self.timezone)
        self.is_running = False

    def start(self):
        """Start the scheduler"""
        if self.is_running:
            logger.warning("Scheduler is already running")
            return

        if not config.get('scheduler.enabled', True):
            logger.info("Scheduler is disabled in config")
            return

        # Add daily video generation job
        daily_run_time = config.get('scheduler.daily_run_time', '18:00')
        hour, minute = daily_run_time.split(':')

        self.scheduler.add_job(
            func=self._daily_video_generation,
            trigger=CronTrigger(hour=int(hour), minute=int(minute)),
            id='daily_video_generation',
            name='Daily Video Generation',
            replace_existing=True
        )

        logger.info(f"Scheduled daily video generation at {daily_run_time} ({self.timezone})")

        # Start scheduler
        self.scheduler.start()
        self.is_running = True

        logger.info("Scheduler started successfully")

    def stop(self):
        """Stop the scheduler"""
        if not self.is_running:
            return

        self.scheduler.shutdown(wait=True)
        self.is_running = False
        logger.info("Scheduler stopped")

    def _daily_video_generation(self):
        """Daily task to generate and upload video"""
        logger.info("=== Starting daily video generation task ===")

        try:
            if self.orchestrator:
                result = self.orchestrator.create_daily_video()

                if result and result.get('success'):
                    logger.info(f"Daily video created successfully: {result.get('video_url')}")
                else:
                    logger.error("Daily video creation failed")
            else:
                logger.error("No orchestrator configured")

        except Exception as e:
            logger.error(f"Error in daily video generation: {e}", exc_info=True)

    def schedule_video_upload(self, video_id, scheduled_time):
        """Schedule a specific video for upload at a given time"""
        job_id = f"upload_video_{video_id}"

        self.scheduler.add_job(
            func=self._upload_scheduled_video,
            args=[video_id],
            trigger='date',
            run_date=scheduled_time,
            id=job_id,
            name=f'Upload Video {video_id}',
            replace_existing=True
        )

        logger.info(f"Scheduled video {video_id} for upload at {scheduled_time}")

    def _upload_scheduled_video(self, video_id):
        """Upload a scheduled video"""
        logger.info(f"Uploading scheduled video: {video_id}")

        try:
            if self.orchestrator:
                result = self.orchestrator.upload_video_by_id(video_id)

                if result:
                    logger.info(f"Video {video_id} uploaded successfully")
                else:
                    logger.error(f"Failed to upload video {video_id}")
            else:
                logger.error("No orchestrator configured")

        except Exception as e:
            logger.error(f"Error uploading scheduled video: {e}", exc_info=True)

    def add_custom_job(self, func, trigger, job_id, **kwargs):
        """Add a custom scheduled job"""
        self.scheduler.add_job(
            func=func,
            trigger=trigger,
            id=job_id,
            replace_existing=True,
            **kwargs
        )

        logger.info(f"Added custom job: {job_id}")

    def remove_job(self, job_id):
        """Remove a scheduled job"""
        try:
            self.scheduler.remove_job(job_id)
            logger.info(f"Removed job: {job_id}")
        except Exception as e:
            logger.error(f"Error removing job {job_id}: {e}")

    def list_jobs(self):
        """List all scheduled jobs"""
        jobs = self.scheduler.get_jobs()
        job_list = []

        for job in jobs:
            job_info = {
                'id': job.id,
                'name': job.name,
                'next_run_time': job.next_run_time.isoformat() if job.next_run_time else None,
            }
            job_list.append(job_info)

        return job_list

    def run_now(self, job_id):
        """Run a scheduled job immediately"""
        try:
            job = self.scheduler.get_job(job_id)
            if job:
                job.func(*job.args, **job.kwargs)
                logger.info(f"Executed job immediately: {job_id}")
            else:
                logger.error(f"Job not found: {job_id}")
        except Exception as e:
            logger.error(f"Error running job {job_id}: {e}", exc_info=True)

#!/usr/bin/env python3
"""
News Video Aggregator - Main Entry Point

This application automatically:
1. Crawls news from major Vietnamese news sites
2. Generates video scripts using AI
3. Creates videos with TTS and Ken Burns effects
4. Uploads to YouTube on schedule
"""

import sys
import argparse
from backend.app_orchestrator import AppOrchestrator
from backend.scheduler import TaskScheduler
from backend.database import db
from backend.utils import setup_logger

logger = setup_logger(__name__)


def main():
    parser = argparse.ArgumentParser(description='News Video Aggregator')
    parser.add_argument(
        'command',
        choices=['create-video', 'crawl-news', 'run-scheduler', 'web-dashboard', 'init-db'],
        help='Command to run'
    )
    parser.add_argument('--no-upload', action='store_true', help='Create video without uploading to YouTube')

    args = parser.parse_args()

    # Initialize orchestrator
    orchestrator = AppOrchestrator()

    if args.command == 'init-db':
        logger.info("Initializing database...")
        db.create_tables()
        logger.info("Database initialized successfully!")

    elif args.command == 'crawl-news':
        logger.info("Crawling news from all sources...")
        articles = orchestrator.crawler.crawl_and_save(limit_per_source=20)
        logger.info(f"Successfully crawled {len(articles)} articles")

    elif args.command == 'create-video':
        logger.info("Creating daily video...")
        auto_upload = not args.no_upload
        result = orchestrator.create_daily_video(auto_upload=auto_upload)

        if result.get('success'):
            logger.info(f"✅ Video created successfully!")
            logger.info(f"   Video ID: {result['video_id']}")
            logger.info(f"   Video Path: {result['video_path']}")
            if result.get('video_url'):
                logger.info(f"   YouTube URL: {result['video_url']}")
        else:
            logger.error(f"❌ Video creation failed: {result.get('error')}")
            sys.exit(1)

    elif args.command == 'run-scheduler':
        logger.info("Starting scheduler...")
        scheduler = TaskScheduler(orchestrator)
        scheduler.start()

        logger.info("Scheduler is running. Press Ctrl+C to stop.")

        try:
            # Keep running
            import time
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Stopping scheduler...")
            scheduler.stop()
            logger.info("Scheduler stopped.")

    elif args.command == 'web-dashboard':
        logger.info("Starting web dashboard...")

        # Import and run Flask app
        from frontend.app import app, scheduler

        # Start scheduler in background
        scheduler.start()

        # Run Flask
        logger.info("Dashboard available at: http://localhost:5000")
        app.run(host='0.0.0.0', port=5000, debug=False)


if __name__ == '__main__':
    main()

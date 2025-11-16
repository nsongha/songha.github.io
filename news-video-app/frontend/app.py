"""Web Dashboard for News Video App"""

import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from flask import Flask, render_template, jsonify, request
from datetime import datetime
from backend.app_orchestrator import AppOrchestrator
from backend.scheduler import TaskScheduler
from backend.database import db, NewsArticle, Video
from backend.utils import setup_logger, format_duration

logger = setup_logger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize orchestrator and scheduler
orchestrator = AppOrchestrator()
scheduler = TaskScheduler(orchestrator)


@app.route('/')
def index():
    """Dashboard home page"""
    # Get statistics
    session = db.get_session()

    total_videos = session.query(Video).count()
    total_articles = session.query(NewsArticle).count()

    recent_videos = session.query(Video).order_by(
        Video.created_date.desc()
    ).limit(10).all()

    uploaded_videos = session.query(Video).filter_by(
        uploaded_to_youtube=True
    ).count()

    session.close()

    stats = {
        'total_videos': total_videos,
        'total_articles': total_articles,
        'uploaded_videos': uploaded_videos,
        'scheduler_running': scheduler.is_running,
    }

    return render_template('index.html', stats=stats, videos=recent_videos)


@app.route('/videos')
def videos():
    """List all videos"""
    session = db.get_session()

    videos = session.query(Video).order_by(
        Video.created_date.desc()
    ).all()

    session.close()

    return render_template('videos.html', videos=videos)


@app.route('/video/<int:video_id>')
def video_detail(video_id):
    """Video detail page"""
    session = db.get_session()

    video = session.query(Video).get(video_id)

    if not video:
        return "Video not found", 404

    # Get associated news articles
    articles = []
    if video.news_items:
        for news_id in video.news_items:
            article = session.query(NewsArticle).get(news_id)
            if article:
                articles.append(article)

    session.close()

    return render_template('video_detail.html', video=video, articles=articles)


@app.route('/news')
def news():
    """List recent news articles"""
    session = db.get_session()

    page = request.args.get('page', 1, type=int)
    per_page = 50

    articles = session.query(NewsArticle).order_by(
        NewsArticle.crawled_date.desc()
    ).limit(per_page).offset((page - 1) * per_page).all()

    total = session.query(NewsArticle).count()

    session.close()

    return render_template('news.html', articles=articles, page=page, total=total, per_page=per_page)


@app.route('/api/create-video', methods=['POST'])
def api_create_video():
    """API endpoint to create a new video"""
    try:
        auto_upload = request.json.get('auto_upload', True)

        logger.info("Manual video creation triggered via API")
        result = orchestrator.create_daily_video(auto_upload=auto_upload)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error creating video: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/crawl-news', methods=['POST'])
def api_crawl_news():
    """API endpoint to crawl news"""
    try:
        limit = request.json.get('limit', 20)

        logger.info("Manual news crawl triggered via API")
        articles = orchestrator.crawler.crawl_and_save(limit_per_source=limit)

        return jsonify({
            'success': True,
            'articles_count': len(articles)
        })

    except Exception as e:
        logger.error(f"Error crawling news: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/upload-video/<int:video_id>', methods=['POST'])
def api_upload_video(video_id):
    """API endpoint to upload a video to YouTube"""
    try:
        logger.info(f"Manual upload triggered for video {video_id}")
        result = orchestrator.upload_video_by_id(video_id)

        if result:
            return jsonify({'success': True, 'result': result})
        else:
            return jsonify({'success': False, 'error': 'Upload failed'}), 500

    except Exception as e:
        logger.error(f"Error uploading video: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/scheduler/start', methods=['POST'])
def api_start_scheduler():
    """Start the scheduler"""
    try:
        scheduler.start()
        return jsonify({'success': True, 'message': 'Scheduler started'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/scheduler/stop', methods=['POST'])
def api_stop_scheduler():
    """Stop the scheduler"""
    try:
        scheduler.stop()
        return jsonify({'success': True, 'message': 'Scheduler stopped'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/scheduler/status')
def api_scheduler_status():
    """Get scheduler status"""
    jobs = scheduler.list_jobs() if scheduler.is_running else []

    return jsonify({
        'running': scheduler.is_running,
        'jobs': jobs
    })


@app.route('/api/stats')
def api_stats():
    """Get dashboard statistics"""
    session = db.get_session()

    stats = {
        'total_videos': session.query(Video).count(),
        'total_articles': session.query(NewsArticle).count(),
        'uploaded_videos': session.query(Video).filter_by(uploaded_to_youtube=True).count(),
        'pending_videos': session.query(Video).filter_by(status='pending').count(),
        'processing_videos': session.query(Video).filter_by(status='processing').count(),
        'scheduler_running': scheduler.is_running,
    }

    session.close()

    return jsonify(stats)


# Template filters
@app.template_filter('datetime')
def format_datetime(value):
    """Format datetime for display"""
    if value is None:
        return ''
    if isinstance(value, str):
        return value
    return value.strftime('%d/%m/%Y %H:%M')


@app.template_filter('duration')
def filter_duration(seconds):
    """Format duration"""
    if not seconds:
        return '0s'
    return format_duration(seconds)


if __name__ == '__main__':
    # Start scheduler
    scheduler.start()

    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )

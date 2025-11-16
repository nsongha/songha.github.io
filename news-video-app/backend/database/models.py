"""Database Models for News Video App"""

from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config_loader import config

Base = declarative_base()


class NewsArticle(Base):
    """News article model"""
    __tablename__ = 'news_articles'

    id = Column(Integer, primary_key=True)
    source = Column(String(100), nullable=False)  # VnExpress, Tuoi Tre, Thanh Nien
    title = Column(String(500), nullable=False)
    url = Column(String(1000), unique=True, nullable=False)
    content = Column(Text)
    summary = Column(Text)
    image_url = Column(String(1000))
    published_date = Column(DateTime)
    crawled_date = Column(DateTime, default=datetime.utcnow)
    category = Column(String(100))
    tags = Column(JSON)  # List of tags
    selected_for_video = Column(Boolean, default=False)
    used_in_video_id = Column(Integer)  # Reference to Video

    def __repr__(self):
        return f"<NewsArticle(id={self.id}, title='{self.title[:50]}...', source='{self.source}')>"


class Video(Base):
    """Video model"""
    __tablename__ = 'videos'

    id = Column(Integer, primary_key=True)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    script = Column(Text)  # Generated script
    news_items = Column(JSON)  # List of news article IDs
    thumbnail_path = Column(String(1000))
    video_path = Column(String(1000))
    audio_path = Column(String(1000))
    duration = Column(Float)  # in seconds

    # YouTube info
    youtube_id = Column(String(100))
    youtube_url = Column(String(1000))
    uploaded_to_youtube = Column(Boolean, default=False)
    upload_date = Column(DateTime)

    # Status
    status = Column(String(50), default='pending')  # pending, processing, completed, failed, uploaded
    created_date = Column(DateTime, default=datetime.utcnow)
    completed_date = Column(DateTime)

    # Metadata
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)

    def __repr__(self):
        return f"<Video(id={self.id}, title='{self.title[:50]}...', status='{self.status}')>"


class Image(Base):
    """Downloaded images for video"""
    __tablename__ = 'images'

    id = Column(Integer, primary_key=True)
    news_article_id = Column(Integer)
    source = Column(String(100))  # unsplash, pexels, article
    url = Column(String(1000))
    local_path = Column(String(1000))
    search_query = Column(String(500))
    width = Column(Integer)
    height = Column(Integer)
    downloaded_date = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Image(id={self.id}, source='{self.source}')>"


class Schedule(Base):
    """Publishing schedule"""
    __tablename__ = 'schedules'

    id = Column(Integer, primary_key=True)
    video_id = Column(Integer)
    scheduled_time = Column(DateTime, nullable=False)
    published = Column(Boolean, default=False)
    published_time = Column(DateTime)
    created_date = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Schedule(id={self.id}, video_id={self.video_id}, scheduled_time='{self.scheduled_time}')>"


class AppLog(Base):
    """Application logs"""
    __tablename__ = 'app_logs'

    id = Column(Integer, primary_key=True)
    level = Column(String(20))  # INFO, WARNING, ERROR
    module = Column(String(100))
    message = Column(Text)
    details = Column(JSON)
    created_date = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<AppLog(id={self.id}, level='{self.level}', module='{self.module}')>"


# Database setup
class Database:
    """Database manager"""

    def __init__(self):
        db_path = config.get('database.path')
        self.engine = create_engine(f'sqlite:///{db_path}', echo=False)
        self.Session = sessionmaker(bind=self.engine)

    def create_tables(self):
        """Create all tables"""
        Base.metadata.create_all(self.engine)

    def get_session(self):
        """Get a new database session"""
        return self.Session()

    def drop_tables(self):
        """Drop all tables (use with caution!)"""
        Base.metadata.drop_all(self.engine)


# Global database instance
db = Database()

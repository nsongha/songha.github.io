"""Crawler Manager - Orchestrates all news crawlers"""

from datetime import datetime
from backend.crawlers.vnexpress_crawler import VnExpressCrawler
from backend.crawlers.tuoitre_crawler import TuoiTreCrawler
from backend.crawlers.thanhnien_crawler import ThanhNienCrawler
from backend.database import db, NewsArticle
from backend.config_loader import config
from backend.utils import setup_logger

logger = setup_logger(__name__)


class CrawlerManager:
    """Manages all news crawlers"""

    def __init__(self):
        self.crawlers = {
            'VnExpress': VnExpressCrawler(),
            'Tuoi Tre': TuoiTreCrawler(),
            'Thanh Nien': ThanhNienCrawler(),
        }

    def crawl_all_sources(self, limit_per_source=20):
        """Crawl all enabled news sources"""
        logger.info("Starting crawl from all sources...")

        all_articles = []
        news_sources = config.get('news_sources', [])

        for source_config in news_sources:
            if not source_config.get('enabled', True):
                logger.info(f"Skipping disabled source: {source_config['name']}")
                continue

            source_name = source_config['name']
            crawler = self.crawlers.get(source_name)

            if not crawler:
                logger.warning(f"No crawler found for source: {source_name}")
                continue

            try:
                articles = crawler.get_latest_news(limit=limit_per_source)
                all_articles.extend(articles)
                logger.info(f"Crawled {len(articles)} articles from {source_name}")
            except Exception as e:
                logger.error(f"Error crawling {source_name}: {e}")

        logger.info(f"Total articles crawled: {len(all_articles)}")
        return all_articles

    def save_to_database(self, articles):
        """Save crawled articles to database"""
        session = db.get_session()
        saved_count = 0
        updated_count = 0

        try:
            for article_data in articles:
                # Check if article already exists
                existing = session.query(NewsArticle).filter_by(
                    url=article_data['url']
                ).first()

                if existing:
                    # Update existing article
                    for key, value in article_data.items():
                        if hasattr(existing, key):
                            setattr(existing, key, value)
                    updated_count += 1
                else:
                    # Create new article
                    article = NewsArticle(**article_data)
                    session.add(article)
                    saved_count += 1

            session.commit()
            logger.info(f"Saved {saved_count} new articles, updated {updated_count} articles")

        except Exception as e:
            session.rollback()
            logger.error(f"Error saving articles to database: {e}")
            raise
        finally:
            session.close()

        return saved_count, updated_count

    def get_top_news_for_today(self, limit=10):
        """Get top news articles for video creation"""
        session = db.get_session()

        try:
            # Get recent articles not yet used in videos
            articles = session.query(NewsArticle).filter_by(
                selected_for_video=False
            ).order_by(
                NewsArticle.published_date.desc()
            ).limit(limit * 3).all()  # Get more to select from

            # Simple scoring: prefer recent articles with good content
            scored_articles = []
            for article in articles:
                score = 0

                # Recency score
                if article.published_date:
                    hours_old = (datetime.utcnow() - article.published_date).total_seconds() / 3600
                    if hours_old < 6:
                        score += 10
                    elif hours_old < 12:
                        score += 7
                    elif hours_old < 24:
                        score += 5

                # Content quality score
                if article.content and len(article.content) > 500:
                    score += 5
                if article.image_url:
                    score += 3
                if article.summary:
                    score += 2

                scored_articles.append((score, article))

            # Sort by score and take top N
            scored_articles.sort(reverse=True, key=lambda x: x[0])
            top_articles = [article for score, article in scored_articles[:limit]]

            # Mark as selected
            for article in top_articles:
                article.selected_for_video = True

            session.commit()

            logger.info(f"Selected {len(top_articles)} top articles for video")
            return top_articles

        except Exception as e:
            session.rollback()
            logger.error(f"Error getting top news: {e}")
            return []
        finally:
            session.close()

    def crawl_and_save(self, limit_per_source=20):
        """Convenience method to crawl and save in one step"""
        articles = self.crawl_all_sources(limit_per_source)
        if articles:
            self.save_to_database(articles)
        return articles

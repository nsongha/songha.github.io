"""Base Crawler for News Sites"""

from abc import ABC, abstractmethod
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from backend.utils import setup_logger
from fake_useragent import UserAgent

logger = setup_logger(__name__)


class BaseCrawler(ABC):
    """Base class for all news crawlers"""

    def __init__(self, source_name, base_url, rss_feed=None):
        self.source_name = source_name
        self.base_url = base_url
        self.rss_feed = rss_feed
        self.ua = UserAgent()
        self.session = requests.Session()

    def get_headers(self):
        """Get random user agent headers"""
        return {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        }

    def fetch_url(self, url, timeout=30):
        """Fetch URL with error handling"""
        try:
            response = self.session.get(
                url,
                headers=self.get_headers(),
                timeout=timeout
            )
            response.raise_for_status()
            response.encoding = 'utf-8'
            return response
        except requests.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    def parse_html(self, html_content):
        """Parse HTML content"""
        return BeautifulSoup(html_content, 'lxml')

    @abstractmethod
    def get_latest_news(self, limit=20):
        """Get latest news articles (must be implemented by subclass)"""
        pass

    @abstractmethod
    def parse_article(self, url):
        """Parse a single article (must be implemented by subclass)"""
        pass

    def clean_text(self, text):
        """Clean text content"""
        if not text:
            return ""
        return ' '.join(text.split()).strip()

    def extract_rss_items(self):
        """Extract items from RSS feed"""
        if not self.rss_feed:
            return []

        response = self.fetch_url(self.rss_feed)
        if not response:
            return []

        soup = self.parse_html(response.content)
        items = []

        for item in soup.find_all('item'):
            try:
                article = {
                    'title': self.clean_text(item.find('title').text) if item.find('title') else '',
                    'url': item.find('link').text.strip() if item.find('link') else '',
                    'description': self.clean_text(item.find('description').text) if item.find('description') else '',
                    'published_date': self.parse_date(item.find('pubdate').text) if item.find('pubdate') else None,
                }
                if article['url']:
                    items.append(article)
            except Exception as e:
                logger.error(f"Error parsing RSS item: {e}")
                continue

        return items

    def parse_date(self, date_str):
        """Parse date string to datetime (can be overridden)"""
        try:
            # Try common formats
            for fmt in ['%a, %d %b %Y %H:%M:%S %z', '%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%S']:
                try:
                    return datetime.strptime(date_str.strip(), fmt)
                except ValueError:
                    continue
            return None
        except Exception:
            return None

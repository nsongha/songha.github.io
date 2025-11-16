"""Tuoi Tre News Crawler"""

from .base_crawler import BaseCrawler
from backend.utils import setup_logger

logger = setup_logger(__name__)


class TuoiTreCrawler(BaseCrawler):
    """Crawler for TuoiTre.vn"""

    def __init__(self):
        super().__init__(
            source_name="Tuoi Tre",
            base_url="https://tuoitre.vn",
            rss_feed="https://tuoitre.vn/rss/tin-moi-nhat.rss"
        )

    def get_latest_news(self, limit=20):
        """Get latest news from Tuoi Tre RSS feed"""
        logger.info(f"Fetching latest news from {self.source_name}")

        items = self.extract_rss_items()
        articles = []

        for item in items[:limit]:
            try:
                # Get full article content
                article_data = self.parse_article(item['url'])
                if article_data:
                    # Merge RSS data with parsed data
                    article_data.update({
                        'source': self.source_name,
                        'url': item['url'],
                        'published_date': item.get('published_date'),
                    })
                    articles.append(article_data)
            except Exception as e:
                logger.error(f"Error processing article {item.get('url')}: {e}")
                continue

        logger.info(f"Successfully fetched {len(articles)} articles from {self.source_name}")
        return articles

    def parse_article(self, url):
        """Parse Tuoi Tre article page"""
        response = self.fetch_url(url)
        if not response:
            return None

        soup = self.parse_html(response.content)

        try:
            # Title
            title_elem = soup.find('h1', class_='article-title')
            if not title_elem:
                title_elem = soup.find('h1', class_='detail-title')
            title = self.clean_text(title_elem.text) if title_elem else ''

            # Description/Summary
            desc_elem = soup.find('h2', class_='article-subtitle')
            if not desc_elem:
                desc_elem = soup.find('h2', class_='sapo')
            summary = self.clean_text(desc_elem.text) if desc_elem else ''

            # Content
            content_elem = soup.find('div', class_='detail-content')
            if not content_elem:
                content_elem = soup.find('div', id='main-detail-body')

            content = ''
            if content_elem:
                paragraphs = content_elem.find_all('p')
                content = '\n'.join([self.clean_text(p.text) for p in paragraphs if p.text.strip()])

            # Main image
            image_url = ''
            img_elem = soup.find('meta', property='og:image')
            if img_elem:
                image_url = img_elem.get('content', '')

            # Category
            category = ''
            breadcrumb = soup.find('ul', class_='breadcrumb')
            if breadcrumb:
                cat_links = breadcrumb.find_all('li')
                if len(cat_links) > 1:
                    cat_link = cat_links[1].find('a')
                    if cat_link:
                        category = self.clean_text(cat_link.text)

            # Tags
            tags = []
            tag_container = soup.find('div', class_='detail-tags')
            if tag_container:
                tag_links = tag_container.find_all('a')
                tags = [self.clean_text(tag.text) for tag in tag_links if tag.text.strip()]

            return {
                'title': title,
                'summary': summary,
                'content': content,
                'image_url': image_url,
                'category': category,
                'tags': tags,
            }

        except Exception as e:
            logger.error(f"Error parsing Tuoi Tre article: {e}")
            return None

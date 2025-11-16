"""VnExpress News Crawler"""

from .base_crawler import BaseCrawler
from backend.utils import setup_logger

logger = setup_logger(__name__)


class VnExpressCrawler(BaseCrawler):
    """Crawler for VnExpress.net"""

    def __init__(self):
        super().__init__(
            source_name="VnExpress",
            base_url="https://vnexpress.net",
            rss_feed="https://vnexpress.net/rss/tin-moi-nhat.rss"
        )

    def get_latest_news(self, limit=20):
        """Get latest news from VnExpress RSS feed"""
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
        """Parse VnExpress article page"""
        response = self.fetch_url(url)
        if not response:
            return None

        soup = self.parse_html(response.content)

        try:
            # Title
            title_elem = soup.find('h1', class_='title-detail')
            title = self.clean_text(title_elem.text) if title_elem else ''

            # Description/Summary
            desc_elem = soup.find('p', class_='description')
            summary = self.clean_text(desc_elem.text) if desc_elem else ''

            # Content
            content_elem = soup.find('article', class_='fck_detail')
            content = ''
            if content_elem:
                paragraphs = content_elem.find_all('p', class_='Normal')
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
                    category = self.clean_text(cat_links[1].text)

            # Tags
            tags = []
            tag_elems = soup.find_all('meta', property='article:tag')
            for tag in tag_elems:
                tag_content = tag.get('content', '').strip()
                if tag_content:
                    tags.append(tag_content)

            return {
                'title': title,
                'summary': summary,
                'content': content,
                'image_url': image_url,
                'category': category,
                'tags': tags,
            }

        except Exception as e:
            logger.error(f"Error parsing VnExpress article: {e}")
            return None

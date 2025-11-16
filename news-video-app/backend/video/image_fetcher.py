"""Image Fetcher for Video Generation"""

import os
import requests
from pathlib import Path
from urllib.parse import urlparse
from backend.config_loader import config
from backend.utils import setup_logger, ensure_dir, clean_filename
from backend.database import db, Image

logger = setup_logger(__name__)


class ImageFetcher:
    """Fetch images from various sources for video"""

    def __init__(self):
        self.unsplash_api_key = config.get('image_sources.unsplash_api_key', '')
        self.pexels_api_key = config.get('image_sources.pexels_api_key', '')
        self.output_dir = ensure_dir('data/images')
        self.session = requests.Session()

    def fetch_image_for_news(self, news_article, use_article_image=True):
        """
        Fetch image for a news article

        Args:
            news_article: NewsArticle object or dict
            use_article_image: Try to use article's original image first

        Returns:
            Path to downloaded image file
        """
        # Try article's own image first
        if use_article_image:
            if hasattr(news_article, 'image_url'):
                article_img = news_article.image_url
            else:
                article_img = news_article.get('image_url', '')

            if article_img:
                logger.info(f"Using article's image: {article_img}")
                downloaded = self._download_image(article_img, source='article')
                if downloaded:
                    return downloaded

        # Extract search query from article
        if hasattr(news_article, 'title'):
            title = news_article.title
            category = getattr(news_article, 'category', '')
        else:
            title = news_article.get('title', '')
            category = news_article.get('category', '')

        search_query = self._create_search_query(title, category)

        # Try stock photo sources
        logger.info(f"Searching stock photos for: {search_query}")

        # Try Pexels first (better for Vietnamese content)
        if self.pexels_api_key:
            image_path = self._fetch_from_pexels(search_query)
            if image_path:
                return image_path

        # Try Unsplash
        if self.unsplash_api_key:
            image_path = self._fetch_from_unsplash(search_query)
            if image_path:
                return image_path

        # Fallback: use article image even if quality is low
        if hasattr(news_article, 'image_url'):
            article_img = news_article.image_url
        else:
            article_img = news_article.get('image_url', '')

        if article_img:
            downloaded = self._download_image(article_img, source='article_fallback')
            if downloaded:
                return downloaded

        # Ultimate fallback: return None and video generator will use placeholder
        logger.warning(f"No image found for article: {title[:50]}")
        return None

    def _create_search_query(self, title, category=''):
        """Create search query from article title and category"""
        # Extract key words from title
        # Remove common Vietnamese stop words
        stop_words = ['của', 'và', 'các', 'có', 'được', 'từ', 'cho', 'tại', 'với', 'về', 'theo']

        words = title.split()
        filtered_words = [w for w in words if w.lower() not in stop_words]

        # Take first 3-4 meaningful words
        query_words = filtered_words[:4]

        # Add category if available
        if category:
            query_words.insert(0, category)

        # For international stock photos, translate common Vietnamese terms to English
        translations = {
            'kinh tế': 'business economy',
            'chính trị': 'politics government',
            'thể thao': 'sports',
            'văn hóa': 'culture',
            'giáo dục': 'education',
            'sức khỏe': 'health medical',
            'công nghệ': 'technology',
            'môi trường': 'environment nature',
            'giao thông': 'traffic transportation',
            'bất động sản': 'real estate',
            'du lịch': 'travel tourism',
        }

        query = ' '.join(query_words).lower()

        # Try to translate
        for vi, en in translations.items():
            if vi in query:
                return en

        # Default to generic news/Vietnam imagery
        return 'vietnam news business'

    def _fetch_from_pexels(self, query):
        """Fetch image from Pexels"""
        try:
            url = 'https://api.pexels.com/v1/search'
            headers = {'Authorization': self.pexels_api_key}
            params = {
                'query': query,
                'per_page': 1,
                'orientation': 'landscape'
            }

            response = self.session.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            if data.get('photos'):
                photo = data['photos'][0]
                # Get large size image
                image_url = photo['src']['large2x']
                return self._download_image(image_url, source='pexels', search_query=query)

        except Exception as e:
            logger.error(f"Error fetching from Pexels: {e}")

        return None

    def _fetch_from_unsplash(self, query):
        """Fetch image from Unsplash"""
        try:
            url = 'https://api.unsplash.com/search/photos'
            headers = {'Authorization': f'Client-ID {self.unsplash_api_key}'}
            params = {
                'query': query,
                'per_page': 1,
                'orientation': 'landscape'
            }

            response = self.session.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            if data.get('results'):
                photo = data['results'][0]
                # Get regular size image
                image_url = photo['urls']['regular']
                return self._download_image(image_url, source='unsplash', search_query=query)

        except Exception as e:
            logger.error(f"Error fetching from Unsplash: {e}")

        return None

    def _download_image(self, url, source='unknown', search_query=''):
        """Download image from URL"""
        if not url:
            return None

        try:
            response = self.session.get(url, timeout=15, stream=True)
            response.raise_for_status()

            # Get file extension
            parsed_url = urlparse(url)
            ext = os.path.splitext(parsed_url.path)[1]
            if not ext or ext not in ['.jpg', '.jpeg', '.png', '.webp']:
                ext = '.jpg'

            # Generate filename
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
            filename = f'image_{timestamp}{ext}'
            filepath = os.path.join(self.output_dir, filename)

            # Download
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            # Verify image
            from PIL import Image as PILImage
            img = PILImage.open(filepath)
            width, height = img.size

            logger.info(f"Downloaded image: {filepath} ({width}x{height})")

            # Save to database
            self._save_image_to_db(filepath, url, source, search_query, width, height)

            return filepath

        except Exception as e:
            logger.error(f"Error downloading image from {url}: {e}")
            return None

    def _save_image_to_db(self, filepath, url, source, search_query, width, height):
        """Save image record to database"""
        try:
            session = db.get_session()

            image = Image(
                source=source,
                url=url,
                local_path=filepath,
                search_query=search_query,
                width=width,
                height=height
            )

            session.add(image)
            session.commit()
            session.close()

        except Exception as e:
            logger.error(f"Error saving image to database: {e}")

    def create_placeholder_image(self, text='News', size=(1920, 1080)):
        """Create a placeholder image with text"""
        try:
            from PIL import Image as PILImage, ImageDraw, ImageFont

            # Create image
            img = PILImage.new('RGB', size, color=(30, 30, 30))
            draw = ImageDraw.Draw(img)

            # Add text
            try:
                font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 80)
            except:
                font = ImageFont.load_default()

            # Center text
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            x = (size[0] - text_width) / 2
            y = (size[1] - text_height) / 2

            draw.text((x, y), text, fill=(200, 200, 200), font=font)

            # Save
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'placeholder_{timestamp}.jpg'
            filepath = os.path.join(self.output_dir, filename)
            img.save(filepath)

            logger.info(f"Created placeholder image: {filepath}")
            return filepath

        except Exception as e:
            logger.error(f"Error creating placeholder image: {e}")
            return None

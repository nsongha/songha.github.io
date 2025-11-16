"""AI Script Generator for News Videos"""

import json
from openai import OpenAI
from backend.config_loader import config
from backend.utils import setup_logger

logger = setup_logger(__name__)


class ScriptGenerator:
    """Generate video scripts from news articles using AI"""

    def __init__(self):
        self.api_key = config.get('ai.api_key')
        self.model = config.get('ai.model', 'gpt-4-turbo-preview')
        self.temperature = config.get('ai.temperature', 0.7)
        self.max_tokens = config.get('ai.max_tokens', 2000)

        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            logger.warning("OpenAI API key not configured")
            self.client = None

    def generate_script(self, articles, video_date=None):
        """
        Generate a complete video script from news articles

        Args:
            articles: List of NewsArticle objects or dicts
            video_date: Date for the video (defaults to today)

        Returns:
            dict with structure:
            {
                'intro': str,  # Introduction summary
                'news_items': [  # List of news items
                    {
                        'title': str,
                        'script': str,
                        'duration': float (estimated seconds)
                    }
                ],
                'outro': str,  # Closing
                'total_duration': float (estimated seconds)
            }
        """
        if not self.client:
            logger.error("OpenAI client not initialized")
            return self._generate_fallback_script(articles)

        try:
            # Prepare news data
            news_data = self._prepare_news_data(articles)

            # Create prompt
            prompt = self._create_prompt(news_data, video_date)

            # Call OpenAI API
            logger.info("Generating script with AI...")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Bạn là một biên tập viên tin tức chuyên nghiệp, giỏi viết kịch bản cho video tin tức ngắn gọn, súc tích và hấp dẫn bằng tiếng Việt."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"}
            )

            # Parse response
            script_json = json.loads(response.choices[0].message.content)
            logger.info("Script generated successfully")

            return script_json

        except Exception as e:
            logger.error(f"Error generating script with AI: {e}")
            return self._generate_fallback_script(articles)

    def _prepare_news_data(self, articles):
        """Prepare news data for prompt"""
        news_list = []

        for i, article in enumerate(articles, 1):
            if hasattr(article, 'title'):
                # NewsArticle object
                news_list.append({
                    'index': i,
                    'title': article.title,
                    'summary': article.summary or '',
                    'content': article.content[:500] if article.content else '',  # Limit content length
                    'source': article.source,
                })
            else:
                # Dict
                news_list.append({
                    'index': i,
                    'title': article.get('title', ''),
                    'summary': article.get('summary', ''),
                    'content': article.get('content', '')[:500],
                    'source': article.get('source', ''),
                })

        return news_list

    def _create_prompt(self, news_data, video_date):
        """Create prompt for AI"""
        from datetime import datetime

        if video_date is None:
            video_date = datetime.now().strftime('%d/%m/%Y')

        prompt = f"""
Hãy tạo kịch bản cho video tin tức ngày {video_date} từ {len(news_data)} tin sau:

"""

        for news in news_data:
            prompt += f"""
TIN {news['index']}:
Tiêu đề: {news['title']}
Tóm tắt: {news['summary']}
Nội dung: {news['content']}
Nguồn: {news['source']}

"""

        prompt += """
YÊU CẦU:
1. Phần INTRO: Chào mừng và tóm tắt ngắn gọn các tin chính trong video (khoảng 20-30 giây đọc)
2. Mỗi tin: Viết kịch bản ngắn gọn, đủ thông tin chính, dễ hiểu (khoảng 30-45 giây đọc mỗi tin)
3. Phần OUTRO: Kết thúc, lời cảm ơn và kêu gọi theo dõi (khoảng 10-15 giây đọc)
4. Ngôn ngữ: Tiếng Việt chuẩn, tự nhiên, dễ nghe
5. Giọng điệu: Chuyên nghiệp nhưng thân thiện

Trả về JSON với cấu trúc:
{
  "intro": "Kịch bản phần mở đầu",
  "news_items": [
    {
      "title": "Tiêu đề tin",
      "script": "Kịch bản đọc cho tin này",
      "duration": 35
    }
  ],
  "outro": "Kịch bản phần kết",
  "total_duration": 300
}
"""

        return prompt

    def _generate_fallback_script(self, articles):
        """Generate simple fallback script without AI"""
        logger.info("Generating fallback script...")

        news_items = []
        total_duration = 0

        # Intro
        intro = f"Xin chào quý vị và các bạn! Đây là bản tin tổng hợp {len(articles)} tin tức nổi bật trong ngày hôm nay."
        total_duration += 10  # ~10 seconds

        # Process each article
        for article in articles:
            title = article.title if hasattr(article, 'title') else article.get('title', '')
            summary = article.summary if hasattr(article, 'summary') else article.get('summary', '')

            script = f"{title}. {summary}"
            duration = max(30, len(script) / 15)  # Rough estimate: ~15 chars per second

            news_items.append({
                'title': title,
                'script': script,
                'duration': duration
            })
            total_duration += duration

        # Outro
        outro = "Cảm ơn quý vị và các bạn đã theo dõi. Hẹn gặp lại trong những bản tin tiếp theo!"
        total_duration += 8  # ~8 seconds

        return {
            'intro': intro,
            'news_items': news_items,
            'outro': outro,
            'total_duration': total_duration
        }

    def estimate_duration(self, text):
        """Estimate speaking duration in seconds"""
        # Vietnamese: roughly 12-15 characters per second when spoken
        chars_per_second = 13
        return len(text) / chars_per_second

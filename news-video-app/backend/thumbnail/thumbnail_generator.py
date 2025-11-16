"""Thumbnail Generator for YouTube Videos"""

import os
from pathlib import Path
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from backend.config_loader import config
from backend.utils import setup_logger, ensure_dir

logger = setup_logger(__name__)


class ThumbnailGenerator:
    """Generate attractive thumbnails for YouTube videos"""

    def __init__(self):
        self.output_dir = ensure_dir('data/thumbnails')
        self.width = 1280
        self.height = 720

    def generate_thumbnail(self, title, date_str=None, background_image=None):
        """
        Generate thumbnail for video

        Args:
            title: Video title
            date_str: Date string (e.g., "16/11/2025")
            background_image: Optional background image path

        Returns:
            Path to generated thumbnail
        """
        try:
            # Create base image
            if background_image and os.path.exists(background_image):
                img = Image.open(background_image)
                img = img.resize((self.width, self.height), Image.Resampling.LANCZOS)

                # Apply blur and darken for text readability
                img = img.filter(ImageFilter.GaussianBlur(3))
                enhancer = ImageEnhance.Brightness(img)
                img = enhancer.enhance(0.5)  # Darken to 50%

            else:
                # Create gradient background
                img = self._create_gradient_background()

            draw = ImageDraw.Draw(img)

            # Add date badge if provided
            if date_str:
                self._add_date_badge(img, draw, date_str)

            # Add title text
            self._add_title_text(img, draw, title)

            # Add "TIN TỨC" banner
            self._add_news_banner(img, draw)

            # Add border
            self._add_border(img)

            # Save thumbnail
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'thumbnail_{timestamp}.jpg'
            output_path = os.path.join(self.output_dir, filename)

            img.save(output_path, quality=95, optimize=True)
            logger.info(f"Thumbnail generated: {output_path}")

            return output_path

        except Exception as e:
            logger.error(f"Error generating thumbnail: {e}")
            return None

    def _create_gradient_background(self):
        """Create gradient background"""
        # Create red to dark blue gradient (news theme)
        img = Image.new('RGB', (self.width, self.height))
        draw = ImageDraw.Draw(img)

        # Colors
        color_start = (220, 20, 60)  # Crimson red
        color_end = (25, 25, 112)    # Midnight blue

        for y in range(self.height):
            ratio = y / self.height
            r = int(color_start[0] + (color_end[0] - color_start[0]) * ratio)
            g = int(color_start[1] + (color_end[1] - color_start[1]) * ratio)
            b = int(color_start[2] + (color_end[2] - color_start[2]) * ratio)

            draw.rectangle([(0, y), (self.width, y+1)], fill=(r, g, b))

        return img

    def _add_date_badge(self, img, draw, date_str):
        """Add date badge to top-right corner"""
        # Badge dimensions
        badge_width = 200
        badge_height = 80
        x = self.width - badge_width - 30
        y = 30

        # Draw rounded rectangle for badge
        draw.rounded_rectangle(
            [(x, y), (x + badge_width, y + badge_height)],
            radius=10,
            fill=(255, 69, 0),  # Red-orange
            outline=(255, 255, 255),
            width=3
        )

        # Add date text
        try:
            font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 32)
        except:
            font = ImageFont.load_default()

        # Center text in badge
        bbox = draw.textbbox((0, 0), date_str, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        text_x = x + (badge_width - text_width) / 2
        text_y = y + (badge_height - text_height) / 2

        draw.text((text_x, text_y), date_str, fill=(255, 255, 255), font=font)

    def _add_title_text(self, img, draw, title):
        """Add main title text"""
        # Truncate title if too long
        max_chars = 60
        if len(title) > max_chars:
            title = title[:max_chars] + '...'

        # Try to break into 2-3 lines
        words = title.split()
        lines = []
        current_line = []
        max_width = self.width - 100  # Padding

        try:
            font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 60)
        except:
            font = ImageFont.load_default()

        for word in words:
            test_line = ' '.join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=font)
            if bbox[2] - bbox[0] <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]

        if current_line:
            lines.append(' '.join(current_line))

        # Draw text with shadow
        y_offset = self.height // 2 - len(lines) * 40

        for i, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            x = (self.width - text_width) / 2
            y = y_offset + i * 80

            # Shadow
            draw.text((x + 3, y + 3), line, fill=(0, 0, 0), font=font)
            # Main text
            draw.text((x, y), line, fill=(255, 255, 255), font=font)

    def _add_news_banner(self, img, draw):
        """Add 'TIN TỨC' banner at bottom"""
        banner_height = 100
        y = self.height - banner_height

        # Semi-transparent red banner
        overlay = Image.new('RGBA', (self.width, banner_height), (220, 20, 60, 200))
        img.paste(overlay, (0, y), overlay)

        # Add text
        try:
            font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 50)
        except:
            font = ImageFont.load_default()

        text = "TIN TỨC NỔI BẬT"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        x = (self.width - text_width) / 2
        text_y = y + (banner_height - text_height) / 2

        # Draw text with outline
        # Outline
        for offset_x in [-2, 0, 2]:
            for offset_y in [-2, 0, 2]:
                draw.text((x + offset_x, text_y + offset_y), text, fill=(0, 0, 0), font=font)
        # Main text
        draw.text((x, text_y), text, fill=(255, 255, 255), font=font)

    def _add_border(self, img):
        """Add border to thumbnail"""
        draw = ImageDraw.Draw(img)
        draw.rectangle(
            [(0, 0), (self.width-1, self.height-1)],
            outline=(255, 255, 255),
            width=5
        )

    def generate_from_video(self, video_path, title, date_str=None):
        """Generate thumbnail using a frame from the video"""
        try:
            import subprocess

            # Extract frame at 2 seconds
            temp_frame = os.path.join(self.output_dir, 'temp_frame.jpg')

            cmd = [
                'ffmpeg', '-y',
                '-i', video_path,
                '-ss', '2',  # 2 seconds in
                '-vframes', '1',
                temp_frame
            ]

            subprocess.run(cmd, check=True, capture_output=True)

            # Use this frame as background
            thumbnail = self.generate_thumbnail(title, date_str, temp_frame)

            # Clean up temp frame
            if os.path.exists(temp_frame):
                os.remove(temp_frame)

            return thumbnail

        except Exception as e:
            logger.error(f"Error generating thumbnail from video: {e}")
            # Fallback to regular thumbnail
            return self.generate_thumbnail(title, date_str)

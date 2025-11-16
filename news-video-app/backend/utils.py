"""Utility functions for News Video App"""

import os
import logging
from pathlib import Path
from datetime import datetime
import colorlog
from backend.config_loader import config


def setup_logger(name):
    """Set up a logger with color output"""
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger

    log_level = getattr(logging, config.get('logging.level', 'INFO'))
    logger.setLevel(log_level)

    # Console handler with colors
    console_handler = colorlog.StreamHandler()
    console_handler.setLevel(log_level)

    console_format = colorlog.ColoredFormatter(
        '%(log_color)s%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
        log_colors={
            'DEBUG': 'cyan',
            'INFO': 'green',
            'WARNING': 'yellow',
            'ERROR': 'red',
            'CRITICAL': 'red,bg_white',
        }
    )
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)

    # File handler
    log_file = config.get('logging.file')
    if log_file:
        Path(log_file).parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(log_level)

        file_format = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(file_format)
        logger.addHandler(file_handler)

    return logger


def ensure_dir(path):
    """Ensure directory exists"""
    Path(path).mkdir(parents=True, exist_ok=True)
    return path


def get_date_str(date=None, format='%Y-%m-%d'):
    """Get formatted date string"""
    if date is None:
        date = datetime.now()
    return date.strftime(format)


def clean_filename(filename):
    """Clean filename to be filesystem-safe"""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename[:200]  # Limit length


def format_duration(seconds):
    """Format duration in seconds to human readable format"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)

    if hours > 0:
        return f"{hours}h {minutes}m {secs}s"
    elif minutes > 0:
        return f"{minutes}m {secs}s"
    else:
        return f"{secs}s"


def truncate_text(text, max_length=100, suffix='...'):
    """Truncate text to max length"""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix

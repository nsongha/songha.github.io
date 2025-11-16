"""Configuration Loader for News Video App"""

import os
import yaml
from pathlib import Path
from dotenv import load_dotenv
from string import Template

# Load environment variables
load_dotenv()

class Config:
    """Configuration manager for the application"""

    def __init__(self, config_path="config/config.yaml"):
        self.base_dir = Path(__file__).parent.parent
        self.config_path = self.base_dir / config_path
        self.config = self._load_config()

    def _load_config(self):
        """Load and parse configuration file"""
        with open(self.config_path, 'r', encoding='utf-8') as f:
            config_content = f.read()

        # Replace environment variables
        config_content = self._replace_env_vars(config_content)

        # Parse YAML
        config = yaml.safe_load(config_content)

        # Convert relative paths to absolute
        self._resolve_paths(config)

        return config

    def _replace_env_vars(self, content):
        """Replace ${VAR} with environment variables"""
        template = Template(content)
        env_vars = {k: v for k, v in os.environ.items()}

        # Add empty defaults for optional vars
        defaults = {
            'OPENAI_API_KEY': '',
            'ANTHROPIC_API_KEY': '',
            'UNSPLASH_API_KEY': '',
            'PEXELS_API_KEY': '',
            'YOUTUBE_CHANNEL_ID': '',
        }
        defaults.update(env_vars)

        try:
            return template.safe_substitute(defaults)
        except KeyError as e:
            raise ValueError(f"Missing environment variable: {e}")

    def _resolve_paths(self, config):
        """Convert relative paths to absolute paths"""
        if 'assets' in config:
            for key, value in config['assets'].items():
                if isinstance(value, str) and not value.startswith('/'):
                    config['assets'][key] = str(self.base_dir / value)

        if 'database' in config and 'path' in config['database']:
            db_path = config['database']['path']
            if not db_path.startswith('/'):
                config['database']['path'] = str(self.base_dir / db_path)

        if 'logging' in config and 'file' in config['logging']:
            log_path = config['logging']['file']
            if not log_path.startswith('/'):
                config['logging']['file'] = str(self.base_dir / log_path)

    def get(self, key, default=None):
        """Get configuration value by dot notation (e.g., 'video.fps')"""
        keys = key.split('.')
        value = self.config

        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
                if value is None:
                    return default
            else:
                return default

        return value

    def __getitem__(self, key):
        """Allow dict-like access"""
        return self.config[key]

    def __contains__(self, key):
        """Allow 'in' operator"""
        return key in self.config


# Global config instance
config = Config()

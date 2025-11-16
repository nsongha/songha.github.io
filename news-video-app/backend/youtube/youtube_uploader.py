"""YouTube Upload Module"""

import os
import pickle
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from backend.config_loader import config
from backend.utils import setup_logger

logger = setup_logger(__name__)

# YouTube API scopes
SCOPES = ['https://www.googleapis.com/auth/youtube.upload']


class YouTubeUploader:
    """Upload videos to YouTube"""

    def __init__(self):
        self.client_secrets_file = config.get('youtube.client_secrets_file', 'config/client_secrets.json')
        self.credentials_file = config.get('youtube.credentials_file', 'config/youtube_credentials.json')
        self.channel_id = config.get('youtube.channel_id', '')

        self.youtube = None
        self._authenticate()

    def _authenticate(self):
        """Authenticate with YouTube API"""
        creds = None

        # Load saved credentials
        if os.path.exists(self.credentials_file):
            try:
                with open(self.credentials_file, 'rb') as token:
                    creds = pickle.load(token)
            except Exception as e:
                logger.warning(f"Could not load credentials: {e}")

        # Refresh or get new credentials
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                logger.info("Refreshing YouTube credentials...")
                creds.refresh(Request())
            else:
                if not os.path.exists(self.client_secrets_file):
                    logger.error(f"Client secrets file not found: {self.client_secrets_file}")
                    logger.error("Please download OAuth 2.0 credentials from Google Cloud Console")
                    return

                logger.info("Starting OAuth flow for YouTube...")
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.client_secrets_file, SCOPES
                )
                creds = flow.run_local_server(port=8080)

            # Save credentials
            with open(self.credentials_file, 'wb') as token:
                pickle.dump(creds, token)

        # Build YouTube service
        try:
            self.youtube = build('youtube', 'v3', credentials=creds)
            logger.info("YouTube API authenticated successfully")
        except Exception as e:
            logger.error(f"Error building YouTube service: {e}")

    def upload_video(self, video_path, title, description, tags=None,
                     thumbnail_path=None, category_id='25', privacy_status='public',
                     scheduled_time=None):
        """
        Upload video to YouTube

        Args:
            video_path: Path to video file
            title: Video title
            description: Video description
            tags: List of tags
            thumbnail_path: Path to thumbnail image
            category_id: YouTube category ID (25 = News & Politics)
            privacy_status: 'public', 'private', or 'unlisted'
            scheduled_time: datetime for scheduled publish (requires 'private' initially)

        Returns:
            dict with video ID and URL
        """
        if not self.youtube:
            logger.error("YouTube API not authenticated")
            return None

        if not os.path.exists(video_path):
            logger.error(f"Video file not found: {video_path}")
            return None

        try:
            # Prepare metadata
            body = {
                'snippet': {
                    'title': title[:100],  # Max 100 chars
                    'description': description[:5000],  # Max 5000 chars
                    'tags': tags[:500] if tags else [],  # Max 500 tags
                    'categoryId': category_id
                },
                'status': {
                    'privacyStatus': privacy_status,
                    'selfDeclaredMadeForKids': False,
                }
            }

            # Add scheduled time if provided
            if scheduled_time:
                body['status']['privacyStatus'] = 'private'  # Must be private initially
                body['status']['publishAt'] = scheduled_time.isoformat() + 'Z'

            # Upload video
            logger.info(f"Uploading video to YouTube: {title}")

            media = MediaFileUpload(
                video_path,
                mimetype='video/mp4',
                resumable=True,
                chunksize=1024*1024  # 1MB chunks
            )

            request = self.youtube.videos().insert(
                part='snippet,status',
                body=body,
                media_body=media
            )

            response = None
            while response is None:
                status, response = request.next_chunk()
                if status:
                    progress = int(status.progress() * 100)
                    logger.info(f"Upload progress: {progress}%")

            video_id = response['id']
            video_url = f'https://www.youtube.com/watch?v={video_id}'

            logger.info(f"Video uploaded successfully: {video_url}")

            # Upload thumbnail if provided
            if thumbnail_path and os.path.exists(thumbnail_path):
                self._upload_thumbnail(video_id, thumbnail_path)

            return {
                'id': video_id,
                'url': video_url,
                'title': title,
                'upload_time': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error uploading video to YouTube: {e}", exc_info=True)
            return None

    def _upload_thumbnail(self, video_id, thumbnail_path):
        """Upload custom thumbnail for video"""
        try:
            logger.info(f"Uploading thumbnail for video {video_id}")

            self.youtube.thumbnails().set(
                videoId=video_id,
                media_body=MediaFileUpload(thumbnail_path)
            ).execute()

            logger.info("Thumbnail uploaded successfully")

        except Exception as e:
            logger.error(f"Error uploading thumbnail: {e}")

    def update_video(self, video_id, title=None, description=None, tags=None, privacy_status=None):
        """Update video metadata"""
        if not self.youtube:
            logger.error("YouTube API not authenticated")
            return None

        try:
            # Get current video details
            video = self.youtube.videos().list(
                part='snippet,status',
                id=video_id
            ).execute()

            if not video['items']:
                logger.error(f"Video not found: {video_id}")
                return None

            current = video['items'][0]

            # Update fields
            if title:
                current['snippet']['title'] = title[:100]
            if description:
                current['snippet']['description'] = description[:5000]
            if tags:
                current['snippet']['tags'] = tags[:500]
            if privacy_status:
                current['status']['privacyStatus'] = privacy_status

            # Update video
            response = self.youtube.videos().update(
                part='snippet,status',
                body=current
            ).execute()

            logger.info(f"Video updated: {video_id}")
            return response

        except Exception as e:
            logger.error(f"Error updating video: {e}")
            return None

    def delete_video(self, video_id):
        """Delete video from YouTube"""
        if not self.youtube:
            logger.error("YouTube API not authenticated")
            return False

        try:
            self.youtube.videos().delete(id=video_id).execute()
            logger.info(f"Video deleted: {video_id}")
            return True

        except Exception as e:
            logger.error(f"Error deleting video: {e}")
            return False

    def get_video_stats(self, video_id):
        """Get video statistics"""
        if not self.youtube:
            logger.error("YouTube API not authenticated")
            return None

        try:
            response = self.youtube.videos().list(
                part='statistics',
                id=video_id
            ).execute()

            if response['items']:
                stats = response['items'][0]['statistics']
                return {
                    'views': int(stats.get('viewCount', 0)),
                    'likes': int(stats.get('likeCount', 0)),
                    'comments': int(stats.get('commentCount', 0)),
                }

            return None

        except Exception as e:
            logger.error(f"Error getting video stats: {e}")
            return None

    def list_my_videos(self, max_results=50):
        """List videos from the channel"""
        if not self.youtube:
            logger.error("YouTube API not authenticated")
            return []

        try:
            # Get uploads playlist ID
            channels = self.youtube.channels().list(
                part='contentDetails',
                mine=True
            ).execute()

            if not channels['items']:
                logger.error("No channel found")
                return []

            uploads_playlist_id = channels['items'][0]['contentDetails']['relatedPlaylists']['uploads']

            # Get videos from uploads playlist
            videos = []
            next_page_token = None

            while True:
                playlist_response = self.youtube.playlistItems().list(
                    part='snippet',
                    playlistId=uploads_playlist_id,
                    maxResults=min(max_results - len(videos), 50),
                    pageToken=next_page_token
                ).execute()

                videos.extend(playlist_response['items'])

                next_page_token = playlist_response.get('nextPageToken')
                if not next_page_token or len(videos) >= max_results:
                    break

            return videos

        except Exception as e:
            logger.error(f"Error listing videos: {e}")
            return []

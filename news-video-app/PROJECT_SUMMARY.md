# News Video Aggregator - Project Summary 📋

## Tổng Quan

Ứng dụng Python tự động hoá hoàn toàn quá trình:
1. Thu thập tin tức từ các trang báo lớn của Việt Nam
2. Tạo video tin tức chuyên nghiệp với AI
3. Upload lên YouTube theo lịch

## Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                     News Video App                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Crawlers   │───→│   Database   │←───│  Scheduler   │ │
│  │ VnExpress    │    │   SQLite     │    │  APScheduler │ │
│  │ Tuoi Tre     │    │              │    │              │ │
│  │ Thanh Nien   │    │              │    │              │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                    │         │
│         ↓                    ↓                    ↓         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           App Orchestrator (Main Logic)             │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                           │       │
│    ┌────┴────┐     ┌──────────┐     ┌─────────────┴────┐ │
│    │   AI    │     │   TTS    │     │  Video Generator │ │
│    │ OpenAI  │     │Edge TTS  │     │     FFmpeg       │ │
│    │  GPT-4  │     │Vietnamese│     │  Ken Burns FX    │ │
│    └─────────┘     └──────────┘     └──────────────────┘ │
│         │                  │                    │          │
│         ↓                  ↓                    ↓          │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Video Output Pipeline                   │ │
│  │  [Intro] → [News Segments] → [Outro]               │ │
│  │     + Voice Over + Background Music + Logo          │ │
│  └──────────────────────────────────────────────────────┘ │
│                          │                                 │
│                          ↓                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐ │
│  │  Thumbnail   │    │   YouTube    │    │    Web      │ │
│  │  Generator   │───→│   Uploader   │←───│  Dashboard  │ │
│  │   Pillow     │    │ YouTube API  │    │    Flask    │ │
│  └──────────────┘    └──────────────┘    └─────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Backend
- **Python 3.8+**: Core language
- **SQLAlchemy**: ORM for database
- **BeautifulSoup4 + Requests**: Web scraping
- **OpenAI API**: AI script generation
- **Edge TTS**: Text-to-speech (Vietnamese voices)
- **FFmpeg**: Video processing
- **Pillow**: Image processing
- **APScheduler**: Task scheduling
- **Google APIs**: YouTube upload

### Frontend
- **Flask**: Web framework
- **HTML/CSS/JavaScript**: Dashboard UI

### External Services
- **OpenAI GPT-4**: Script generation
- **Unsplash API**: Stock photos
- **Pexels API**: Stock photos (backup)
- **YouTube Data API v3**: Video upload
- **Edge TTS**: Voice synthesis

## Cấu Trúc Code

```
news-video-app/
├── backend/                    # Backend modules
│   ├── crawlers/              # News crawling
│   │   ├── base_crawler.py   # Base crawler class
│   │   ├── vnexpress_crawler.py
│   │   ├── tuoitre_crawler.py
│   │   ├── thanhnien_crawler.py
│   │   └── crawler_manager.py
│   ├── ai/                    # AI script generation
│   │   └── script_generator.py
│   ├── tts/                   # Text-to-Speech
│   │   └── tts_engine.py
│   ├── video/                 # Video generation
│   │   ├── video_generator.py
│   │   └── image_fetcher.py
│   ├── thumbnail/             # Thumbnail generation
│   │   └── thumbnail_generator.py
│   ├── youtube/               # YouTube upload
│   │   └── youtube_uploader.py
│   ├── scheduler/             # Task scheduling
│   │   └── task_scheduler.py
│   ├── database/              # Database models
│   │   └── models.py
│   ├── config_loader.py       # Configuration management
│   ├── utils.py               # Utilities
│   └── app_orchestrator.py    # Main orchestrator
├── frontend/                   # Web dashboard
│   ├── app.py                 # Flask application
│   └── templates/             # HTML templates
├── config/                    # Configuration files
│   └── config.yaml
├── assets/                    # Video assets
│   ├── intro/, outro/, music/, logo/
├── data/                      # Generated data
│   ├── videos/, thumbnails/, audio/, images/
├── main.py                    # Entry point
├── requirements.txt           # Python dependencies
├── README.md                  # Documentation
├── SETUP_GUIDE.md            # Setup instructions
└── quick_start.sh            # Quick start script
```

## Database Schema

### NewsArticle
- id, source, title, url, content, summary
- image_url, published_date, crawled_date
- category, tags, selected_for_video

### Video
- id, title, description, script, news_items
- thumbnail_path, video_path, audio_path, duration
- youtube_id, youtube_url, uploaded_to_youtube
- status, created_date, views, likes, comments

### Image
- id, news_article_id, source, url, local_path
- search_query, width, height

### Schedule
- id, video_id, scheduled_time, published

### AppLog
- id, level, module, message, details

## Workflow Chi Tiết

### 1. News Crawling (30-60s)
```python
CrawlerManager.crawl_all_sources()
  ├─ VnExpressCrawler.get_latest_news()
  ├─ TuoiTreCrawler.get_latest_news()
  └─ ThanhNienCrawler.get_latest_news()
  → Save to NewsArticle table
```

### 2. Top News Selection
```python
CrawlerManager.get_top_news_for_today()
  ├─ Score by recency
  ├─ Score by content quality
  ├─ Score by image availability
  └─ Select top 5-10 articles
```

### 3. Script Generation (30-60s)
```python
ScriptGenerator.generate_script(articles)
  ├─ Prepare news data
  ├─ Create AI prompt
  ├─ Call OpenAI GPT-4
  └─ Parse JSON response
  → Returns: {intro, news_items, outro}
```

### 4. Audio Generation (1-2min)
```python
TTSEngine.generate_script_audio(script)
  ├─ Generate intro audio
  ├─ Generate news items audio
  ├─ Generate outro audio
  └─ Combine all segments
  → Returns: combined audio file
```

### 5. Image Fetching
```python
ImageFetcher.fetch_image_for_news(article)
  ├─ Try article's own image
  ├─ Search Pexels with keywords
  ├─ Search Unsplash (backup)
  └─ Create placeholder (fallback)
```

### 6. Video Generation (3-5min)
```python
VideoGenerator.generate_video(script, audio, articles)
  ├─ Add intro video (if exists)
  ├─ For each news item:
  │   ├─ Fetch image
  │   ├─ Apply Ken Burns effect (random direction)
  │   └─ Sync with audio duration
  ├─ Add outro video (if exists)
  ├─ Combine all segments
  ├─ Add voiceover audio
  ├─ Add background music (15% volume)
  └─ Add logo watermark
  → Returns: final video file
```

### 7. Thumbnail Generation
```python
ThumbnailGenerator.generate_from_video(video, title, date)
  ├─ Extract frame from video
  ├─ Apply blur + darken
  ├─ Add title text
  ├─ Add date badge
  ├─ Add "TIN TỨC" banner
  └─ Add border
  → Returns: thumbnail file
```

### 8. YouTube Upload (1-3min)
```python
YouTubeUploader.upload_video(video, title, description, tags, thumbnail)
  ├─ Authenticate with OAuth2
  ├─ Upload video file (resumable)
  ├─ Upload custom thumbnail
  └─ Return video URL
```

## Ken Burns Effects

6 random directions cho dynamic videos:
1. **zoom_in**: Zoom từ 1.0x → 1.3x
2. **zoom_out**: Zoom từ 1.3x → 1.0x
3. **pan_left**: Pan từ phải → trái
4. **pan_right**: Pan từ trái → phải
5. **pan_up**: Pan từ dưới → trên
6. **pan_down**: Pan từ trên → dưới

## API Usage & Costs

### OpenAI API
- **Usage**: Script generation (~500 tokens/video)
- **Cost**: ~$0.03/video
- **Monthly**: ~$0.90 (30 videos)

### Unsplash API
- **Limit**: 50 requests/hour (free)
- **Usage**: ~5-10 images/video
- **Cost**: Free

### Pexels API
- **Limit**: 200 requests/hour (free)
- **Usage**: Backup for Unsplash
- **Cost**: Free

### YouTube API
- **Limit**: 10,000 quota units/day (free)
- **Usage**: ~1,600 units/upload
- **Daily Max**: ~6 videos

### Edge TTS
- **Limit**: Unlimited (free)
- **Quality**: High quality Vietnamese voices
- **Cost**: Free

## Performance Metrics

**Average Processing Time:**
- Crawl: 30-60s
- Script generation: 30-60s
- Audio generation: 60-120s
- Video generation: 180-300s
- Upload: 60-180s
- **Total: 10-15 minutes per video**

**Resource Usage:**
- CPU: Moderate (FFmpeg encoding)
- RAM: ~2-4GB during video generation
- Disk: ~500MB per video
- Bandwidth: ~200-500MB upload per video

## Configuration Options

### Video Settings
```yaml
video:
  news_per_video: 7
  duration_per_image: 3  # seconds
  resolution: {width: 1920, height: 1080}
  fps: 30
  codec: libx264
  bitrate: 8000k
```

### Audio Settings
```yaml
audio:
  tts_engine: edge-tts
  voice: vi-VN-HoaiMyNeural
  speech_rate: 1.0
  background_music_volume: 0.15
```

### Scheduler Settings
```yaml
scheduler:
  enabled: true
  daily_run_time: "18:00"
  timezone: Asia/Ho_Chi_Minh
```

## Error Handling

Các module có fallback mechanisms:
1. **Crawlers**: Skip failed sources, continue with available
2. **AI Script**: Fallback to template-based script
3. **Images**: Use article image → stock photos → placeholder
4. **Video**: Continue without intro/outro/music if missing
5. **Upload**: Retry with exponential backoff

## Extensibility

Dễ dàng mở rộng:
1. **Thêm news source**: Inherit `BaseCrawler`
2. **Thêm TTS engine**: Implement interface
3. **Thêm video effect**: Extend `VideoGenerator`
4. **Thêm image source**: Extend `ImageFetcher`
5. **Custom scheduling**: Use `TaskScheduler.add_custom_job()`

## Security & Privacy

- ✅ API keys trong `.env` (gitignored)
- ✅ OAuth credentials local only
- ✅ No user authentication (local app)
- ✅ Database local (SQLite)
- ⚠️ YouTube credentials encrypted by Google

## Future Enhancements

Potential improvements:
- [ ] Multi-language support
- [ ] Multiple YouTube channels
- [ ] Video analytics dashboard
- [ ] A/B testing for thumbnails
- [ ] Custom video templates
- [ ] Voice cloning
- [ ] Auto-generated captions
- [ ] Social media posting (Facebook, TikTok)

---

**Built with ❤️ for automated content creation**

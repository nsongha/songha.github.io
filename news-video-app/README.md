# News Video Aggregator 📰🎬

Ứng dụng tự động tổng hợp tin tức từ các trang báo điện tử lớn của Việt Nam và tạo video tin tức ngắn để upload lên YouTube.

## Tính Năng Chính

✅ **Tự động crawl tin tức** từ 3 trang tin lớn nhất VN (VnExpress, Tuổi Trẻ, Thanh Niên)
✅ **Tạo script tự động** bằng AI (OpenAI GPT-4)
✅ **Text-to-Speech** với giọng Việt Nam chất lượng cao (Edge TTS)
✅ **Tạo video tự động** với FFmpeg:
  - Hiệu ứng Ken Burns (zoom in/out, pan 6 hướng)
  - Intro/Outro video tùy chỉnh
  - Background music
  - Logo watermark
✅ **Tìm ảnh minh họa tự động** từ Unsplash/Pexels
✅ **Tạo thumbnail tự động**
✅ **Upload lên YouTube tự động**
✅ **Lịch đăng bài tự động** (scheduler)
✅ **Dashboard web** để quản lý

## Cấu Trúc Video

Mỗi video bao gồm:
1. **Intro**: Video giới thiệu (tùy chỉnh)
2. **Phần tóm tắt**: Voice-over giới thiệu các tin trong video
3. **5-10 tin chi tiết**: Mỗi tin có:
   - Ảnh minh họa (2-5 giây)
   - Hiệu ứng Ken Burns random
   - Voice-over đọc nội dung
4. **Outro**: Video kết thúc (tùy chỉnh)
5. **Background music** và **logo watermark** xuyên suốt

## Yêu Cầu Hệ Thống

- Python 3.8+
- FFmpeg (cho xử lý video)
- 4GB RAM khả dụng
- 10GB dung lượng đĩa (cho videos)

## Cài Đặt

### 1. Clone Repository

```bash
cd news-video-app
```

### 2. Cài Đặt Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Cài Đặt FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Tải từ: https://ffmpeg.org/download.html

### 4. Cấu Hình Environment Variables

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Chỉnh sửa `.env` với các API keys của bạn:

```env
# OpenAI API (cho script generation)
OPENAI_API_KEY=your_openai_api_key_here

# Image Sources (optional nhưng nên có)
UNSPLASH_API_KEY=your_unsplash_api_key_here
PEXELS_API_KEY=your_pexels_api_key_here

# YouTube
YOUTUBE_CHANNEL_ID=your_youtube_channel_id_here
```

### 5. Lấy API Keys

#### OpenAI API Key:
1. Đăng ký tại: https://platform.openai.com/
2. Vào API Keys → Create new secret key
3. Copy và paste vào `.env`

#### Unsplash API Key (free):
1. Đăng ký tại: https://unsplash.com/developers
2. Tạo app mới
3. Copy Access Key

#### Pexels API Key (free):
1. Đăng ký tại: https://www.pexels.com/api/
2. Copy API Key

#### YouTube API:
1. Vào: https://console.cloud.google.com/
2. Tạo project mới
3. Enable YouTube Data API v3
4. Tạo OAuth 2.0 credentials
5. Download `client_secrets.json` và đặt vào `config/`

### 6. Chuẩn Bị Assets

Đặt các file assets vào thư mục tương ứng:

```
assets/
├── intro/
│   └── intro.mp4          # Video intro (5-10 giây)
├── outro/
│   └── outro.mp4          # Video outro (5-10 giây)
├── music/
│   └── background.mp3     # Nhạc nền
└── logo/
    └── logo.png           # Logo (PNG với transparent background)
```

**Lưu ý:** Nếu không có assets, app vẫn chạy được nhưng không có intro/outro/music/logo.

### 7. Khởi Tạo Database

```bash
python main.py init-db
```

## Sử Dụng

### Chế Độ Command Line

#### Crawl tin tức:
```bash
python main.py crawl-news
```

#### Tạo video (tự động upload):
```bash
python main.py create-video
```

#### Tạo video (không upload):
```bash
python main.py create-video --no-upload
```

#### Chạy scheduler (tự động hàng ngày):
```bash
python main.py run-scheduler
```

### Chế Độ Web Dashboard

```bash
python main.py web-dashboard
```

Mở trình duyệt: http://localhost:5000

Dashboard cho phép:
- Xem thống kê tổng quan
- Tạo video thủ công
- Crawl tin tức
- Bật/tắt scheduler
- Xem danh sách videos
- Xem chi tiết từng video
- Upload video lên YouTube

## Cấu Hình

Chỉnh sửa file `config/config.yaml` để tùy chỉnh:

### Số lượng tin mỗi video:
```yaml
video:
  news_per_video: 7  # 5-10 tin
```

### Lịch đăng tự động:
```yaml
scheduler:
  enabled: true
  daily_run_time: "18:00"  # 6 PM mỗi ngày
  timezone: "Asia/Ho_Chi_Minh"
```

### Giọng đọc:
```yaml
audio:
  tts_engine: "edge-tts"
  voice: "vi-VN-HoaiMyNeural"  # Giọng nữ miền Bắc
  # Hoặc: "vi-VN-NamMinhNeural" (giọng nam)
```

### YouTube settings:
```yaml
youtube:
  default_title: "Tin Tức Nổi Bật Ngày {date}"
  privacy_status: "public"  # public, unlisted, private
  category_id: "25"  # News & Politics
```

## Workflow

```
1. CRAWL NEWS
   ├─ VnExpress RSS → Parse articles
   ├─ Tuổi Trẻ RSS → Parse articles
   └─ Thanh Niên RSS → Parse articles

2. SELECT TOP NEWS
   └─ Chọn 5-10 tin nổi bật nhất (dựa trên thời gian & nội dung)

3. GENERATE SCRIPT (AI)
   ├─ Tạo intro tóm tắt
   ├─ Viết script cho từng tin
   └─ Tạo outro

4. TEXT-TO-SPEECH
   └─ Chuyển script thành audio (Edge TTS)

5. FETCH IMAGES
   ├─ Dùng ảnh từ bài báo (nếu có)
   └─ Tìm ảnh stock từ Pexels/Unsplash

6. GENERATE VIDEO
   ├─ Thêm intro video
   ├─ Tạo segment cho mỗi tin (ảnh + Ken Burns effect)
   ├─ Thêm outro video
   ├─ Ghép voiceover audio
   ├─ Thêm background music
   └─ Thêm logo watermark

7. GENERATE THUMBNAIL
   └─ Tạo thumbnail từ video frame + text overlay

8. UPLOAD TO YOUTUBE
   ├─ Upload video
   ├─ Upload thumbnail
   └─ Set metadata (title, description, tags)
```

## Cấu Trúc Thư Mục

```
news-video-app/
├── backend/
│   ├── crawlers/         # Crawl tin tức
│   ├── ai/              # Script generation
│   ├── tts/             # Text-to-Speech
│   ├── video/           # Video generation
│   ├── thumbnail/       # Thumbnail generation
│   ├── youtube/         # YouTube upload
│   ├── scheduler/       # Task scheduling
│   └── database/        # Database models
├── frontend/            # Web dashboard
│   ├── templates/       # HTML templates
│   └── app.py          # Flask app
├── assets/             # Intro, outro, music, logo
├── data/               # Generated files
│   ├── news/          # Crawled news
│   ├── videos/        # Generated videos
│   ├── thumbnails/    # Generated thumbnails
│   ├── audio/         # TTS audio
│   └── images/        # Downloaded images
├── config/            # Configuration files
├── logs/              # Application logs
└── main.py           # Main entry point
```

## Troubleshooting

### FFmpeg không tìm thấy:
```bash
# Kiểm tra FFmpeg đã cài đúng chưa
ffmpeg -version
```

### Lỗi YouTube API:
- Kiểm tra `client_secrets.json` đã đúng chưa
- Lần đầu upload sẽ cần xác thực qua browser
- Credentials sẽ được lưu tự động cho lần sau

### Lỗi OpenAI API:
- Kiểm tra API key trong `.env`
- Đảm bảo tài khoản có credits
- Có thể dùng fallback script nếu không có OpenAI

### Video generation chậm:
- Điều chỉnh bitrate trong config: `video.bitrate: "5000k"`
- Giảm resolution: `video.resolution.width: 1280, height: 720`

### Không tìm được ảnh:
- Kiểm tra API keys của Unsplash/Pexels
- App sẽ dùng ảnh từ bài báo hoặc placeholder nếu không tìm được

## Performance

**Thời gian xử lý trung bình:**
- Crawl news: 30-60 giây
- Generate script (AI): 30-60 giây
- Generate audio (TTS): 1-2 phút
- Generate video: 3-5 phút (tùy số tin)
- Upload YouTube: 1-3 phút (tùy kích thước file)

**Tổng: ~10-15 phút** cho một video hoàn chỉnh

## License

MIT License - Sử dụng tự do cho mục đích cá nhân và thương mại.

## Credits

- **News Sources**: VnExpress, Tuổi Trẻ, Thanh Niên
- **AI**: OpenAI GPT-4
- **TTS**: Microsoft Edge TTS
- **Images**: Unsplash, Pexels
- **Video**: FFmpeg

## Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs tại `logs/app.log`
2. Kiểm tra config tại `config/config.yaml`
3. Đảm bảo đã cài đủ dependencies

---

**Chúc bạn sử dụng app thành công! 🎉**

# Hướng Dẫn Setup Chi Tiết 🚀

## Bước 1: Cài Đặt Python Dependencies

```bash
# Tạo virtual environment (khuyến nghị)
python -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Cài đặt packages
pip install -r requirements.txt
```

## Bước 2: Cài Đặt FFmpeg

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install ffmpeg
```

### macOS:
```bash
brew install ffmpeg
```

### Windows:
1. Tải FFmpeg từ: https://ffmpeg.org/download.html
2. Giải nén vào `C:\ffmpeg`
3. Thêm `C:\ffmpeg\bin` vào PATH

Kiểm tra:
```bash
ffmpeg -version
```

## Bước 3: Lấy API Keys

### 3.1. OpenAI API Key (Bắt buộc cho AI script generation)

1. Truy cập: https://platform.openai.com/
2. Đăng ký/Đăng nhập
3. Vào **API Keys** → **Create new secret key**
4. Copy key và lưu lại

**Chi phí:**
- GPT-4: ~$0.03/video (cho script generation)
- Gói $5 có thể tạo ~150 videos

### 3.2. Unsplash API Key (Miễn phí - cho ảnh stock)

1. Truy cập: https://unsplash.com/developers
2. Đăng ký tài khoản
3. Tạo ứng dụng mới: **New Application**
4. Điền thông tin:
   - Application name: News Video App
   - Description: Automated news video generator
5. Copy **Access Key**

**Giới hạn free:**
- 50 requests/hour
- Đủ cho ~10 videos/hour

### 3.3. Pexels API Key (Miễn phí - backup cho ảnh)

1. Truy cập: https://www.pexels.com/api/
2. Đăng ký tài khoản
3. Copy **API Key** từ dashboard

**Giới hạn free:**
- 200 requests/hour
- Unlimited videos

### 3.4. YouTube API Setup (Phức tạp nhất)

#### Bước 1: Tạo Google Cloud Project
1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới: **New Project**
   - Tên: News Video App
3. Chọn project vừa tạo

#### Bước 2: Enable YouTube Data API
1. Vào **APIs & Services** → **Library**
2. Tìm "YouTube Data API v3"
3. Click **Enable**

#### Bước 3: Tạo OAuth 2.0 Credentials
1. Vào **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Nếu chưa có OAuth consent screen:
   - Click **Configure Consent Screen**
   - Chọn **External** → **Create**
   - Điền:
     - App name: News Video App
     - User support email: your@email.com
     - Developer contact: your@email.com
   - **Save and Continue** × 3 lần
   - **Back to Dashboard**

4. Quay lại **Credentials** → **Create OAuth client ID**
5. Chọn:
   - Application type: **Desktop app**
   - Name: News Video Desktop
6. Click **Create**

7. **Download JSON**
   - Click nút download (⬇️)
   - Đổi tên file thành `client_secrets.json`
   - Copy vào thư mục `config/`

#### Bước 4: Xác thực lần đầu
```bash
# Chạy lần đầu sẽ mở browser để xác thực
python main.py create-video --no-upload

# Sau khi xác thực, credentials sẽ được lưu tự động
# File: config/youtube_credentials.json
```

**Giới hạn:**
- Free: 10,000 quota units/day
- 1 upload = ~1,600 units
- Đủ cho ~6 videos/day

## Bước 4: Cấu Hình .env File

Tạo file `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
# OpenAI (BẮT BUỘC)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Unsplash (Khuyến nghị)
UNSPLASH_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Pexels (Khuyến nghị)
PEXELS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# YouTube Channel ID (Tùy chọn - tự động detect)
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxx

# Flask (Tùy chọn)
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
```

## Bước 5: Chuẩn Bị Assets

### 5.1. Tạo Intro Video (Tùy chọn)

**Yêu cầu:**
- Thời lượng: 5-10 giây
- Resolution: 1920x1080 (Full HD)
- Format: MP4
- Content: Logo + text "Tin Tức Hôm Nay"

**Công cụ tạo:**
- Canva: https://www.canva.com/ (miễn phí)
- Clipchamp: https://clipchamp.com/
- DaVinci Resolve (chuyên nghiệp)

**Đặt vào:** `assets/intro/intro.mp4`

### 5.2. Tạo Outro Video (Tùy chọn)

**Yêu cầu:**
- Thời lượng: 5-8 giây
- Resolution: 1920x1080
- Format: MP4
- Content: "Cảm ơn đã xem" + Subscribe button

**Đặt vào:** `assets/outro/outro.mp4`

### 5.3. Background Music (Tùy chọn)

**Nguồn nhạc miễn phí bản quyền:**
- YouTube Audio Library
- Pixabay Music: https://pixabay.com/music/
- Incompetech: https://incompetech.com/

**Yêu cầu:**
- Nhạc không lời (instrumental)
- Nhịp điệu vừa phải (không quá nhanh/chậm)
- Format: MP3

**Đặt vào:** `assets/music/background.mp3`

### 5.4. Logo (Tùy chọn)

**Yêu cầu:**
- Format: PNG với transparent background
- Kích thước: 200-400px
- Logo kênh YouTube của bạn

**Công cụ tạo:**
- Canva
- LogoMakr: https://logomakr.com/

**Đặt vào:** `assets/logo/logo.png`

**Lưu ý:** Nếu không có assets, app vẫn chạy bình thường, chỉ thiếu intro/outro/music/logo.

## Bước 6: Khởi Tạo Database

```bash
python main.py init-db
```

Expected output:
```
2024-01-15 10:00:00 - backend.database.models - INFO - Creating all tables
2024-01-15 10:00:00 - __main__ - INFO - Database initialized successfully!
```

## Bước 7: Test Crawl

Test crawl tin tức:

```bash
python main.py crawl-news
```

Expected output:
```
2024-01-15 10:01:00 - backend.crawlers.crawler_manager - INFO - Starting crawl from all sources...
2024-01-15 10:01:05 - backend.crawlers.vnexpress_crawler - INFO - Fetching latest news from VnExpress
2024-01-15 10:01:10 - backend.crawlers.tuoitre_crawler - INFO - Fetching latest news from Tuoi Tre
2024-01-15 10:01:15 - backend.crawlers.thanhnien_crawler - INFO - Fetching latest news from Thanh Nien
2024-01-15 10:01:20 - backend.crawlers.crawler_manager - INFO - Total articles crawled: 60
2024-01-15 10:01:22 - backend.crawlers.crawler_manager - INFO - Saved 60 new articles, updated 0 articles
```

## Bước 8: Test Tạo Video (Không Upload)

```bash
python main.py create-video --no-upload
```

**Thời gian:** ~10-15 phút

Expected output sẽ show từng bước:
1. ✅ Crawling news
2. ✅ Selecting top news
3. ✅ Generating script with AI
4. ✅ Generating audio
5. ✅ Generating video
6. ✅ Generating thumbnail
7. ✅ Skipping YouTube upload

## Bước 9: Upload Thử Lên YouTube

Lần đầu tiên cần xác thực:

```bash
python main.py create-video
```

1. Browser sẽ tự động mở
2. Đăng nhập tài khoản Google (có kênh YouTube)
3. Click **Allow** để cấp quyền
4. Đóng browser
5. App sẽ tiếp tục upload

## Bước 10: Chạy Web Dashboard

```bash
python main.py web-dashboard
```

Mở: http://localhost:5000

Dashboard có:
- 📊 Thống kê
- 🎬 Tạo video
- 📡 Crawl news
- ▶️ Bật/tắt scheduler
- 📺 Xem danh sách videos

## Bước 11: Setup Scheduler (Tự động hàng ngày)

### Chỉnh sửa thời gian chạy:

File: `config/config.yaml`

```yaml
scheduler:
  enabled: true
  daily_run_time: "18:00"  # 6 PM mỗi ngày
  timezone: "Asia/Ho_Chi_Minh"
```

### Chạy scheduler:

```bash
python main.py run-scheduler
```

Hoặc dùng systemd (Linux) để chạy background:

```bash
# Tạo service file
sudo nano /etc/systemd/system/news-video-app.service
```

Nội dung:
```ini
[Unit]
Description=News Video App Scheduler
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/news-video-app
ExecStart=/path/to/venv/bin/python main.py run-scheduler
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable và start:
```bash
sudo systemctl enable news-video-app
sudo systemctl start news-video-app
sudo systemctl status news-video-app
```

## Troubleshooting Phổ Biến

### 1. Lỗi "OpenAI API key not configured"
→ Kiểm tra `.env` file có `OPENAI_API_KEY` chưa

### 2. Lỗi "FFmpeg not found"
→ Cài FFmpeg và thêm vào PATH

### 3. Lỗi YouTube upload
→ Kiểm tra `client_secrets.json` đúng chưa
→ Xóa `youtube_credentials.json` và xác thực lại

### 4. Video generation chậm
→ Giảm bitrate trong config
→ Giảm resolution xuống 720p

### 5. Không tìm được ảnh
→ Kiểm tra Unsplash/Pexels API keys
→ App vẫn chạy được với ảnh placeholder

### 6. Scheduler không chạy
→ Kiểm tra timezone trong config
→ Kiểm tra logs: `tail -f logs/app.log`

## Tips & Best Practices

1. **Test trước khi chạy tự động:**
   - Tạo vài video thử bằng tay
   - Kiểm tra chất lượng
   - Điều chỉnh config

2. **Monitoring:**
   - Kiểm tra logs thường xuyên
   - Theo dõi YouTube quota
   - Backup database định kỳ

3. **Optimization:**
   - Giảm bitrate nếu file quá lớn
   - Dùng cron thay vì scheduler nếu cần
   - Cache images để tái sử dụng

4. **Content Quality:**
   - Chỉnh voice trong config (thử các giọng khác)
   - Thêm intro/outro chuyên nghiệp
   - Dùng nhạc nền phù hợp

---

**Chúc bạn setup thành công! 🎉**

Nếu gặp vấn đề, check logs tại `logs/app.log`

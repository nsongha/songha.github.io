#!/bin/bash
# Quick Start Script for News Video App

echo "=========================================="
echo "  News Video Aggregator - Quick Start"
echo "=========================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi
echo "✅ Python found: $(python3 --version)"

# Check FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg not found. Please install FFmpeg"
    echo "   Ubuntu: sudo apt install ffmpeg"
    echo "   macOS: brew install ffmpeg"
    exit 1
fi
echo "✅ FFmpeg found: $(ffmpeg -version | head -n1)"

# Check .env file
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your API keys:"
    echo "   nano .env"
    echo ""
    echo "Required API keys:"
    echo "  - OPENAI_API_KEY (get from: https://platform.openai.com/)"
    echo "  - UNSPLASH_API_KEY (get from: https://unsplash.com/developers)"
    echo "  - PEXELS_API_KEY (get from: https://www.pexels.com/api/)"
    echo ""
    read -p "Press Enter after configuring .env file..."
fi

# Check virtual environment
if [ ! -d "venv" ]; then
    echo ""
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo ""
echo "Installing Python dependencies..."
pip install -q -r requirements.txt
echo "✅ Dependencies installed"

# Initialize database
echo ""
echo "Initializing database..."
python main.py init-db

# Test crawl
echo ""
echo "=========================================="
echo "  Testing News Crawl"
echo "=========================================="
read -p "Do you want to test crawl news? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python main.py crawl-news
fi

# Offer to start dashboard
echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "What would you like to do?"
echo "  1) Start Web Dashboard (recommended for first-time)"
echo "  2) Create a video now"
echo "  3) Run scheduler"
echo "  4) Exit"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Starting web dashboard..."
        echo "Access at: http://localhost:5000"
        python main.py web-dashboard
        ;;
    2)
        echo ""
        read -p "Upload to YouTube? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            python main.py create-video
        else
            python main.py create-video --no-upload
        fi
        ;;
    3)
        echo ""
        echo "Starting scheduler..."
        python main.py run-scheduler
        ;;
    *)
        echo "Exiting. To start later, run:"
        echo "  source venv/bin/activate"
        echo "  python main.py web-dashboard"
        ;;
esac

# 🚀 Video Processor Deployment Guide

## Quick Deploy to Render

### Step 1: Create GitHub Repository
```bash
# Initialize git and push to GitHub
git init
git add .
git commit -m "Initial video processor deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/video-processor.git
git push -u origin main
```

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Use these settings:
   - **Name**: `video-processor`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements_render.txt`
   - **Start Command**: `python ultimate_video_processor.py`
   - **Plan**: `Starter` (or higher for better performance)

### Step 3: Test Your Deployment
```bash
# Test health check
curl "https://your-app-name.onrender.com/health"

# Test video download
curl "https://your-app-name.onrender.com/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Test with your restricted video
curl "https://your-app-name.onrender.com/download?url=https://youtu.be/ZAGxqOT2l2U?si=uB03UNTGKGzgIJ7L&use_cookies=true"
```

## 🎯 Why This Will Work Better Than the VM:

1. **Different IP Range**: Render IPs are less likely to be blocked
2. **Multiple Bypass Techniques**: Automatic fallback methods
3. **Browser Automation**: Selenium can handle restricted content
4. **Auto-scaling**: Handles multiple requests efficiently
5. **Better Performance**: Optimized for cloud deployment

## 📊 Supported Platforms:
- ✅ YouTube (including age-restricted)
- ✅ Vimeo
- ✅ Dailymotion
- ✅ Bilibili
- ✅ Other platforms via yt-dlp

## 🔧 Advanced Usage:
```bash
# Force specific method
curl "https://your-app.onrender.com/download?url=VIDEO_URL&method=alternative"

# Use cookies for restricted content
curl "https://your-app.onrender.com/download?url=VIDEO_URL&use_cookies=true"

# Check supported platforms
curl "https://your-app.onrender.com/platforms"
```

## 🛠️ Troubleshooting:
- If downloads fail, check Render logs
- Try different methods: `method=yt-dlp` or `method=alternative`
- For restricted videos, always use `use_cookies=true` 
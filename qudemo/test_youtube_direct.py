#!/usr/bin/env python3
"""
Test YouTube download with browser cookies
"""

import yt_dlp
import tempfile
import os

def test_youtube_with_browser_cookies():
    """Test YouTube download using browser cookies"""
    
    # Your restricted video URL
    url = "https://youtu.be/ZAGxqOT2l2U?si=uB03UNTGKGzgIJ7L"
    
    # Create temp file
    temp_fd, temp_file = tempfile.mkstemp(suffix='.mp4')
    os.close(temp_fd)
    
    print(f"🎬 Testing YouTube download: {url}")
    print(f"📁 Temp file: {temp_file}")
    
    # yt-dlp options with browser cookies
    ydl_opts = {
        'format': 'best[height<=720]',
        'outtmpl': temp_file.replace('.mp4', '.%(ext)s'),
        'quiet': False,
        'no_warnings': False,
        
        # Use browser cookies (Chrome/Edge/Firefox)
        'cookiesfrombrowser': ('chrome',),  # or 'edge', 'firefox', 'safari'
        
        # Anti-bot measures
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        },
        
        # Additional options
        'sleep_interval': 2,
        'max_sleep_interval': 5,
        'retries': 3,
    }
    
    try:
        print("🔄 Starting download...")
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            
        print(f"✅ Download completed!")
        print(f"📹 Title: {info.get('title', 'Unknown')}")
        print(f"⏱️ Duration: {info.get('duration', 'Unknown')} seconds")
        
        # Check if file was downloaded
        base_name = temp_file.replace('.mp4', '')
        for ext in ['.mp4', '.webm', '.mkv', '.avi', '.mov', '.flv']:
            test_file = base_name + ext
            if os.path.exists(test_file):
                size = os.path.getsize(test_file)
                print(f"📁 Downloaded file: {test_file} (size: {size} bytes)")
                return True
        
        print("❌ No video file found after download")
        return False
        
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing YouTube download with browser cookies...")
    success = test_youtube_with_browser_cookies()
    
    if success:
        print("\n🎉 YouTube download test successful!")
        print("✅ Your browser cookies are working correctly.")
    else:
        print("\n❌ YouTube download test failed.")
        print("💡 Try updating your browser cookies or using a different browser.") 
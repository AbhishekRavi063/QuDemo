#!/usr/bin/env python3
"""
Enhanced YouTube Download Flask App
Multiple anti-bot bypass techniques
"""

import os
import tempfile
import logging
import random
import time
from flask import Flask, request, send_file, jsonify
import yt_dlp
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Global variable to track active downloads
active_downloads = {}
download_lock = threading.Lock()

def cleanup_temp_file(file_path):
    """Safely remove temporary file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up temporary file: {file_path}")
    except Exception as e:
        logger.error(f"Error cleaning up {file_path}: {e}")

def get_anti_bot_headers():
    """Generate realistic browser headers"""
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    ]
    
    return {
        'User-Agent': random.choice(user_agents),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
    }

def download_video_enhanced(url, use_cookies=False, retry_count=0):
    """Enhanced download with multiple anti-bot techniques"""
    temp_file = None
    max_retries = 3
    
    try:
        # Create temporary file
        temp_fd, temp_file = tempfile.mkstemp(suffix='.mp4', dir='/tmp')
        os.close(temp_fd)
        
        # Random delay to avoid rate limiting
        time.sleep(random.uniform(1, 3))
        
        # Enhanced yt-dlp options with multiple bypass techniques
        ydl_opts = {
            'format': 'best[height<=720]/best',
            'outtmpl': temp_file.replace('.mp4', '.%(ext)s'),
            'quiet': False,
            'no_warnings': False,
            
            # Anti-bot headers
            'http_headers': get_anti_bot_headers(),
            
            # Advanced extractor arguments
            'extractor_args': {
                'youtube': {
                    'player_client': ['android', 'web', 'mweb'],
                    'player_skip': ['webpage', 'configs'],
                    'player_params': {'hl': 'en', 'gl': 'US'},
                }
            },
            
            # Rate limiting and delays
            'sleep_interval': random.randint(2, 5),
            'max_sleep_interval': random.randint(5, 10),
            'retries': 5,
            'fragment_retries': 5,
            
            # Cookie handling
            'cookiesfrombrowser': None,
            
            # Additional anti-detection
            'nocheckcertificate': True,
            'ignoreerrors': False,
            'no_color': True,
            
            # Format selection fallbacks
            'format_sort': ['res:720', 'ext:mp4:m4a', 'hasvid', 'hasaud'],
            'format_sort_force': True,
        }
        
        # Add cookies if requested
        if use_cookies:
            cookies_file = '/opt/ytapp/youtube_cookies.txt'
            if os.path.exists(cookies_file):
                ydl_opts['cookiefile'] = cookies_file
                logger.info("Using cookies file for download")
            else:
                logger.warning("Cookies requested but file not found")
        
        # Download with retry logic
        logger.info(f"Starting download (attempt {retry_count + 1}): {url}")
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            
        # Check for downloaded file
        downloaded_file = None
        base_name = temp_file.replace('.mp4', '')
        
        # Check for various extensions
        for ext in ['.mp4', '.webm', '.mkv', '.avi', '.mov', '.flv']:
            test_file = base_name + ext
            if os.path.exists(test_file) and os.path.getsize(test_file) > 1000:  # At least 1KB
                downloaded_file = test_file
                break
        
        # Handle mhtml files (webpage snapshots)
        if not downloaded_file:
            mhtml_file = base_name + '.mhtml'
            if os.path.exists(mhtml_file):
                logger.error(f"Downloaded mhtml file instead of video: {mhtml_file}")
                if retry_count < max_retries:
                    logger.info(f"Retrying download (attempt {retry_count + 2})")
                    return download_video_enhanced(url, use_cookies, retry_count + 1)
                else:
                    raise Exception("Download failed - got webpage snapshot instead of video")
        
        if not downloaded_file:
            if retry_count < max_retries:
                logger.info(f"Retrying download (attempt {retry_count + 2})")
                return download_video_enhanced(url, use_cookies, retry_count + 1)
            else:
                raise Exception("Download failed - no valid file found after all retries")
            
        logger.info(f"Download completed: {downloaded_file} (size: {os.path.getsize(downloaded_file)})")
        return downloaded_file, info.get('title', 'Unknown Title')
        
    except Exception as e:
        if temp_file and os.path.exists(temp_file):
            cleanup_temp_file(temp_file)
        
        # Retry on certain errors
        if retry_count < max_retries and any(keyword in str(e).lower() for keyword in ['precondition', 'signature', 'extraction']):
            logger.info(f"Retrying due to error: {str(e)}")
            time.sleep(random.uniform(5, 10))  # Longer delay before retry
            return download_video_enhanced(url, use_cookies, retry_count + 1)
        
        raise e

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'youtube-download-enhanced',
        'timestamp': time.time()
    })

@app.route('/download', methods=['GET'])
def download():
    """Enhanced download endpoint"""
    url = request.args.get('url')
    use_cookies = request.args.get('use_cookies', 'false').lower() == 'true'
    
    if not url:
        return jsonify({'error': 'URL parameter is required'}), 400
    
    # Validate URL
    if 'youtube.com' not in url and 'youtu.be' not in url:
        return jsonify({'error': 'Only YouTube URLs are supported'}), 400
    
    # Check for concurrent downloads
    with download_lock:
        if url in active_downloads:
            return jsonify({'error': 'Download already in progress for this URL'}), 409
        active_downloads[url] = True
    
    temp_file = None
    try:
        # Download the video with enhanced anti-bot measures
        temp_file, title = download_video_enhanced(url, use_cookies)
        
        # Send the file
        response = send_file(
            temp_file,
            as_attachment=True,
            download_name=f"{title[:50]}.mp4",
            mimetype='video/mp4'
        )
        
        # Add cleanup callback
        @response.call_on_close
        def cleanup():
            cleanup_temp_file(temp_file)
            with download_lock:
                active_downloads.pop(url, None)
        
        return response
        
    except Exception as e:
        # Clean up on error
        if temp_file:
            cleanup_temp_file(temp_file)
        with download_lock:
            active_downloads.pop(url, None)
        
        logger.error(f"Download error: {str(e)}")
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/status', methods=['GET'])
def status():
    """Get current download status"""
    with download_lock:
        active_count = len(active_downloads)
    
    return jsonify({
        'active_downloads': active_count,
        'active_urls': list(active_downloads.keys())
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False) 
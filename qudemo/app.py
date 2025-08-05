#!/usr/bin/env python3
"""
YouTube Download Flask App
Provides a simple API to download YouTube videos using yt-dlp
"""

import os
import tempfile
import logging
from flask import Flask, request, send_file, jsonify
import yt_dlp
import threading
import time

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

def download_video(url, use_cookies=False):
    """Download video using yt-dlp"""
    temp_file = None
    try:
        # Create temporary file in /tmp with proper permissions
        temp_fd, temp_file = tempfile.mkstemp(suffix='.mp4', dir='/tmp')
        os.close(temp_fd)
        
        # yt-dlp options with anti-bot bypass measures
        ydl_opts = {
            'format': 'best[height<=720]/best',  # Use best quality up to 720p
            'outtmpl': temp_file.replace('.mp4', '.%(ext)s'),
            'quiet': False,
            'no_warnings': False,
            
            # Anti-bot bypass measures
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-us,en;q=0.5',
                'Accept-Encoding': 'gzip,deflate',
                'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
            
            # Additional anti-detection measures
            'extractor_args': {
                'youtube': {
                    'player_client': ['android'],
                    'player_skip': ['webpage', 'configs'],
                }
            },
            
            # Rate limiting and delays
            'sleep_interval': 1,
            'max_sleep_interval': 5,
            'retries': 3,
            
            # Cookie handling
            'cookiesfrombrowser': None,  # Disable browser cookie extraction
        }
        
        # Add cookies if requested and available
        if use_cookies:
            cookies_file = '/opt/ytapp/youtube_cookies.txt'
            if os.path.exists(cookies_file):
                ydl_opts['cookiefile'] = cookies_file
                logger.info("Using cookies file for download")
            else:
                logger.warning("Cookies requested but file not found")
        
        # Download the video
        logger.info(f"Starting download: {url}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            
        # Check if file was downloaded (yt-dlp might change extension)
        downloaded_file = None
        base_name = temp_file.replace('.mp4', '')
        
        # Check for various possible extensions
        for ext in ['.mp4', '.webm', '.mkv', '.avi', '.mov', '.flv']:
            test_file = base_name + ext
            if os.path.exists(test_file) and os.path.getsize(test_file) > 0:
                downloaded_file = test_file
                break
        
        # If no video file found, check for mhtml (webpage snapshot)
        if not downloaded_file:
            mhtml_file = base_name + '.mhtml'
            if os.path.exists(mhtml_file):
                logger.error(f"Downloaded mhtml file instead of video: {mhtml_file}")
                raise Exception("Download failed - got webpage snapshot instead of video")
        
        if not downloaded_file:
            raise Exception("Download failed - no valid file found")
            
        logger.info(f"Download completed: {downloaded_file} (size: {os.path.getsize(downloaded_file)})")
        return downloaded_file, info.get('title', 'Unknown Title')
        
    except Exception as e:
        if temp_file and os.path.exists(temp_file):
            cleanup_temp_file(temp_file)
        raise e

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'youtube-download',
        'timestamp': time.time()
    })

@app.route('/download', methods=['GET'])
def download():
    """Download YouTube video endpoint"""
    url = request.args.get('url')
    use_cookies = request.args.get('use_cookies', 'false').lower() == 'true'
    
    if not url:
        return jsonify({'error': 'URL parameter is required'}), 400
    
    # Validate URL (basic check)
    if 'youtube.com' not in url and 'youtu.be' not in url:
        return jsonify({'error': 'Only YouTube URLs are supported'}), 400
    
    # Check if download is already in progress
    with download_lock:
        if url in active_downloads:
            return jsonify({'error': 'Download already in progress for this URL'}), 409
        active_downloads[url] = True
    
    temp_file = None
    try:
        # Download the video
        temp_file, title = download_video(url, use_cookies)
        
        # Send the file
        response = send_file(
            temp_file,
            as_attachment=True,
            download_name=f"{title[:50]}.mp4",  # Limit filename length
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
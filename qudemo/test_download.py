#!/usr/bin/env python3
import yt_dlp
import os
import tempfile

def test_download():
    # Test the restricted video
    url = "https://youtu.be/ZAGxqOT2l2U?si=uB03UNTGKGzgIJ7L"
    
    # Create temp file
    temp_fd, temp_file = tempfile.mkstemp(suffix='.mp4')
    os.close(temp_fd)
    
    print(f"Temp file: {temp_file}")
    
    # First, let's see what formats are available
    print("Checking available formats...")
    ydl_opts = {
        'quiet': False,
        'no_warnings': False,
        'cookiefile': '/opt/ytapp/youtube_cookies.txt',  # Use cookies
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = info.get('formats', [])
            print(f"Available formats: {len(formats)}")
            
            # Find a good format to download
            good_formats = []
            for fmt in formats:
                if fmt.get('ext') in ['mp4', 'webm'] and fmt.get('filesize') and fmt.get('filesize') > 0:
                    good_formats.append(fmt)
            
            print(f"Good formats found: {len(good_formats)}")
            for fmt in good_formats[:10]:  # Show first 10 good formats
                print(f"  Format {fmt.get('format_id', 'N/A')}: {fmt.get('ext', 'N/A')} - {fmt.get('resolution', 'N/A')} - {fmt.get('filesize', 'N/A')} bytes")
            
            if good_formats:
                # Use the first good format
                format_id = good_formats[0]['format_id']
                print(f"Using format: {format_id}")
            else:
                print("No good formats found, using default")
                format_id = None
                
    except Exception as e:
        print(f"Error getting formats: {e}")
        format_id = None
    
    # Now try download with specific format
    if format_id:
        ydl_opts = {
            'format': format_id,
            'outtmpl': temp_file.replace('.mp4', '.%(ext)s'),
            'quiet': False,
            'no_warnings': False,
            'cookiefile': '/opt/ytapp/youtube_cookies.txt',  # Use cookies
        }
    else:
        ydl_opts = {
            'format': 'best[height<=480]',  # Try lower quality
            'outtmpl': temp_file.replace('.mp4', '.%(ext)s'),
            'quiet': False,
            'no_warnings': False,
            'cookiefile': '/opt/ytapp/youtube_cookies.txt',  # Use cookies
        }
    
    print(f"yt-dlp options: {ydl_opts}")
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print("Starting download...")
            info = ydl.extract_info(url, download=True)
            print(f"Download completed. Info: {info.get('title', 'Unknown')}")
            
        # Check what files exist
        base_name = temp_file.replace('.mp4', '')
        print(f"Base name: {base_name}")
        
        for ext in ['.mp4', '.webm', '.mkv', '.avi']:
            test_file = base_name + ext
            if os.path.exists(test_file):
                size = os.path.getsize(test_file)
                print(f"Found file: {test_file} (size: {size})")
            else:
                print(f"File not found: {test_file}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_download() 
#!/usr/bin/env python3
import yt_dlp

def test_formats():
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    
    ydl_opts = {
        'quiet': False,
        'no_warnings': False,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print("Extracting video info...")
            info = ydl.extract_info(url, download=False)
            formats = info.get('formats', [])
            
            print(f"Available formats: {len(formats)}")
            print("First 15 formats:")
            
            for i, fmt in enumerate(formats[:15]):
                format_id = fmt.get('format_id', 'N/A')
                ext = fmt.get('ext', 'N/A')
                resolution = fmt.get('resolution', 'N/A')
                filesize = fmt.get('filesize', 'N/A')
                print(f"  {i+1}. {format_id}: {ext} - {resolution} - {filesize} bytes")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_formats() 
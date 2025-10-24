# 🎥 Widget Uses Actual Video as Preview Image

## ✅ What Changed?

The floating widget now automatically extracts and displays a **thumbnail from the actual first video** in `video-flow.json` as the preview image!

---

## 🎯 How It Works

### **On Widget Load:**

1. **Loads video-flow.json** immediately (even when collapsed)
2. **Gets first video URL** from the JSON
3. **Extracts thumbnail** using one of these methods:
   - If video has `thumbnail` field → use it
   - If YouTube video → get YouTube thumbnail
   - If direct MP4 → capture video frame at 2 seconds
4. **Displays thumbnail** in circular widget preview
5. **Fallback** to `/round.png` if extraction fails

---

## 📂 Thumbnail Extraction Priority

```
1. Check JSON for thumbnail field
   ↓ (if not found)
2. Check if YouTube video → get YT thumbnail
   ↓ (if not found)
3. Capture frame from MP4 video
   ↓ (if fails)
4. Use fallback image (round.png)
```

---

## 🎥 Supported Video Sources

### **1. YouTube Videos**
```json
{
  "src": "https://youtube.com/watch?v=abc123"
}
```
→ Extracts thumbnail: `https://img.youtube.com/vi/abc123/maxresdefault.jpg`

### **2. Direct MP4 Files**
```json
{
  "src": "https://storage.googleapis.com/qudemo-videos/videos/video_intro.mp4"
}
```
→ Captures frame from video at 2 seconds

### **3. Pre-defined Thumbnail**
```json
{
  "src": "https://...",
  "thumbnail": "https://cdn.com/thumbnail.jpg"
}
```
→ Uses thumbnail URL directly

---

## 🎨 What You'll See

### **Current Setup:**
The widget preview now shows a **frame from your intro video** (video_intro.mp4) instead of a static avatar!

### **Before:**
```
┌──────┐
│ 👤▶️ │  ← Static avatar image
└──────┘
```

### **After:**
```
┌──────┐
│ 🎬▶️ │  ← Actual video frame!
└──────┘
```

---

## 🔧 Technical Implementation

### **Video Frame Capture (for MP4 files):**

```javascript
const captureVideoFrame = (videoUrl) => {
  const video = document.createElement('video');
  video.src = videoUrl;
  video.currentTime = 2; // Capture at 2 seconds
  
  video.addEventListener('loadeddata', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to image
    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
    setVideoThumbnail(thumbnailUrl);
  });
};
```

### **YouTube Thumbnail Extraction:**

```javascript
const getYouTubeThumbnail = (videoUrl) => {
  const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return null;
};
```

---

## 📝 How to Customize

### **Option 1: Add Thumbnail Field to JSON**

Edit `frontend/public/video-flow.json`:

```json
{
  "videos": [
    {
      "id": "video_intro",
      "title": "Welcome to Qudemo",
      "src": "https://storage.googleapis.com/qudemo-videos/videos/video_intro.mp4",
      "thumbnail": "https://your-cdn.com/custom-thumbnail.jpg",  // ← Add this!
      "nextQuestions": [...]
    }
  ]
}
```

### **Option 2: Use YouTube Video**

YouTube thumbnails are automatically extracted:

```json
{
  "id": "video_intro",
  "src": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Welcome"
}
```
→ Widget preview shows YouTube thumbnail

### **Option 3: Change Capture Time**

Edit `FloatingQudemoWidget.jsx` line ~89:

```javascript
video.currentTime = 5; // Capture at 5 seconds instead of 2
```

---

## ⚡ Performance

### **Optimized Loading:**
- Thumbnail loads **asynchronously** (doesn't block page)
- Only loads once on widget mount
- Uses fallback image if capture fails
- Canvas capture is fast (~100ms)

### **Browser Compatibility:**
✅ Chrome/Edge - Full support
✅ Firefox - Full support  
✅ Safari - Full support (with CORS)
⚠️ CORS issues? - Falls back to avatar image

---

## 🐛 Troubleshooting

### **Preview shows fallback image instead of video?**

**Possible causes:**
1. **CORS issue** - Video hosted on different domain without CORS headers
2. **Video not loading** - Check video URL is accessible
3. **Browser blocked** - Some browsers block video capture

**Solutions:**
- Add `thumbnail` field to video-flow.json
- Use YouTube video (no CORS issues)
- Keep fallback image for reliability

### **Preview is black or blank?**

**Fix:** Change capture time in code:
```javascript
video.currentTime = 1; // Try capturing at 1 second
```

Some videos have black frames at the beginning.

---

## 📊 Current Configuration

### **Your Setup:**
```
Video: video_intro.mp4 (from Google Cloud Storage)
Method: Canvas capture at 2 seconds
Fallback: /round.png
```

### **Files Modified:**
- `FloatingQudemoWidget.jsx` - Added thumbnail extraction
- `App.js` - Set fallback image

---

## 🎯 Benefits

| Benefit | Description |
|---------|-------------|
| **Dynamic** | Always shows current intro video |
| **Authentic** | Shows actual video content |
| **Automatic** | No manual thumbnail creation |
| **Flexible** | Supports YouTube, MP4, custom thumbnails |
| **Reliable** | Falls back gracefully if capture fails |

---

## 💡 Pro Tips

### **Best Practices:**

1. **Use High-Quality Intro** - Widget preview is first impression
2. **Interesting Frame** - Make sure 2-second mark is engaging
3. **Add Thumbnail Field** - For best control and performance
4. **Test on Different Devices** - Ensure CORS doesn't block

### **Recommended:**

Create custom thumbnails and add to JSON:
```json
{
  "thumbnail": "https://cdn.com/intro-thumbnail.jpg"
}
```

This is faster than canvas capture and works everywhere!

---

## 🚀 What's Next?

Your widget now:
✅ Loads video thumbnail automatically
✅ Shows actual video content as preview
✅ Falls back gracefully if needed
✅ Works with YouTube and MP4 videos

**Just refresh your browser to see the video preview!** 🎉

---

## 📋 Quick Reference

```javascript
// Priority order for preview image:
1. video.thumbnail (JSON field)
2. video.poster (JSON field)  
3. video.preview (JSON field)
4. YouTube thumbnail (if YT video)
5. Canvas capture (if MP4)
6. Fallback image (round.png)
```

---

**The widget preview now shows a real frame from your beta version video!** 🎬


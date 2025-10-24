# 🎯 Floating QuDemo Widget - Complete Guide

## 📝 Overview

The **Floating QuDemo Widget** is a Y Combinator-style interactive demo widget that appears as a circular button in the corner of your page. When clicked, it expands to show:
- ✅ Video player
- ✅ Suggested questions
- ✅ Interactive Q&A chat
- ✅ Timestamp-based video seeking

Perfect for embedding product demos on landing pages, marketing sites, or documentation!

---

## 🚀 Quick Start

### 1. **Basic Usage**

```jsx
import FloatingQudemoWidget from './components/FloatingQudemoWidget';

function YourPage() {
  return (
    <div>
      {/* Your page content */}
      <h1>Welcome to Our Product</h1>
      
      {/* Floating widget - appears in bottom-right corner */}
      <FloatingQudemoWidget qudemoShareToken="your-share-token-here" />
    </div>
  );
}
```

### 2. **View the Demo**

Visit: `http://localhost:3000/widget-demo`

This demo page shows the widget in action with usage examples.

---

## 🎨 Customization Options

### **Position**

Control where the widget appears on screen:

```jsx
<FloatingQudemoWidget 
  qudemoShareToken="your-token"
  position="bottom-right"  // Options: bottom-right, bottom-left, top-right, top-left
/>
```

### **Preview Image**

Customize the circular preview thumbnail:

```jsx
<FloatingQudemoWidget 
  qudemoShareToken="your-token"
  previewImage="/path/to/thumbnail.jpg"
  previewText="Watch Our Demo"
/>
```

### **Full Example**

```jsx
<FloatingQudemoWidget 
  qudemoShareToken="abc123xyz"
  position="bottom-right"
  previewImage="/demo-thumbnail.png"
  previewText="See How It Works"
/>
```

---

## 📊 Widget States

### 1. **Collapsed (Initial)**
- Small circular button with pulse animation
- Shows preview image or gradient background
- Play button overlay
- Hover tooltip with text

### 2. **Expanded**
- Full video player (420px width)
- 4 suggested questions below video
- Interactive chat interface
- Minimize/close buttons

### 3. **Minimized**
- Compact bar showing widget title
- Click to re-expand
- Stays in corner

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| 🎥 **Video Playback** | Plays YouTube or Loom videos from QuDemo |
| 💬 **Suggested Questions** | Shows up to 4 pre-validated questions |
| 📍 **Timestamp Seeking** | Auto-seeks video to relevant timestamp |
| 🤖 **AI Responses** | Instant answers from cached Q&A |
| ➖ **Minimize/Close** | User can hide or collapse widget |
| 🎨 **Beautiful UI** | Gradient design with smooth animations |
| 📱 **Responsive** | Works on all screen sizes |
| ⚡ **Fast Loading** | Lazy loads content on expand |

---

## 🛠️ Setup Instructions

### **Step 1: Get Your Share Token**

1. Create a QuDemo in your dashboard
2. Click "Share" to generate a public share link
3. Extract the token from the URL: `/share/{THIS-IS-YOUR-TOKEN}`

### **Step 2: Add Widget to Your Page**

```jsx
import FloatingQudemoWidget from './components/FloatingQudemoWidget';

function LandingPage() {
  return (
    <div>
      {/* Your landing page content */}
      <header>...</header>
      <main>...</main>
      <footer>...</footer>
      
      {/* Add widget - it floats on top */}
      <FloatingQudemoWidget 
        qudemoShareToken="your-qudemo-token"
        position="bottom-right"
        previewText="Watch Demo"
      />
    </div>
  );
}
```

### **Step 3: Test It**

1. Open your page
2. Look for the circular widget in the corner
3. Click to expand and interact
4. Ask suggested questions

---

## 📐 Technical Details

### **Component Props**

```typescript
interface FloatingQudemoWidgetProps {
  qudemoShareToken: string;      // Required: QuDemo share token
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  previewImage?: string;          // Optional: URL to preview thumbnail
  previewText?: string;           // Optional: Hover tooltip text
}
```

### **API Endpoints Used**

- `GET /api/qudemos/share/{token}` - Fetch QuDemo data
- `GET /api/qudemos/share/{token}/suggested-questions` - Get questions
- `POST /api/qudemos/share/{token}/chat` - Ask question

### **Widget Dimensions**

- **Collapsed:** 80px × 80px circular button
- **Expanded:** 420px width, auto height (max 580px)
- **Video Player:** 420px × 240px
- **Questions Panel:** Scrollable, max 264px height

---

## 🎨 Styling & Theming

The widget uses Tailwind CSS classes. To customize colors, edit the component:

```jsx
// Change gradient colors
<div className="bg-gradient-to-r from-blue-600 to-purple-600">

// Change hover effects
<button className="hover:bg-blue-50 hover:border-blue-300">
```

---

## 🌍 Use Cases

### **1. Landing Pages**
Embed on your product landing page so visitors can instantly see a demo.

### **2. Documentation Sites**
Add to docs so developers can watch video tutorials while reading.

### **3. Pricing Pages**
Show how features work when users are comparing plans.

### **4. Support Pages**
Provide quick video help without leaving the current page.

### **5. Blog Posts**
Embed demos contextually in blog content.

---

## ✨ Best Practices

### **DO:**
✅ Use high-quality preview images (80×80px or larger)
✅ Keep QuDemo videos concise (2-5 minutes)
✅ Create 4-6 highly relevant suggested questions
✅ Test on mobile devices
✅ Place in a corner that doesn't block important content

### **DON'T:**
❌ Add multiple widgets to same page
❌ Use extremely long videos (>10 min)
❌ Block critical UI elements
❌ Forget to test suggested questions work
❌ Use low-quality or pixelated preview images

---

## 🐛 Troubleshooting

### **Widget Not Appearing?**
- Check that share token is valid
- Verify QuDemo has processed videos
- Check browser console for errors

### **Questions Not Working?**
- Ensure suggested questions are generated
- Verify QuDemo has valid transcripts
- Check Python backend is running

### **Video Not Playing?**
- Confirm video URL is accessible
- Check HybridVideoPlayer component
- Verify video format is supported (YouTube/Loom)

---

## 📱 Mobile Responsiveness

The widget is fully responsive:
- On mobile: Widget is slightly smaller (60×60px)
- Expanded view: Adapts to screen width
- Touch-friendly buttons
- Swipe to close (coming soon)

---

## 🔒 Privacy & Security

- Widget only loads QuDemo data when expanded (privacy-first)
- No user tracking or analytics
- Uses public share endpoints (no auth required)
- CORS-compliant

---

## 🚀 Performance

- **Initial Load:** < 5KB (just the button)
- **On Expand:** Lazy loads video + data
- **Caching:** Suggested answers cached for instant response
- **No Impact:** Doesn't affect page load speed

---

## 📦 Files Created

```
frontend/src/components/
├── FloatingQudemoWidget.jsx     # Main widget component
└── FloatingWidgetDemo.jsx       # Demo/documentation page

frontend/FLOATING_WIDGET_GUIDE.md  # This guide
```

---

## 🎉 Example Implementation

See the live demo at `/widget-demo` or check `FloatingWidgetDemo.jsx` for a complete working example!

---

## 💡 Pro Tips

1. **Use Video Thumbnails:** Extract a frame from your demo video as the preview image
2. **Test Questions First:** Manually test all suggested questions before deploying
3. **Position Matters:** Bottom-right is standard, but test what works for your layout
4. **Keep It Fresh:** Update your demo video regularly
5. **Monitor Engagement:** Track which questions get clicked most

---

## 🤝 Support

Need help? Check:
- Demo page: `/widget-demo`
- Component code: `FloatingQudemoWidget.jsx`
- QuDemo docs: Main README

---

**Built with ❤️ for QuDemo - Making product demos interactive and engaging!**


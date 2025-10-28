# 🚀 Floating Widget - Quick Setup Guide

## ✅ Widget is Now Globally Enabled!

The floating widget will appear on **ALL pages EXCEPT the home page (/)**.

---

## 📝 How to Configure Your Widget Token

### **Option 1: Environment Variable (Recommended for Production)**

1. Create/edit `.env` file in `frontend/` directory:
```bash
REACT_APP_DEMO_WIDGET_TOKEN=your-actual-qudemo-share-token
```

2. Restart your development server:
```bash
npm start
```

---

### **Option 2: Direct Code Edit (Quick Testing)**

1. Open `frontend/src/App.js`
2. Find line ~244:
```javascript
const widgetToken = process.env.REACT_APP_DEMO_WIDGET_TOKEN || 'YOUR_QUDEMO_SHARE_TOKEN_HERE';
```

3. Replace with your token:
```javascript
const widgetToken = process.env.REACT_APP_DEMO_WIDGET_TOKEN || 'abc123xyz789';
```

---

## 🎯 How to Get Your Share Token

### **Step 1: Create a QuDemo**
1. Go to your dashboard
2. Click "Create QuDemo"
3. Add your demo video(s)
4. Add suggested questions
5. Save the QuDemo

### **Step 2: Generate Share Link**
1. Go to "QuDemos" page
2. Find your demo QuDemo
3. Click "Share" button
4. Copy the share link

### **Step 3: Extract Token**
The share link looks like:
```
https://yourdomain.com/share/abc123xyz789
                              ^^^^^^^^^^^^
                              This is your token!
```

Copy everything after `/share/`

---

## 🎨 Customize Widget Appearance

Edit `App.js` around line 252:

```javascript
<FloatingQudemoWidget 
  qudemoShareToken={widgetToken}
  position="bottom-right"        // Change position
  previewText="Watch Demo"       // Change hover text
  previewImage="/logo.png"       // Add custom image
/>
```

### **Position Options:**
- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`

---

## 📍 Widget Appears On:

✅ All pages EXCEPT:
- `/` (home page)

✅ Widget WILL appear on:
- `/login`
- `/register`
- `/overview`
- `/create`
- `/qudemos`
- `/share/:token`
- All other pages

---

## 🔧 Troubleshooting

### **Widget Not Showing?**

1. **Check token is set:**
   - Open browser console (F12)
   - Navigate to any page except home
   - Look for errors

2. **Verify QuDemo exists:**
   - Go to dashboard
   - Confirm QuDemo with that token exists
   - Ensure videos are processed

3. **Check you're not on home page:**
   - Widget only shows on non-home pages
   - Navigate to `/login` or `/overview` to test

### **Widget Shows But No Questions?**

1. **Generate suggested questions:**
   - Open your QuDemo
   - Wait for question generation
   - Verify questions exist

2. **Check Python backend:**
   - Ensure Python backend is running
   - Check logs for errors

---

## 🎉 Test Your Widget

1. Set your share token (Option 1 or 2 above)
2. Restart dev server if needed
3. Navigate to: `http://localhost:3000/login`
4. Look for circular widget in bottom-right corner
5. Click to expand!
6. Click suggested questions

---

## 💡 Pro Tips

### **Create a Dedicated Demo QuDemo**
Create a special QuDemo just for the floating widget that:
- Has your best product demo video
- Includes 4-6 highly relevant questions
- Is kept up-to-date with latest features

### **Use a Custom Preview Image**
Extract a frame from your demo video:
1. Take screenshot at interesting moment
2. Crop to square (80×80px or larger)
3. Save as `/public/widget-preview.jpg`
4. Set: `previewImage="/widget-preview.jpg"`

### **Monitor Widget Usage**
Track which questions get asked most to improve your demo!

---

## 🚫 To Disable Widget

### **Temporarily:**
Set token to empty string in `App.js`:
```javascript
const widgetToken = ''; // Widget disabled
```

### **Permanently:**
Comment out in `App.js` (line ~464):
```javascript
{/* <FloatingWidgetWrapper /> */}
```

---

## 📱 Mobile Support

Widget is fully responsive:
- Smaller on mobile devices
- Touch-friendly
- Adapts to screen size

---

## 🎨 Widget Design

- **Collapsed:** 80×80px circle with pulse animation
- **Expanded:** 420px card with video + questions
- **Colors:** Blue-purple gradient (customizable)

---

## ✅ You're All Set!

Once you set your token, the widget will appear automatically on all pages except home.

**Need help?** Check:
- `FLOATING_WIDGET_GUIDE.md` - Complete documentation
- `FloatingWidgetDemo.jsx` - Working example
- `/widget-demo` - Live demo page

---

**Happy demoing! 🎉**


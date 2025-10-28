# 🎯 How to Setup Floating Widget with Beta Version QuDemo

## 📋 Step-by-Step Guide

### **Step 1: Create Your "Beta Version" QuDemo** 

1. **Login to Dashboard**
   - Go to: `http://localhost:3000/login`
   - Login with your account

2. **Create New QuDemo**
   - Click "Create QuDemo" button
   - Give it a name: **"Product Demo Widget"** (or similar)

3. **Add Your Demo Videos**
   - Add the same videos you want to show in the floating widget
   - These should be your best product demo videos
   - Can be YouTube or Loom videos

4. **Wait for Processing**
   - Videos will process and generate transcripts
   - Python backend will create suggested questions
   - Wait for "Processing Complete" status

5. **Save QuDemo**
   - Click "Save" or "Create"
   - QuDemo is now ready!

---

### **Step 2: Get the Share Token**

1. **Go to QuDemos Page**
   - Navigate to: `http://localhost:3000/qudemos`
   - Find your "Product Demo Widget" QuDemo

2. **Share the QuDemo**
   - Click the **"Share"** button (or "Generate Share Link")
   - A popup will show with the share URL

3. **Copy the Token**
   - Share URL looks like:
   ```
   http://localhost:3000/share/abc123xyz789token
                                 ^^^^^^^^^^^^^^^^
                                 THIS IS YOUR TOKEN!
   ```
   - Copy everything after `/share/`

---

### **Step 3: Set the Token in Your App**

#### **Option A: Environment Variable (Recommended)**

1. Create/edit file: `frontend/.env`

2. Add this line:
```bash
REACT_APP_DEMO_WIDGET_TOKEN=abc123xyz789token
```
(Replace with your actual token)

3. **Restart your dev server:**
```bash
# Stop the server (Ctrl+C)
# Then restart:
cd frontend
npm start
```

---

#### **Option B: Direct Code Edit (Quick Testing)**

1. Open: `frontend/src/App.js`

2. Find line ~244:
```javascript
const widgetToken = process.env.REACT_APP_DEMO_WIDGET_TOKEN || 'YOUR_QUDEMO_SHARE_TOKEN_HERE';
```

3. Replace with your token:
```javascript
const widgetToken = process.env.REACT_APP_DEMO_WIDGET_TOKEN || 'abc123xyz789token';
```

4. Save file (no restart needed)

---

### **Step 4: Test the Widget**

1. **Navigate to any page except home:**
   - Go to: `http://localhost:3000/login`
   - Or: `http://localhost:3000/register`
   - Or: `http://localhost:3000/overview` (if logged in)

2. **Look for the widget:**
   - Bottom-right corner
   - Circular button with pulse animation

3. **Click to expand:**
   - Video player appears
   - Suggested questions show below

4. **Test a question:**
   - Click any suggested question
   - Should get instant answer with timestamp
   - Video should seek to relevant moment

---

## ✅ Complete Example

### **Example Token:**
```
Share URL: http://localhost:3000/share/2a41953e-fad1-4b08-ac08-abb3db381310
Token: 2a41953e-fad1-4b08-ac08-abb3db381310
```

### **In .env file:**
```bash
REACT_APP_DEMO_WIDGET_TOKEN=2a41953e-fad1-4b08-ac08-abb3db381310
```

### **Or in App.js:**
```javascript
const widgetToken = process.env.REACT_APP_DEMO_WIDGET_TOKEN || '2a41953e-fad1-4b08-ac08-abb3db381310';
```

---

## 🎥 What Videos Should You Use?

### **Recommended:**
- Product overview (2-3 minutes)
- Key features demo (3-5 minutes)
- Use case examples (2-4 minutes)
- Getting started guide (3-5 minutes)

### **Tips:**
- Keep videos concise
- Focus on value propositions
- Show actual product usage
- Include 4-6 suggested questions per video

---

## 🔍 How to Find Your QuDemos

### **From Dashboard:**
1. Login
2. Go to "QuDemos" page
3. All your QuDemos are listed there

### **From Database (Advanced):**
If you need to find QuDemos directly in the database:
- They're stored in Supabase
- Table: `qudemos`
- Each has a unique `share_token` column

---

## 💡 Pro Tips

### **Create a Dedicated "Widget Demo" QuDemo:**
Don't reuse an existing QuDemo - create a special one just for the widget that:
- Has polished, high-quality videos
- Has thoroughly tested suggested questions
- Is kept up-to-date with latest product features
- Has a good variety of questions (intro, features, pricing, etc.)

### **Test Your Questions:**
Before deploying, test ALL suggested questions to ensure:
- They have valid answers
- Timestamps are accurate
- Answers are clear and helpful

### **Update Regularly:**
- Refresh demo videos when product changes
- Update questions for new features
- Keep content current and relevant

---

## 🐛 Troubleshooting

### **"No questions showing"**
- Wait for QuDemo processing to complete
- Check Python backend is running
- Verify suggested questions were generated

### **"Video not loading"**
- Check video URL is accessible
- Verify video processed successfully
- Check browser console for errors

### **"Widget not appearing"**
- Confirm token is set correctly
- Check you're NOT on home page (/)
- Verify QuDemo exists with that token
- Check browser console for errors

### **"Questions not answering"**
- Verify Python backend is running
- Check transcript was generated
- Ensure questions were validated during generation

---

## 🎯 Quick Checklist

- [ ] Create QuDemo in dashboard
- [ ] Add demo videos
- [ ] Wait for processing to complete
- [ ] Generate share link
- [ ] Copy token from share URL
- [ ] Set token in `.env` or `App.js`
- [ ] Restart dev server (if using `.env`)
- [ ] Test on `/login` page
- [ ] Click widget to expand
- [ ] Test suggested questions

---

## 🚀 You're Done!

Once you set the token, the floating widget will appear on all pages (except home) showing your QuDemo demo!

**The widget will use the EXACT QuDemo you created** - same videos, same questions, same AI responses!

---

**Need more help?** 
- Check: `FLOATING_WIDGET_GUIDE.md`
- Check: `WIDGET_SETUP.md`
- Or review the component: `FloatingQudemoWidget.jsx`


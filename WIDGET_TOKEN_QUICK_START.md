# 🚀 QUICK START - Get Your Widget Token in 2 Minutes!

## 🎯 Super Simple 3-Step Process

### **Step 1: Open Token Helper Page** ⏱️ 10 seconds
```
http://localhost:3000/widget-tokens
```
Login if needed, then navigate to the URL above.

---

### **Step 2: Copy Token** ⏱️ 5 seconds
1. You'll see a list of all your QuDemos
2. Choose the one you want for the floating widget
3. Click **"Copy .env Format"** button
4. Token copied to clipboard! ✅

---

### **Step 3: Paste in .env File** ⏱️ 30 seconds
1. Open `frontend/.env` file (create if doesn't exist)
2. Paste the line you copied
3. Save file
4. Restart dev server:
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart:
   npm start
   ```

---

## ✅ DONE! Widget is now live!

Visit any page (except home) and see your widget in the bottom-right corner! 🎉

---

## 📸 What You'll See:

### **Token Helper Page** (`/widget-tokens`)
```
┌─────────────────────────────────────────────────┐
│  🎯 Widget Token Helper                          │
│  Copy a QuDemo share token for your widget      │
├─────────────────────────────────────────────────┤
│                                                  │
│  📋 Your QuDemos:                                │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ Product Demo                             │   │
│  │ Status: active  📹 2 videos              │   │
│  │                                           │   │
│  │ Token: abc123xyz789                      │   │
│  │                                           │   │
│  │ [Copy Token] [Copy .env] [View] [Test]  │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ Feature Walkthrough                      │   │
│  │ Status: active  📹 3 videos              │   │
│  │                                           │   │
│  │ Token: def456uvw123                      │   │
│  │                                           │   │
│  │ [Copy Token] [Copy .env] [View] [Test]  │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### **Floating Widget** (on any non-home page)
```
                                    ┌──────┐
                                    │  ▶️  │  ← Click me!
                                    │ ⭕  │  (pulsing circle)
                                    └──────┘
                                    bottom-right
```

**After clicking:**
```
┌──────────────────────────────────┐
│ 🎥 Product Demo           [–] [×]│
├──────────────────────────────────┤
│                                  │
│     [Video Player Here]          │
│                                  │
├──────────────────────────────────┤
│ 💬 Ask a question                │
│                                  │
│ • What is QuDemo?                │
│ • How does it work?              │
│ • What are the features?         │
│ • How much does it cost?         │
└──────────────────────────────────┘
```

---

## 🔗 Quick Links

| Page | URL | Purpose |
|------|-----|---------|
| **Token Helper** | `/widget-tokens` | Get your token (EASIEST!) |
| **Widget Demo** | `/widget-demo` | See widget in action |
| **Create QuDemo** | `/create` | Create new QuDemo |
| **All QuDemos** | `/qudemos` | View all QuDemos |

---

## 💡 Which QuDemo Should I Use?

### **Best Choice:**
Create a **dedicated QuDemo** specifically for the widget with:
- ✅ Your best product demo video(s)
- ✅ 2-5 minutes length
- ✅ 4-6 great suggested questions
- ✅ Clear, concise answers

### **Don't Use:**
- ❌ Test/demo QuDemos
- ❌ Incomplete QuDemos
- ❌ Very long videos (>10 min)
- ❌ QuDemos without questions

---

## 🎯 Example .env File

After clicking "Copy .env Format", your `frontend/.env` should look like:

```bash
# Widget Configuration
REACT_APP_DEMO_WIDGET_TOKEN=2a41953e-fad1-4b08-ac08-abb3db381310

# Other env variables...
# REACT_APP_API_URL=...
```

**That's it!** Save and restart dev server.

---

## 🐛 Not Working? Quick Fixes

### **No QuDemos showing on /widget-tokens page?**
➡️ Create a QuDemo first at `/create`

### **Widget not appearing?**
➡️ Check:
1. Token is set in `.env`
2. Dev server restarted
3. You're NOT on home page (`/`)
4. Browser console for errors

### **Questions not answering?**
➡️ Check:
1. Python backend is running
2. QuDemo has processed transcripts
3. Suggested questions were generated

---

## 📞 Need More Help?

Check these detailed guides:
- `HOW_TO_SETUP_WIDGET_TOKEN.md` - Full step-by-step
- `FLOATING_WIDGET_GUIDE.md` - Complete documentation
- `WIDGET_SETUP.md` - Technical details

---

## 🎉 Summary

```
1. Go to: http://localhost:3000/widget-tokens
2. Click: "Copy .env Format"
3. Paste in: frontend/.env
4. Restart server
5. DONE! 🎊
```

**Your floating widget will now appear on ALL pages (except home) with your QuDemo!**

---

**Pro Tip:** Bookmark `/widget-tokens` for easy access to your tokens! 🔖


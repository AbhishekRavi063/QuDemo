# Production Deployment Guide - QuDemo Frontend

## 🚀 **Production Environment Configuration**

### **Current Production URLs:**
- **Node.js Backend**: `https://qudemo-node-backend.onrender.com`
- **Python Backend**: `https://qudemo-python-backend.onrender.com`
- **Supabase**: `https://yawvfmazhuzyizytzyec.supabase.co`

## 📋 **Required Environment Variables**

### **1. Frontend (.env)**
```bash
# React App Configuration
REACT_APP_NAME=QuDemo
REACT_APP_VERSION=1.0.0

# Production Backend API URLs
REACT_APP_NODE_API_URL=https://qudemo-node-backend.onrender.com
REACT_APP_PYTHON_API_URL=https://qudemo-python-backend.onrender.com

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://yawvfmazhuzyizytzyec.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true

# Optional: Error Tracking
REACT_APP_SENTRY_DSN=your_sentry_dsn_here

# Optional: Google Analytics
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
```

### **2. Node.js Backend (.env)**
```bash
# Environment
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=your_database_url
SUPABASE_URL=https://yawvfmazhuzyizytzyec.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# API Keys
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key

# Python Backend URL
PYTHON_API_BASE_URL=https://qudemo-python-backend.onrender.com
```

### **3. Python Backend (.env)**
```bash
# Environment
PYTHON_VERSION=3.12.0
PORT=5001

# Database
DATABASE_URL=your_database_url
SUPABASE_URL=https://yawvfmazhuzyizytzyec.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# API Keys
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name

# Node.js Backend URL
NODE_BACKEND_URL=https://qudemo-node-backend.onrender.com
```

## 🌐 **Deployment Platforms**

### **Frontend Deployment Options:**

#### **1. Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### **2. Netlify**
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

#### **3. GitHub Pages**
```bash
# Add to package.json
"homepage": "https://yourusername.github.io/qudemo-frontend",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

### **Backend Deployment (Already on Render):**
- **Node.js Backend**: `https://qudemo-node-backend.onrender.com`
- **Python Backend**: `https://qudemo-python-backend.onrender.com`

## 🔧 **Environment Setup Steps**

### **Step 1: Update Frontend Environment**
1. Navigate to frontend directory
2. Update `.env` file with production URLs
3. Ensure all API keys are set correctly

### **Step 2: Build for Production**
```bash
cd frontend
npm run build
```

### **Step 3: Deploy Frontend**
Choose your deployment platform and follow their specific instructions.

### **Step 4: Verify Deployment**
1. Test registration: `https://your-frontend-url.com/register`
2. Test login: `https://your-frontend-url.com/login`
3. Test video upload: `https://your-frontend-url.com/create-qudemo`

## 🔍 **Health Check Endpoints**

### **Node.js Backend:**
- Health: `https://qudemo-node-backend.onrender.com/health`
- Queue Status: `https://qudemo-node-backend.onrender.com/api/queue/status`

### **Python Backend:**
- Health: `https://qudemo-python-backend.onrender.com/health`
- Status: `https://qudemo-python-backend.onrender.com/status`

## 🚨 **Important Notes**

### **CORS Configuration:**
The backends are configured to accept requests from:
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)
- `https://qu-demo.vercel.app` (production)
- `https://qudemo.com` (production)

### **API Key Security:**
- Never commit API keys to Git
- Use environment variables for all sensitive data
- Rotate API keys regularly

### **Database Configuration:**
- Ensure Supabase is properly configured
- Check database connection strings
- Verify table schemas match the application

## 📊 **Monitoring & Analytics**

### **Error Tracking:**
- Set up Sentry for error monitoring
- Configure Google Analytics for user tracking
- Monitor API response times

### **Health Monitoring:**
- Set up uptime monitoring for all endpoints
- Monitor memory usage and performance
- Set up alerts for critical failures

## 🔄 **Deployment Checklist**

- [ ] Environment variables configured
- [ ] API keys set correctly
- [ ] Database connections tested
- [ ] CORS settings updated
- [ ] Frontend built successfully
- [ ] Backend health checks passing
- [ ] Registration/login tested
- [ ] Video upload tested
- [ ] Q&A functionality tested
- [ ] Error tracking configured
- [ ] Analytics configured

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Network Error on Registration:**
   - Check if backend URLs are correct
   - Verify CORS settings
   - Test backend health endpoints

2. **Video Processing Fails:**
   - Check Python backend status
   - Verify API keys are set
   - Check Pinecone connection

3. **Database Connection Issues:**
   - Verify Supabase credentials
   - Check database URL format
   - Test database connectivity

### **Support:**
- Check backend logs on Render dashboard
- Monitor frontend console for errors
- Test individual API endpoints
- Verify environment variable loading

// API Configuration for QuDemo Frontend

const config = {
  // API Base URLs
  NODE_API_URL: process.env.REACT_APP_NODE_API_URL || 'http://localhost:5000',
  PYTHON_API_URL: process.env.REACT_APP_PYTHON_API_URL || 'http://localhost:5001',
  PYTHON_API_URL_2: process.env.REACT_APP_PYTHON_API_URL_2 || 'http://localhost:5002',
  
  // Production URLs (fallback)
  PROD_NODE_API_URL: 'https://qudemo-node-backend.onrender.com',
  PROD_PYTHON_API_URL: 'https://qudemo-python-backend.onrender.com',
  PROD_PYTHON_API_URL_2: 'https://qudemo-python-backend-2.onrender.com',
  
  // API Endpoints
  endpoints: {
    // Node.js Backend endpoints
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      verify: '/api/auth/verify'
    },
    users: {
      profile: '/api/users/profile',
      update: '/api/users/update'
    },
    qudemos: {
      list: '/api/qudemos',
      create: '/api/qudemos',
      get: (id) => `/api/qudemos/${id}`,
      update: (id) => `/api/qudemos/${id}`,
      delete: (id) => `/api/qudemos/${id}`
    },
    interactions: {
      create: '/api/interactions',
      list: '/api/interactions'
    },
    analytics: {
      dashboard: '/api/analytics/dashboard',
      reports: '/api/analytics/reports'
    },
    settings: {
      get: '/api/settings',
      update: '/api/settings'
    },
    notifications: {
      list: '/api/notifications',
      markRead: '/api/notifications/mark-read'
    },
    help: {
      faq: '/api/help/faq',
      contact: '/api/help/contact'
    },
    companies: {
      list: '/api/companies',
      create: '/api/companies',
      get: (id) => `/api/companies/${id}`,
      update: (id) => `/api/companies/${id}`,
      delete: (id) => `/api/companies/${id}`
    },
    queue: {
      status: '/api/queue/status',
      jobs: '/api/queue/jobs'
    },
    
    // Python Backend endpoints
    video: {
      health: '/health',
      process: '/process-video',
      ask: '/ask-question',
      askCompany: (companyName) => `/ask/${encodeURIComponent(companyName)}`,
      generateSummary: '/generate-summary',
      status: '/status',
      memoryStatus: '/memory-status'
    }
  }
};

// Helper function to get the appropriate API URL based on environment
export const getApiUrl = (type = 'python') => {
  // Use environment variables directly, fallback to production URLs
  if (type === 'node') {
    return config.NODE_API_URL || config.PROD_NODE_API_URL;
  }
  
  return config.PYTHON_API_URL || config.PROD_PYTHON_API_URL;
};

// Helper function to build full API URLs
export const buildApiUrl = (baseUrl, endpoint) => {
  return `${baseUrl}${endpoint}`;
};

// Helper function to get video API URL
export const getVideoApiUrl = (endpoint, pythonUrl = null) => {
  const baseUrl = pythonUrl || getApiUrl('python');
  return buildApiUrl(baseUrl, endpoint);
};

// Helper function to get node API URL
export const getNodeApiUrl = (endpoint) => {
  const baseUrl = getApiUrl('node');
  return buildApiUrl(baseUrl, endpoint);
};

export default config;

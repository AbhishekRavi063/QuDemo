import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import FloatingQudemoWidget from './FloatingQudemoWidget';
import FAQEditor from './FAQEditor';
import { getNodeApiUrl } from '../config/api';

const WidgetPlayground = () => {
  const { qudemoId } = useParams();
  const navigate = useNavigate();
  const [qudemoData, setQudemoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('widget'); // 'widget' or 'faqs'

  useEffect(() => {
    const fetchQudemoData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(getNodeApiUrl(`/api/qudemos/${qudemoId}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        console.log('📊 Widget Playground - Fetched QuDemo data:', data);
        
        if (data.success) {
          setQudemoData(data.qudemo);
        } else {
          console.error('❌ Failed to fetch QuDemo data:', data);
        }
      } catch (error) {
        console.error('❌ Error fetching qudemo data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (qudemoId) {
      console.log('🎮 Widget Playground initialized for QuDemo:', qudemoId);
      fetchQudemoData();
    }
  }, [qudemoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/qudemos')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to QuDemos</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Widget Playground</h1>
                <p className="text-sm text-gray-600">
                  Test your widget before embedding
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Widget Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('widget')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'widget'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>Widget Test</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'faqs'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>FAQ Editor</span>
              </div>
            </button>
          </div>
        </div>

        {/* Widget Test Tab */}
        {activeTab === 'widget' && (
          <>
        {/* Instructions Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Use This Playground</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-semibold mt-0.5">1.</span>
                  <span>Look at the bottom-right corner - you'll see the widget floating there</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-semibold mt-0.5">2.</span>
                  <span>Click on the widget to open it and interact with your QuDemo</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-semibold mt-0.5">3.</span>
                  <span>This is exactly how it will appear on your website</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-semibold mt-0.5">4.</span>
                  <span>Once satisfied, copy the embed code and paste it on your website</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo Website Mockup */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Mockup Browser Bar */}
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600 flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>https://your-website.com</span>
              </div>
            </div>
          </div>

          {/* Mockup Content */}
          <div className="p-8 min-h-[600px] bg-gradient-to-br from-white to-gray-50">
            <div className="max-w-4xl mx-auto">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  Demo Website
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome to Our Website
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  This is a preview of how your widget will appear on your actual website. Notice the QuDemo widget in the bottom-right corner!
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  { icon: '🚀', title: 'Fast Setup', desc: 'Get started in minutes' },
                  { icon: '💬', title: 'Interactive Q&A', desc: 'Engage with visitors' },
                  { icon: '📊', title: 'Analytics', desc: 'Track engagement' }
                ].map((feature, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <div className="text-4xl mb-3">{feature.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
                <h2 className="text-2xl font-bold mb-3">
                  Ready to Get Started?
                </h2>
                <p className="text-purple-100 mb-6">
                  Click the widget below to see it in action
                </p>
                <div className="flex items-center justify-center space-x-2 text-purple-100">
                  <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>Look at the bottom-right corner</span>
                  <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span className="text-2xl">✨</span>
              <span>Widget Features</span>
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Auto-plays AI avatar videos</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Real-time Q&A with your QuDemo</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Video playback with timestamps</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Document search</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Mobile responsive design</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span className="text-2xl">🎨</span>
              <span>Customization Options</span>
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <span className="text-purple-500">•</span>
                <span>Choose light or dark theme</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-purple-500">•</span>
                <span>Position (bottom-right, bottom-left)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-purple-500">•</span>
                <span>Size options (small, medium, large)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-purple-500">•</span>
                <span>Matches your website design</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-purple-500">•</span>
                <span>Easy to install & update</span>
              </li>
            </ul>
          </div>
        </div>
          </>
        )}

        {/* FAQ Editor Tab */}
        {activeTab === 'faqs' && qudemoData && (
          <FAQEditor 
            qudemoId={qudemoId}
            companyName={qudemoData.company_name}
          />
        )}
      </div>

      {/* Floating Widget - Only show on widget tab */}
      {activeTab === 'widget' && qudemoData && (
        <FloatingQudemoWidget
          qudemoId={qudemoId}
          companyName={qudemoData.company_name}
          isPreview={false}
        />
      )}
    </div>
  );
};

export default WidgetPlayground;


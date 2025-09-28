import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarBorder } from "./ui/star-border";
import FadeInSection from "./FadeInSection";
import { navigateToCreate } from '../utils/navigation';
import { getNodeApiUrl } from '../config/api';

const HomePage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [productHuntBadgeUrl, setProductHuntBadgeUrl] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  // Check authentication state on home page load
  useEffect(() => {

    const checkAuthState = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const user = localStorage.getItem('user');

      if (accessToken && refreshToken && user) {
        setIsLoggedIn(true);
        try {
          const userData = JSON.parse(user);
          setUserEmail(userData.email || '');

          // Note: Removed automatic redirect to allow users to see the homepage
          // Users can manually navigate to /qudemos or /create via the buttons
        } catch (error) {
          console.error('🏠 HomePage: Error parsing user data:', error);
        }
      } else {
        setIsLoggedIn(false);
        setUserEmail('');

      }
    };
    
    // Check auth state immediately and on storage changes
    checkAuthState();
    
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' || e.key === 'refreshToken' || e.key === 'user') {

        checkAuthState();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Generate fresh Product Hunt badge URL
  useEffect(() => {
    const generateBadgeUrl = () => {
      // Generate a fresh URL with current timestamp to get live data
      const baseUrl = "https://api.producthunt.com/widgets/embed-image/v1/featured.svg";
      const params = new URLSearchParams({
        post_id: "1019477",
        theme: "light",
        t: Date.now().toString() // Current timestamp for fresh data
      });
      setProductHuntBadgeUrl(`${baseUrl}?${params.toString()}`);
    };

    // Generate initial URL
    generateBadgeUrl();

    // Refresh the badge every 5 minutes to get updated numbers
    const refreshInterval = setInterval(generateBadgeUrl, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div style={{ 
      background: 'black', 
      width: '100%', 
      overflow: 'hidden',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        style={{ 
          opacity: 0.6,
          filter: 'brightness(1.3) contrast(1.1)'
        }}
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      
      <div className="relative z-10 bg-black/50 flex flex-col min-h-screen overflow-x-hidden max-w-full">
        {/* Navigation Bar */}
        <div className="flex justify-between items-center p-4 md:p-6 max-w-full">
            <div className="flex items-center">
              <img 
                src="/Qudemo LP.svg" 
                alt="Qudemo Logo" 
                className="w-48 h-32"
              />
            </div>
          <div className="flex items-center gap-2 md:gap-6">
            {isLoggedIn ? (
              <div className="flex items-center gap-2 md:gap-4">
                {/* User email - Responsive text and padding */}
                <div 
                  onClick={() => navigate('/profile')}
                  className="text-white font-medium px-3 md:px-6 py-2 bg-gray-900/90 rounded-[20px] border border-gray-600/40 text-xs md:text-sm hover:bg-gray-800/90 transition-all duration-200 cursor-pointer"
                >
                  <span className="hidden sm:inline">{userEmail}</span>
                  <span className="sm:hidden">{userEmail.split('@')[0]}</span>
                </div>
                {/* Dashboard button - Responsive text and padding */}
                <div 
                  onClick={() => navigate('/create')}
                  className="text-white font-medium px-4 md:px-8 py-2 bg-blue-600/90 rounded-[20px] border border-blue-500/40 hover:bg-blue-700/90 transition-all duration-200 cursor-pointer text-sm md:text-base"
                >
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Dash</span>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => navigate('/login', { state: { from: '/' } })}
                className="text-white font-medium px-4 md:px-8 py-2 bg-gray-900/90 rounded-[20px] border border-gray-600/40 hover:bg-gray-800/90 transition-all duration-200 cursor-pointer text-sm md:text-base"
              >
                Login
              </div>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex justify-center items-center min-h-[60vh] px-6">
          <div className="max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Turn Your Video Demo Into Interactive Demo
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Engage your prospects with an AI Powered demo that answers their questions in real time.
            </p>
            {/* Button and Product Hunt Badge Container */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <button
                onClick={() => navigateToCreate(navigate)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 rounded-lg transition-colors duration-200 w-[250px] sm:w-auto sm:min-w-[250px] sm:h-[54px] flex items-center justify-center"
              >
                Get Started Now
              </button>
              
              {/* Product Hunt Badge */}
              <a href="https://www.producthunt.com/products/qudemo?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-qudemo" target="_blank" rel="noopener noreferrer" className="w-auto sm:w-auto">
                <img 
                  src={productHuntBadgeUrl || "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1019477&theme=light"}
                  alt="Qudemo - Make your demo videos Interactive using AI | Product Hunt" 
                  className="w-[250px] h-[54px] sm:w-[250px] sm:h-[54px] mx-auto sm:mx-0"
                  onError={(e) => {
                    // Fallback to static image if API fails
                    e.target.src = "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1019477&theme=light";
                  }}
                />
              </a>
            </div>
          </div>
        </div>

        {/* AI-Driven Efficiency Section */}
        <FadeInSection delay={0.1}>
          <div className="flex justify-center items-center min-h-[80vh] px-6 mt-32">
            <div className="max-w-6xl text-center">
            {/* AI-Driven Efficiency Badge */}
            <div className="flex justify-center mb-8">
              <StarBorder
                color="#2934ff"
                className="text-white text-sm font-semibold uppercase tracking-wide"
              >
                AI-DRIVEN EFFICIENCY
              </StarBorder>
            </div>

            {/* Main Heading */}
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Create Qudemo in Minutes.
            </h2>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto">
              Transform your regular videos into engaging, interactive experiences with just a few clicks.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {/* Upload Card */}
              <div className="bg-gray-900 border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 h-56">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#2934ff' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-3">Upload</h3>
                  <p className="text-gray-300 text-base">
                    Simply upload your product video to our platform
                  </p>
                </div>
              </div>

              {/* Create Card */}
              <div className="bg-gray-900 border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 h-56">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#2934ff' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-3">Create</h3>
                  <p className="text-gray-300 text-base">
                    Our AI analyzes your video and creates an interactive experience
                  </p>
                </div>
              </div>

              {/* Share Card */}
              <div className="bg-gray-900 border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 h-56">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#2934ff' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-3">Share</h3>
                  <p className="text-gray-300 text-base">
                    Share your interactive video with your audience instantly
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </FadeInSection>

        {/* Why Choose Us Section */}
        <FadeInSection delay={0.2}>
          <div className="py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <StarBorder
                color="#1e40af"
                className="text-blue-100 text-sm font-medium"
              >
                BENEFITS
              </StarBorder>
            </div>
            
            {/* Main Heading */}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Us?
            </h2>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-300 mb-16 max-w-4xl mx-auto">
              Transform passive video watching into active engagement. Let your viewers question and interact with your video.
            </p>
            
            {/* Benefit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Save Time Card */}
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-3">Save Time</h3>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Let viewers explore your video without watching the full length, getting straight to what matters most to them.
                  </p>
                </div>
              </div>

              {/* Increase Engagement Card */}
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-3">Increase Engagement</h3>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Interactive videos keep viewers engaged 5x longer than traditional videos with real-time Q&A capabilities.
                  </p>
                </div>
              </div>

              {/* Better Conversions Card */}
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-3">Better Conversions</h3>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Convert more prospects by allowing them to get instant answers to their specific questions about your product.
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </FadeInSection>

        {/* Founders Note Section */}
        <FadeInSection delay={0.3}>
          <div className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Founders Note Badge */}
            <div className="flex justify-center mb-8">
              <StarBorder
                color="#2934ff"
                className="text-blue-100 text-sm font-medium"
              >
                FOUNDERS NOTE
              </StarBorder>
            </div>
            
            {/* Quote */}
            <blockquote className="text-4xl md:text-4xl font-bold text-white leading-relaxed">
              We believe a <span className="text-blue-400">Demo</span> should feel like real
              <br />
              conversations, not one-way presentations
              <br />
              letting customers ask questions and get
              <br />
              instant answers
            </blockquote>
          </div>
          </div>
        </FadeInSection>

        {/* FAQ Section */}
        <FadeInSection delay={0.4}>
          <div className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* FAQ Section Badge */}
            <div className="flex justify-center mb-8 mt-16">
              <StarBorder
                color="#2934ff"
                className="text-blue-100 text-sm font-medium"
              >
                FAQ'S SECTION
              </StarBorder>
            </div>
            
            {/* FAQ Heading */}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Some Common FAQ's
            </h2>
            
            {/* FAQ Subtitle */}
            <p className="text-xl text-gray-300 mb-16">
              Get answers to your questions and learn about our platform
            </p>
            
            {/* FAQ Items */}
            <div className="max-w-4xl mx-auto space-y-4">
              {/* FAQ Item 1 */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-all duration-300">
                <div 
                  className="flex justify-between items-center cursor-pointer p-6"
                  onClick={() => toggleFAQ(0)}
                >
                  <h3 className="text-lg font-semibold text-white">What is Qudemo?</h3>
                  <svg 
                    className={`w-5 h-5 text-white transform transition-transform duration-200 ${openFAQ === 0 ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {openFAQ === 0 && (
                  <div className="px-6 pb-6 text-gray-300 text-left">
                    Qudemo is an AI video assistant that makes your demo videos interactive. Viewers can ask questions, get instant answers and jump straight to the exact moment in the video where the answer is shown.
                  </div>
                )}
              </div>

              {/* FAQ Item 2 */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-all duration-300">
                <div 
                  className="flex justify-between items-center cursor-pointer p-6"
                  onClick={() => toggleFAQ(1)}
                >
                  <h3 className="text-lg font-semibold text-white">How does it work?</h3>
                  <svg 
                    className={`w-5 h-5 text-white transform transition-transform duration-200 ${openFAQ === 1 ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {openFAQ === 1 && (
                  <div className="px-6 pb-6 text-gray-300 text-left">
                    Upload your video, generate a Qudemo, and share the link. Viewers can ask questions in chat, get instant answers, and jump to the exact video moment.
                  </div>
                )}
              </div>

              {/* FAQ Item 3 */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-all duration-300">
                <div 
                  className="flex justify-between items-center cursor-pointer p-6"
                  onClick={() => toggleFAQ(2)}
                >
                  <h3 className="text-lg font-semibold text-white">Who is it for?</h3>
                  <svg 
                    className={`w-5 h-5 text-white transform transition-transform duration-200 ${openFAQ === 2 ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {openFAQ === 2 && (
                  <div className="px-6 pb-6 text-gray-300 text-left">
                    B2B SaaS teams sharing pre-recorded product videos with prospects.<br/><br/>
                    Qudemo can also be used by startups, educators, learners and anyone using demo or product videos to engage customers.
                  </div>
                )}
              </div>

              {/* FAQ Item 4 */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-all duration-300">
                <div 
                  className="flex justify-between items-center cursor-pointer p-6"
                  onClick={() => toggleFAQ(3)}
                >
                  <h3 className="text-lg font-semibold text-white">Do I need technical setup?</h3>
                  <svg 
                    className={`w-5 h-5 text-white transform transition-transform duration-200 ${openFAQ === 3 ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {openFAQ === 3 && (
                  <div className="px-6 pb-6 text-gray-300 text-left">
                    No, just upload your youtube/loom video, Create Qudemo and Share it anywhere
                  </div>
                )}
              </div>

              {/* FAQ Item 5 */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-all duration-300">
                <div 
                  className="flex justify-between items-center cursor-pointer p-6"
                  onClick={() => toggleFAQ(4)}
                >
                  <h3 className="text-lg font-semibold text-white">What's the benefit?</h3>
                  <svg 
                    className={`w-5 h-5 text-white transform transition-transform duration-200 ${openFAQ === 4 ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {openFAQ === 4 && (
                  <div className="px-6 pb-6 text-gray-300 text-left">
                    Customers get answers faster and you get more qualified leads.
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </FadeInSection>

        {/* Final Call-to-Action Section */}
        <FadeInSection delay={0.5}>
          <div className="py-20 px-6 relative">
          <div className="max-w-4xl mx-auto text-center relative">
            {/* Blue Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-500/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Badge */}
              <div className="flex justify-center mb-8">
                <StarBorder
                  color="#1e40af"
                  className="text-blue-100 text-sm font-bold"
                >
                  WHAT YOU STILL WAITING FOR
                </StarBorder>
              </div>
              
              {/* Main Heading */}
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Ready to transform your product videos?
              </h2>
              
              {/* Description */}
              <p className="text-xl text-gray-300 mb-16 max-w-3xl mx-auto">
                Join Qudemo to create more engaging, interactive video experiences that save time for everyone.
              </p>
              
              {/* Contact Section */}
              <div className="mb-8">
                {/* Horizontal Line */}
                <div className="border-t border-blue-500 mb-8"></div>
                
                <p className="text-lg text-gray-300 mb-4">
                  Any queries or support?
                </p>
                <a 
                  href="mailto:mail@qudemo.com"
                  className="text-blue-400 hover:text-blue-300 text-lg font-medium transition-colors duration-200"
                >
                  mail@qudemo.com
                </a>
              </div>
              
              {/* Privacy Policy Link */}
              <div className="mb-8">
                <p 
                  onClick={() => navigate('/privacypolicy')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium cursor-pointer transition-colors duration-200 underline"
                >
                  Privacy Policy
                </p>
              </div>
              
              {/* Copyright */}
              <p className="text-sm text-gray-400">
                © 2025 Qudemo Softwares Inc. All Rights Reserved.
              </p>
            </div>
          </div>
          </div>
        </FadeInSection>
       
      </div>
    </div>
  );
};

export default HomePage;

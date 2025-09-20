import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarBorder } from "./ui/star-border";
import FadeInSection from "./FadeInSection";

const HomePage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const navigate = useNavigate();

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
        <div className="flex justify-between items-center p-6 max-w-full">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">Qudemo</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-white font-medium px-8 py-2 bg-gray-900/90 rounded-[20px] border border-gray-600/40 hover:bg-gray-800/90 transition-all duration-200">
              Blog
            </div>
            <div 
              onClick={() => navigate('/login')}
              className="text-white font-medium px-8 py-2 bg-gray-900/90 rounded-[20px] border border-gray-600/40 hover:bg-gray-800/90 transition-all duration-200 cursor-pointer"
            >
              Login
            </div>
          </div>
        </div>

        {/* Customer Social Proof */}
        <FadeInSection>
          <div className="flex justify-center mt-8 mb-4">
            <div className="flex items-center gap-2 text-white">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-400 border-2 border-black flex items-center justify-center text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-300 ml-2">
                Join 426 + other loving customers
              </span>
            </div>
          </div>
        </FadeInSection>

        {/* Hero Section */}
        <FadeInSection>
          <div className="flex justify-center items-center min-h-[60vh] px-6">
            <div className="max-w-4xl text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Turn Your Video Demo Into Interactive Demo
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Engage your prospects with an AI Powered demo that answers their questions in real time.
              </p>
              <StarBorder
                onClick={() => navigate('/overview')}
                color="#3b82f6"
                className="text-white font-bold text-lg"
              >
                Get Started Now
              </StarBorder>
            </div>
          </div>
        </FadeInSection>

        {/* AI-Driven Efficiency Section */}
        <FadeInSection delay={0.4}>
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
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
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
        <FadeInSection delay={0.6}>
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
        <FadeInSection delay={0.8}>
          <div className="py-32 px-6">
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
            <blockquote className="text-3xl md:text-4xl font-bold text-white leading-relaxed mb-12">
              We believe <span className="text-blue-400">Demo</span> should feel like real
              <br />
              conversations, not one-way presentations
              <br />
              letting customers ask questions and get
              <br />
              instant answers
            </blockquote>
            
            {/* Divider */}
            <div className="w-full h-px bg-gray-600 mb-16"></div>
            
            {/* FAQ Section Badge */}
            <div className="flex justify-center mb-8 mt-44">
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
                    AI-powered platform that transforms demo videos into interactive experiences with real-time Q&A.
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
                    Upload your video, AI analyzes it, and viewers can ask questions while watching.
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
                    Sales teams, product managers, and anyone creating demo videos for better engagement.
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
                    No technical setup required! Just sign up and upload your video.
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
                    5x more engagement, better conversions, and instant answers to prospect questions.
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </FadeInSection>

        {/* Final Call-to-Action Section */}
        <FadeInSection delay={1.0}>
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

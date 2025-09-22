import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadeInSection from './FadeInSection';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        style={{ filter: 'brightness(0.3)' }}
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
              className="w-40 h-26"
            />
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            <div 
              onClick={() => navigate('/')}
              className="text-white font-medium px-4 md:px-8 py-2 bg-gray-900/90 rounded-[20px] border border-gray-600/40 hover:bg-gray-800/90 transition-all duration-200 cursor-pointer text-sm md:text-base"
            >
              Home
            </div>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <FadeInSection delay={0.1}>
          <div className="flex justify-center items-start px-6 py-12">
            <div className="max-w-4xl w-full">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-2xl border border-white/30">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Privacy Policy
                </h1>
                
                <div className="text-gray-200 mb-8">
                  <p className="text-lg">Last updated: 21/09/2025</p>
                  <p className="text-lg mt-4">
                    At Qudemo, we care about your privacy. This page explains what information we collect, 
                    how we use it, and your rights.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Section 1 */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                    <ul className="space-y-4 text-gray-200">
                      <li className="flex items-start">
                        <span className="text-blue-600 font-bold mr-3">•</span>
                        <span><strong>Account details:</strong> name, email, and login info when you sign up.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 font-bold mr-3">•</span>
                        <span><strong>Videos and content:</strong> the demo videos you upload to create Qudemos.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 font-bold mr-3">•</span>
                        <span><strong>Usage data:</strong> how you and your viewers interact with Qudemo (e.g. questions asked, timestamps viewed).</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 font-bold mr-3">•</span>
                        <span><strong>Technical info:</strong> IP address, browser type, and cookies to improve performance.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Section 2 */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                    <ul className="space-y-4 text-gray-200">
                      <li className="flex items-start">
                        <span className="text-blue-600 font-bold mr-3">•</span>
                        <span>To provide and improve Qudemo's features.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 font-bold mr-3">•</span>
                        <span>To personalise your experience and show relevant insights.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 font-bold mr-3">•</span>
                        <span>To keep Qudemo secure and prevent misuse.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 font-bold mr-3">•</span>
                        <span>To communicate with you about updates, support, or product news (you can opt out).</span>
                      </li>
                    </ul>
                  </div>

                  {/* Section 3 */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">3. How We Share Information</h2>
                    <div className="space-y-4 text-gray-200">
                      <p className="font-semibold">We do not sell your data.</p>
                      <p>We may share it only with:</p>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-start">
                          <span className="text-blue-600 font-bold mr-3">•</span>
                          <span>Trusted service providers who help run Qudemo (e.g. hosting, analytics).</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 font-bold mr-3">•</span>
                          <span>If required by law.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Section 4 */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Your Choices</h2>
                    <ul className="space-y-4 text-gray-200">
                      <li className="flex items-start">
                        <span className="text-blue-600 font-bold mr-3">•</span>
                        <span>You can access, update, or delete your account anytime.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 font-bold mr-3">•</span>
                        <span>You can contact us to remove your data.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 font-bold mr-3">•</span>
                        <span>You can opt out of marketing emails.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Section 5 */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">5. Security</h2>
                    <p className="text-gray-200">
                      We take reasonable steps to protect your data.
                    </p>
                  </div>

                  {/* Section 6 */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">6. Contact Us</h2>
                    <p className="text-gray-200">
                      If you have any questions about this policy or your data, please reach out:{' '}
                      <a 
                        href="mailto:mail@qudemo.com" 
                        className="text-blue-300 hover:text-blue-200 underline"
                      >
                        mail@qudemo.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* Back to Home Button */}
                <div className="mt-12 text-center">
                  <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

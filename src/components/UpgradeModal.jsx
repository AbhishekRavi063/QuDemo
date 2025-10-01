import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, SparklesIcon, ShareIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const UpgradeModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Upgrade to Pro
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Unlock the power to share your QuDemos with the world
          </p>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <ShareIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Public Sharing</h3>
                <p className="text-sm text-gray-600">Generate shareable links for your QuDemos</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <ChartBarIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Advanced Analytics</h3>
                <p className="text-sm text-gray-600">Track views and engagement</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <SparklesIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Priority Support</h3>
                <p className="text-sm text-gray-600">Get help when you need it</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-gray-900">$29</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
            <p className="text-center text-sm text-gray-600 mt-1">
              or $290/year (save 20%)
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              View All Plans
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;


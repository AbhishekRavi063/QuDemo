import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, SparklesIcon, ShareIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const UpgradeModal = ({ isOpen, onClose, errorDetails }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  // Determine if this is a cancelled subscription
  const isCancelled = errorDetails?.isCancelled;
  const currentPlan = errorDetails?.currentPlan;
  const title = errorDetails?.title || 'Upgrade Required';
  const message = errorDetails?.message || 'Unlock premium features with our Pro plan';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 transform transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isCancelled 
                ? 'bg-gradient-to-br from-red-500 to-orange-500' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Content */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h2>
          <p className="text-gray-600 text-center mb-4 text-sm">
            {message}
          </p>

          {/* Features - Only show for non-cancelled subscriptions */}
          {!isCancelled && (
            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <ShareIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Public Sharing</h3>
                  <p className="text-xs text-gray-600">Generate shareable links for your QuDemos</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <ChartBarIcon className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Advanced Analytics</h3>
                  <p className="text-xs text-gray-600">Track views and engagement</p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing - Only show for non-cancelled subscriptions */}
          {!isCancelled && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 mb-4">
              <div className="flex items-baseline justify-center">
                <span className="text-2xl font-bold text-gray-900">$29</span>
                <span className="text-gray-600 ml-2 text-sm">/month</span>
              </div>
              <p className="text-center text-xs text-gray-600 mt-1">
                or $290/year (save 20%)
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleUpgrade}
              className={`w-full py-2.5 px-6 text-white rounded-lg font-semibold transition-all transform hover:scale-105 ${
                isCancelled 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {isCancelled ? 'Renew Subscription' : 'View All Plans'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-6 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              {isCancelled ? 'Continue with Free Plan' : 'Maybe Later'}
            </button>
          </div>

          {/* Note - Only show for non-cancelled subscriptions */}
          {!isCancelled && (
            <p className="text-xs text-gray-500 text-center mt-3">
              Cancel anytime. No questions asked.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;


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
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full min-h-[500px] p-10 transform transition-all">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Content */}
          <h2 className="text-xl font-bold text-gray-900 text-left mb-4 mt-2">
            {title}
          </h2>
          <p className="text-gray-600 text-left mb-6 text-sm leading-relaxed">
            {message}
          </p>

          {/* Features - Only show for non-cancelled subscriptions */}
          {!isCancelled && (
            <div className="flex justify-center mb-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <ShareIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-sm text-left mb-1">Public Sharing</h3>
                    <p className="text-xs text-gray-600 text-left leading-relaxed">Generate shareable links for your QuDemos</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <ChartBarIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-sm text-left mb-1">Advanced Analytics</h3>
                    <p className="text-xs text-gray-600 text-left leading-relaxed">Track views and engagement</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing - Only show for non-cancelled subscriptions */}
          {!isCancelled && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-baseline justify-center">
                <span className="text-2xl font-bold text-gray-900">$29.9</span>
                <span className="text-gray-600 ml-2 text-sm">/month</span>
              </div>
              <p className="text-center text-xs text-gray-600 mt-2">
                or $299/year (save 17%)
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className={`w-full py-2.5 px-6 text-white rounded-lg font-semibold transition-all transform hover:scale-105 ${
                isCancelled 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                  : 'bg-blue-600 hover:bg-blue-700'
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


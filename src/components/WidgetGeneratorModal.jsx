import React, { useState } from 'react';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon, EyeIcon } from '@heroicons/react/24/outline';

const WidgetGeneratorModal = ({ isOpen, onClose, widgetData, qudemo }) => {
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState('script'); // 'script' or 'iframe'

  if (!isOpen || !widgetData) return null;

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPlayground = () => {
    window.open(widgetData.playgroundUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Widget Generator</h2>
              <p className="text-purple-100">Embed {qudemo?.name} on your website</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tab Selection */}
          <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedTab('script')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                selectedTab === 'script'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Script Tag (Recommended)
            </button>
            <button
              onClick={() => setSelectedTab('iframe')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                selectedTab === 'iframe'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              iFrame (Alternative)
            </button>
          </div>

          {/* Code Display */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">
                {selectedTab === 'script' ? 'Embed Code' : 'iFrame Code'}
              </h3>
              <button
                onClick={() => handleCopyCode(selectedTab === 'script' ? widgetData.widgetCode : widgetData.iframeCode)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="w-5 h-5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>
                  {selectedTab === 'script' ? widgetData.widgetCode : widgetData.iframeCode}
                </code>
              </pre>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-blue-900 flex items-center space-x-2">
              <span>📝</span>
              <span>How to Use</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Copy the code above using the "Copy Code" button</li>
              <li>Paste it into your website's HTML, just before the closing <code>&lt;/body&gt;</code> tag</li>
              <li>The widget will appear at the bottom-right corner of your page</li>
              <li>Users can click it to interact with your QuDemo</li>
            </ol>
          </div>

          {/* Widget Config Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Theme</div>
              <div className="font-semibold text-gray-900 capitalize">{widgetData.widgetConfig.theme}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Position</div>
              <div className="font-semibold text-gray-900 capitalize">{widgetData.widgetConfig.position}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Size</div>
              <div className="font-semibold text-gray-900 capitalize">{widgetData.widgetConfig.size}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleOpenPlayground}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <EyeIcon className="w-5 h-5" />
              <span>Preview in Playground</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Done
            </button>
          </div>

          {/* Features */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-semibold text-gray-900">Widget Features</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Auto-plays avatar videos</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Mobile responsive</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Real-time Q&A</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Video playback</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Document search</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Suggested questions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetGeneratorModal;


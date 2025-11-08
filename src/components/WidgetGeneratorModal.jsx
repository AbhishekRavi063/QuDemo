import React, { useState } from "react";
import {
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const WidgetGeneratorModal = ({ isOpen, onClose, widgetData, qudemo }) => {
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState("script"); // 'script' or 'iframe'

  if (!isOpen || !widgetData) return null;

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPlayground = () => {
    window.open(widgetData.playgroundUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", "Inter", sans-serif' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 text-white px-6 py-5">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <h2 className="text-2xl font-semibold mb-1 tracking-tight">Widget Generator</h2>
              <p className="text-blue-100 font-light text-sm">
                Embed {qudemo?.name} on your website
              </p>
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
        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-5rem)]">
          {/* Actions - Moved to Top */}
          <div className="flex space-x-3">
            <button
              onClick={handleOpenPlayground}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <EyeIcon className="w-5 h-5" />
              <span>Preview in Playground</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Done
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex space-x-2 bg-gray-50 rounded-xl p-1 border border-gray-200">
            <button
              onClick={() => setSelectedTab("script")}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm ${
                selectedTab === "script"
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              Script Tag (Recommended)
            </button>
            <button
              onClick={() => setSelectedTab("iframe")}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm ${
                selectedTab === "iframe"
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              iFrame (Alternative)
            </button>
          </div>

          {/* Code Display */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 text-left tracking-tight">
                {selectedTab === "script" ? "Embed Code" : "iFrame Code"}
              </h3>
              <button
                onClick={() =>
                  handleCopyCode(
                    selectedTab === "script"
                      ? widgetData.widgetCode
                      : widgetData.iframeCode,
                  )
                }
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4 rounded-xl overflow-x-auto text-xs leading-relaxed max-h-[200px] overflow-y-auto border border-gray-700 shadow-inner">
                <code className="text-left">
                  {selectedTab === "script"
                    ? widgetData.widgetCode
                    : widgetData.iframeCode}
                </code>
              </pre>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-3 shadow-sm">
            <h4 className="font-semibold text-blue-900 flex items-center space-x-2 text-left tracking-tight">
              <span>📝</span>
              <span>How to Use</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2.5 text-sm text-blue-800 text-left font-light leading-relaxed">
              <li className="text-left pl-1">Copy the code above using the "Copy Code" button</li>
              <li className="text-left pl-1">
                Paste it into your website's HTML, just before the closing{" "}
                <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">&lt;/body&gt;</code> tag
              </li>
              <li className="text-left pl-1">
                The widget will appear at the bottom-right corner of your page
              </li>
              <li className="text-left pl-1">Users can click it to interact with your QuDemo</li>
            </ol>
          </div>

          {/* Widget Config Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center border border-gray-200 shadow-sm">
              <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Theme</div>
              <div className="font-semibold text-gray-900 capitalize text-sm">
                {widgetData.widgetConfig.theme}
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center border border-gray-200 shadow-sm">
              <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Position</div>
              <div className="font-semibold text-gray-900 capitalize text-sm">
                {widgetData.widgetConfig.position}
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center border border-gray-200 shadow-sm">
              <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Size</div>
              <div className="font-semibold text-gray-900 capitalize text-sm">
                {widgetData.widgetConfig.size}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetGeneratorModal;

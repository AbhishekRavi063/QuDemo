import React from "react";
import FloatingQudemoWidget from "./FloatingQudemoWidget";

/**
 * Demo page showing how to embed the Floating QuDemo Widget
 *
 * Usage Example:
 *
 * 1. Simple embed (bottom-right corner):
 *    <FloatingQudemoWidget qudemoShareToken="your-share-token-here" />
 *
 * 2. Custom position:
 *    <FloatingQudemoWidget
 *      qudemoShareToken="your-share-token-here"
 *      position="bottom-left"  // Options: bottom-right, bottom-left, top-right, top-left
 *    />
 *
 * 3. Custom preview:
 *    <FloatingQudemoWidget
 *      qudemoShareToken="your-share-token-here"
 *      previewImage="/path/to/thumbnail.jpg"
 *      previewText="Watch Our Demo"
 *    />
 */

const FloatingWidgetDemo = () => {
  // Replace this with your actual QuDemo share token
  const DEMO_SHARE_TOKEN = "your-qudemo-share-token-here";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Floating QuDemo Widget Demo
          </h1>
          <p className="text-xl text-gray-600">
            Check the bottom-right corner for the interactive demo widget!
          </p>
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-lg border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use the Floating Widget
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                1. Basic Usage
              </h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`import FloatingQudemoWidget from './components/FloatingQudemoWidget';

function App() {
  return (
    <div>
      {/* Your page content */}

      {/* Floating widget */}
      <FloatingQudemoWidget qudemoShareToken="your-share-token" />
    </div>
  );
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                2. Custom Position
              </h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`<FloatingQudemoWidget
  qudemoShareToken="your-share-token"
  position="bottom-left"
  // Options: "bottom-right", "bottom-left", "top-right", "top-left"
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                3. Custom Preview
              </h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`<FloatingQudemoWidget
  qudemoShareToken="your-share-token"
  previewImage="/path/to/thumbnail.jpg"
  previewText="Watch Our Demo"
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Features
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>🎯 Floating circular widget in corner</li>
                <li>🎥 Expands to show video player</li>
                <li>💬 Interactive suggested questions</li>
                <li>📍 Video timestamp seeking</li>
                <li>➖ Minimizable and closeable</li>
                <li>📱 Responsive and animated</li>
                <li>🎨 Beautiful gradient design</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Placeholder content to show scrolling */}
        <div className="space-y-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Section {i}
              </h3>
              <p className="text-gray-600">
                This is placeholder content to demonstrate how the floating
                widget stays fixed in position while you scroll through the
                page. The widget appears in the bottom-right corner and can be
                clicked to expand and show the interactive demo.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Widget - This is what you want to embed on any page! */}
      <FloatingQudemoWidget
        qudemoShareToken={DEMO_SHARE_TOKEN}
        position="bottom-right"
        previewText="Watch Demo"
      />
    </div>
  );
};

export default FloatingWidgetDemo;

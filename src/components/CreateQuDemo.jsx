import React, { useState } from "react";
import {
  ArrowUpTrayIcon,
  FolderOpenIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const CreateQuDemo = () => {
  const [sources, setSources] = useState([""]);

  const handleSourceChange = (index, value) => {
    const updated = [...sources];
    updated[index] = value;
    setSources(updated);
  };

  const addSourceField = () => {
    setSources([...sources, ""]);
  };

  const removeSourceField = (index) => {
    const updated = sources.filter((_, i) => i !== index);
    setSources(updated);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold">Qudemo Details</h2>
      <p className="text-gray-600">
        Create an interactive demo that allows buyers to learn about your
        product at their own pace.
      </p>

      {/* Demo Title */}
      {/* <div>
        <label className="block font-medium text-gray-700 mb-1">
          Demo Title
        </label>
        <input
          type="text"
          placeholder="Enter a descriptive title"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg"
        />
        <p className="text-sm text-gray-500 mt-1">
          This is the name that will be displayed to your buyers.
        </p>
      </div> */}

      {/* Description */}
      {/* <div>
        <label className="block font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          placeholder="Describe what this demo showcases"
          rows="4"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg"
        ></textarea>
        <p className="text-sm text-gray-500 mt-1">
          A detailed description helps buyers understand what they'll learn.
        </p>
      </div> */}

      {/* Video URL & Thumbnail Image URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Video URL */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Video URL
          </label>
          <div className="flex">
            <input
              type="text"
              placeholder="https://example.com/video.mp4"
              className="flex-1 border border-gray-300 px-4 py-2 rounded-l-lg"
            />
            <button className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-100 hover:bg-gray-200">
              <ArrowUpTrayIcon className="h-5 w-5 text-gray-600" />
              <span className="ml-1">Upload</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Link to your product demo video or upload a new one.
          </p>
        </div>

        {/* Thumbnail Image URL */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Thumbnail Image URL
          </label>
          <div className="flex">
            <input
              type="text"
              placeholder="https://example.com/thumbnail.jpg"
              className="flex-1 border border-gray-300 px-4 py-2 rounded-l-lg"
            />
            <button className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-100 hover:bg-gray-200">
              <ArrowUpTrayIcon className="h-5 w-5 text-gray-600" />
              <span className="ml-1">Upload</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            An image that represents your demo (optional).
          </p>
        </div>
      </div>

      {/* Product Knowledge Sources */}
      <div>
        <label className="block font-medium text-gray-700 mb-2">
          Product Knowledge Source
        </label>

        {sources.map((source, index) => (
          <div className="flex items-center mb-2" key={index}>
            <input
              type="text"
              value={source}
              onChange={(e) => handleSourceChange(index, e.target.value)}
              placeholder="https://docs.example.com/product-info"
              className="flex-1 border border-gray-300 px-4 py-2 rounded-l-lg"
            />
            <button className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-100 hover:bg-gray-200">
              <ArrowUpTrayIcon className="h-10 w-5 text-gray-600" />
              <span className="ml-1">Upload</span>
            </button>
            {sources.length > 1 && (
              <button
                type="button"
                onClick={() => removeSourceField(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addSourceField}
          className="flex items-center text-sm text-blue-600 hover:underline mt-1"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add another source
        </button>
      </div>

      {/* Meeting Link */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Meeting Link
        </label>
        <div className="flex">
          <input
            type="text"
            placeholder="https://meet.example.com/session"
            className="flex-1 border border-gray-300 px-4 py-2 rounded-l-lg"
          />
        </div>
      </div>

      <button
        type="button"
        className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded font-medium"
      >
        Save QuDemo
      </button>
    </div>
  );
};

export default CreateQuDemo;

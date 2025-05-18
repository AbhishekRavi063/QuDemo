import React from "react";
import { ArrowUpTrayIcon, FolderOpenIcon } from "@heroicons/react/24/outline";

const CreateQuDemo = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold">Qudemo Details</h2>
      <p className="text-gray-600">
        Create an interactive demo that allows buyers to learn about your
        product at their own pace.
      </p>

      {/* Demo Title */}
      <div>
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
      </div>

      {/* Description */}
      <div>
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
      </div>

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

      {/* Product Knowledge Source */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Product Knowledge Source
        </label>
        <div className="flex">
          <input
            type="text"
            placeholder="https://docs.example.com/product-info"
            className="flex-1 border border-gray-300 px-4 py-2 rounded-l-lg"
          />
          <button className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-100 hover:bg-gray-200">
            <FolderOpenIcon className="h-5 w-5 text-gray-600" />
            <span className="ml-1">Browse</span>
          </button>
        </div>
      </div>
      <button
        type="button"
        className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded font-medium"
      >
        Save Demo
      </button>
    </div>
  );
};

export default CreateQuDemo;

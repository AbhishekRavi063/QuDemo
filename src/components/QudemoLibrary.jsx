import React, { useState } from "react";
import {
  EyeIcon,
  ChatBubbleLeftIcon,
  PlayIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

const qudemos = [
  {
    id: 1,
    title: "Product Overview",
    description: "Complete overview of the product features and benefits",
    duration: "5:32",
    views: 827,
    comments: 142,
    updated: "2 days ago",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    active: true,
  },
  {
    id: 2,
    title: "Enterprise Features",
    description: "Detailed walkthrough of enterprise-grade features",
    duration: "8:15",
    views: 543,
    comments: 98,
    updated: "1 week ago",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    active: true,
  },
  {
    id: 3,
    title: "Integration Options",
    description: "How to integrate with existing tools and systems",
    duration: "6:45",
    views: 412,
    comments: 76,
    updated: "3 days ago",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    active: true,
  },
];

const QudemoLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQudemos = qudemos.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 flex-1 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Qudemo Library</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <ArrowUpTrayIcon className="h-4 w-4" />
          Create Qudemo
        </button>
      </div>

      <div className="relative mb-6 w-full">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search qudemos..."
          className="w-full border border-gray-300 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredQudemos.map((q) => (
          <div
            key={q.id}
            className="bg-white rounded shadow-md overflow-hidden flex flex-col"
          >
            <div className="relative">
              <img
                src={q.image}
                alt={q.title}
                className="w-full h-40 object-cover"
              />
              {q.active && (
                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  Active
                </span>
              )}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2"
                  />
                </svg>
                {q.duration}
              </div>
              <h3 className="absolute bottom-2 right-2 text-white font-bold text-lg drop-shadow-lg">
                {q.title}
              </h3>
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <a
                href="#"
                className="text-blue-600 font-semibold hover:underline"
              >
                {q.title}
              </a>
              <p className="text-gray-600 mt-1 flex-grow">{q.description}</p>

              <div className="flex justify-between items-center text-gray-500 text-sm mt-4 border-t pt-3">
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <EyeIcon className="h-5 w-5 mr-1 text-blue-500" />
                    {q.views}
                  </div>
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="h-5 w-5 mr-1 text-blue-500" />
                    {q.comments}
                  </div>
                </div>
                <div>{`Updated ${q.updated}`}</div>
              </div>

              <div className="mt-4 space-y-2">
                <button className="w-full border border-blue-400 text-blue-600 rounded py-2 flex items-center justify-center gap-2 hover:bg-blue-50">
                  <PlayIcon className="w-5 h-5" />
                  Preview Qudemo
                </button>
                <button className="w-full border border-blue-400 text-blue-600 rounded py-2 flex items-center justify-center gap-2 hover:bg-blue-50">
                  <UserIcon className="w-5 h-5" />
                  View Interactions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QudemoLibrary;


import React from "react";

import {
  MagnifyingGlassIcon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
  FunnelIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const data = [
  {
    name: "John Smith",
    company: "Acme Corp",
    demo: "Product Overview",
    messages: 3,
    time: "6:24",
    engagement: 85,
    status: "Meeting Booked",
  },
  {
    name: "Sarah Johnson",
    company: "Tech Innovators",
    demo: "Enterprise Features",
    messages: 5,
    time: "9:12",
    engagement: 92,
    status: "Contacted",
  },
  {
    name: "Michael Davis",
    company: "GlobalSoft",
    demo: "Security Features",
    messages: 2,
    time: "4:53",
    engagement: 68,
    status: "Pending",
  },
  {
    name: "Emily Wong",
    company: "Bright Ideas Inc",
    demo: "Integration Options",
    messages: 4,
    time: "7:18",
    engagement: 79,
    status: "Contacted",
  },
];

const BuyerInteractions = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between  mb-4">
        <h2 className="text-2xl font-semibold mb-4">Buyer Interactions</h2>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm">
            <CalendarDaysIcon className="w-4 h-4" />
            Date Range
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm">
            <FunnelIcon className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Search + Buttons */}
      <div className="relative w-full mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
        </span>
        <input
          type="text"
          placeholder="Search by name, email, company or demo watched..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex space-x-2">
        <button className="bg-gray-200 px-4 py-2 rounded-md font-medium">
          All Interactions
        </button>
        <button className="hover:bg-gray-100 px-4 py-2 rounded-md">
          Pending Follow-up
        </button>
        <button className="hover:bg-gray-100 px-4 py-2 rounded-md">
          High Engagement
        </button>
      </div>

      {/* Subheading */}
      <h3 className="text-lg font-semibold mb-2">Recent Interactions</h3>

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 text-left text-sm font-medium text-gray-600">
            <tr>
              <th className="px-6 py-3">Buyer</th>
              <th className="px-6 py-3">Demo Watched</th>
              <th className="px-6 py-3">
                <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mx-auto" />
              </th>
              <th className="px-6 py-3">
                <ClockIcon className="w-4 h-4 mx-auto" />
              </th>
              <th className="px-6 py-3">
                <div className="flex items-center">
                  Engagement
                  <span className="ml-1">⇅</span>
                </div>
              </th>
              <th className="px-6 py-3">Follow-up Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-gray-500">{item.company}</div>
                </td>
                <td className="px-6 py-4">{item.demo}</td>
                <td className="px-6 py-4">{item.messages}</td>
                <td className="px-6 py-4 text-black font-medium">
                  {item.time}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-24 bg-gray-200 rounded">
                      <div
                        className={`h-2 rounded ${
                          item.engagement >= 80
                            ? "bg-green-500"
                            : item.engagement >= 70
                            ? "bg-yellow-500"
                            : "bg-orange-500"
                        }`}
                        style={{ width: `${item.engagement}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium">
                      {item.engagement}%
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === "Meeting Booked"
                        ? "bg-green-100 text-green-700"
                        : item.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 ">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuyerInteractions;

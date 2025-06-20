import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
  FunnelIcon,
  CalendarDaysIcon,
  XMarkIcon,
  PlayCircleIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";



const pendingFollowUps = [
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
    name: "Robert Chen",
    company: "Future Systems",
    demo: "Product Overview",
    messages: 1,
    time: "3:42",
    engagement: 45,
    status: "Pending",
  },
];
const data = [
  {
    name: "John Smith",
    company: "Acme Corp",
    email: "john.smith@example.com",
    demo: "Product Overview",
    messages: 3,
    time: "6:24",
    engagement: 85,
    status: "Meeting Booked",
  },
  {
    name: "Sarah Johnson",
    company: "Tech Innovators",
    email: "sarah.j@example.com",
    demo: "Enterprise Features",
    messages: 5,
    time: "9:12",
    engagement: 92,
    status: "Contacted",
  },
  {
    name: "Michael Davis",
    company: "GlobalSoft",
    email: "m.davis@globalsoft.com",
    demo: "Security Features",
    messages: 2,
    time: "4:53",
    engagement: 68,
    status: "Pending",
  },
  {
    name: "Emily Wong",
    company: "Bright Ideas Inc",
    email: "emily.w@brightideas.com",
    demo: "Integration Options",
    messages: 4,
    time: "7:18",
    engagement: 79,
    status: "Contacted",
  },
];

const BuyerDetailsModal = ({ buyer, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview"); // 👈 stays inside BuyerDetailsModal

  if (!buyer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl relative overflow-hidden max-h-[90vh]">
        {/* Header (sticky) */}
        <div className="sticky top-0 bg-white z-20  px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {buyer.name} - Buyer Interaction Details
            </h2>
            <div className="text-sm text-gray-600 flex flex-wrap gap-6 mt-4 items-center">
              <div className="flex items-center gap-1">
                <EnvelopeIcon className="w-4 h-4 text-black" />
                {buyer.email}
              </div>

              <div className="flex items-center gap-1">
                <BuildingOffice2Icon className="w-4 h-4 text-black" />
                {buyer.company}
              </div>

              <div className="flex items-center gap-1">
                <CalendarDaysIcon className="w-4 h-4 text-black" />
                Today, 10:35 AM
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="w-[90%] px-4 py-1 flex flex-wrap gap-0 mb-2 bg-gray-100 rounded-md">
            {[
              { key: "overview", label: "Overview" },
              { key: "engagement", label: "Engagement Data" },
              { key: "questions", label: "Questions" },
              { key: "buyerProfile", label: "Buyer Profile" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-10 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "bg-white text-black shadow-sm"
                    : "bg-transparent text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-128px)] space-y-6">
          {activeTab === "overview" && (
            <>
              {/* AI Insight */}
              <div className="bg-blue-50 border border-blue-200 text-sm text-blue-800 rounded-md p-3">
                <strong>AI Insight Summary</strong>
                <p className="mt-[8px]">
                  The prospect is price‑sensitive and interested in
                  understanding the cost structure...
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Demo Watched */}
                <div className="border border-gray-200 rounded-[10px] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Demo Watched
                    </div>
                    <div className="font-semibold text-lm">{buyer.demo}</div>
                  </div>
                  <PlayCircleIcon className="w-6 h-6 text-black" />
                </div>

                {/* Time Spent */}
                <div className="border border-gray-200 rounded-[10px] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Time Spent</div>
                    <div className="font-semibold text-lm">{buyer.time}</div>
                  </div>
                  <ClockIcon className="w-6 h-6 text-black" />
                </div>

                {/* Questions Asked */}
                <div className="border border-gray-200 rounded-[10px] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Questions Asked
                    </div>
                    <div className="font-semibold text-lm">
                      {buyer.messages}
                    </div>
                  </div>
                  <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-black" />
                </div>
              </div>

              {/* Engagement Score */}
              <div className="border border-gray-200 rounded-[10px] p-4">
                <div className="text-sm font-medium mb-1">Engagement Score</div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-3 bg-gray-200 rounded">
                    <div
                      style={{ width: `${buyer.engagement}%` }}
                      className={`h-3 rounded ${
                        buyer.engagement >= 80
                          ? "bg-green-500"
                          : buyer.engagement >= 70
                          ? "bg-yellow-500"
                          : "bg-orange-500"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-semibold">
                    {buyer.engagement}%
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-500 flex gap-28 mt-4">
                  <span>
                    Time Quality: <span className="text-green-600">High</span>
                  </span>
                  <span>
                    Questions Quality:{" "}
                    <span className="text-yellow-600">Medium</span>
                  </span>
                  <span>
                    Overall Engagement:{" "}
                    <span className="text-green-600">High</span>
                  </span>
                </div>
              </div>

              {/* Follow‑up Status */}
              <div className="text-sm border border-gray-200 rounded-[10px] h-[80px]">
                <div className="font-medium ml-6 mt-2">Follow‑up Status</div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="bg-green-100  ml-4 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {buyer.status}
                  </span>
                  {buyer.status === "Meeting Booked" && (
                    <span>
                      Meeting scheduled for:{" "}
                      <strong>Tomorrow, 2:00 PM EST</strong>
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "engagement" && (
            <div className="text-sm text-gray-600">
              {/* Engagement Data - Session Timeline Table */}
              <div className="mt-6 rounded-xl border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 bg-white rounded-t-xl">
                  <h2 className="font-medium text-gray-800 text-sm">
                    Session Timeline
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-white border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 font-medium text-gray-500">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 font-medium text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      <tr>
                        <td className="px-6 py-3 font-medium text-black">
                          00:45
                        </td>
                        <td className="px-6 py-3">Paused video</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3 font-medium text-black">
                          01:20
                        </td>
                        <td className="px-6 py-3">Resumed video</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3 font-medium text-black">
                          02:15
                        </td>
                        <td className="px-6 py-3">
                          Asked question: How much does the enterprise plan
                          cost?
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3 font-medium text-black">
                          03:45
                        </td>
                        <td className="px-6 py-3">Continued watching</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3 font-medium text-black">
                          04:30
                        </td>
                        <td className="px-6 py-3">Paused video</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3 font-medium text-black">
                          6:24
                        </td>
                        <td className="px-6 py-3">Session ended</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="text-sm text-gray-600">
              <div className="mt-6">
                <h2 className="font-medium text-gray-800 text-sm mb-4">
                  Questions & Responses
                </h2>

                {/* Q&A Block 1 */}
                <div className="bg-white rounded-md shadow-sm border mb-4">
                  {/* Question */}
                  <div className="p-4 flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      J
                    </div>
                    <div>
                      <div className="font-medium text-black">
                        How much does the enterprise plan cost?
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Asked at approximately 02:15
                      </div>
                    </div>
                  </div>
                  <hr className="border-t border-gray-200 mx-4" />
                  {/* Answer */}
                  <div className="px-4 pb-4 pt-3 flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold">
                      AI
                    </div>
                    <div className="text-gray-700">
                      Our pricing is flexible and depends on your needs. We
                      offer monthly plans starting at $29/user for Basic,
                      $49/user for Pro, and custom pricing for Enterprise.
                    </div>
                  </div>
                </div>

                {/* Q&A Block 2 */}
                <div className="bg-white rounded-md shadow-sm border mb-4">
                  <div className="p-4 flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      J
                    </div>
                    <div>
                      <div className="font-medium text-black">
                        Do you offer volume discounts?
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Asked at approximately 03:45
                      </div>
                    </div>
                  </div>
                  <hr className="border-t border-gray-200 mx-4" />
                  <div className="px-4 pb-4 pt-3 flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold">
                      AI
                    </div>
                    <div className="text-gray-700">
                      Great question! I'd be happy to help with that. We
                      designed our product to be flexible and powerful enough to
                      handle a variety of use cases...
                    </div>
                  </div>
                </div>

                {/* Q&A Block 3 */}
                <div className="bg-white rounded-md shadow-sm border">
                  <div className="p-4 flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      J
                    </div>
                    <div>
                      <div className="font-medium text-black">
                        Is there a self-hosted option available?
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Asked at approximately 04:30
                      </div>
                    </div>
                  </div>
                  <hr className="border-t border-gray-200 mx-4" />
                  <div className="px-4 pb-4 pt-3 flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold">
                      AI
                    </div>
                    <div className="text-gray-700">
                      Great question! I'd be happy to help with that. We
                      designed our product to be flexible and powerful enough to
                      handle a variety of use cases...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "buyerProfile" && (
            <div className="flex flex-col md:flex-row gap-4 mt-6 text-sm text-gray-800">
              {/* Left Panel: Profile Summary */}
              <div className="w-full md:w-1/3 bg-white p-6 rounded-md shadow-sm text-center border">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold">
                    J
                  </div>
                  <div className="text-lg font-semibold text-black">
                    John Smith
                  </div>
                  <div className="text-sm text-gray-500">
                    Marketing Director
                  </div>
                  <a
                    href="#"
                    className="text-sm text-blue-600 font-medium hover:underline"
                  >
                    Acme Corp
                  </a>
                  <div className="text-sm text-gray-500 mt-1">
                    john.smith@example.com
                  </div>
                </div>
              </div>

              {/* Right Panel: Company & Contact Info */}
              <div className="w-full md:w-2/3 bg-white p-6 rounded-md shadow-sm border">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Company & Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-gray-400">
                      <i className="fas fa-briefcase" /> {/* Job title icon */}
                    </span>
                    <div>
                      <div className="text-gray-500">Job Title</div>
                      <div className="font-medium text-black">
                        Marketing Director
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-gray-400">
                      <i className="fas fa-globe" /> {/* Website icon */}
                    </span>
                    <div>
                      <div className="text-gray-500">Website</div>
                      <a
                        href="https://example.com"
                        className="text-blue-600 hover:underline"
                      >
                        https://example.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-gray-400">
                      <i className="fas fa-building" /> {/* Industry icon */}
                    </span>
                    <div>
                      <div className="text-gray-500">Industry</div>
                      <div className="font-medium text-black">Technology</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-gray-400">
                      <i className="fas fa-map-marker-alt" />{" "}
                      {/* Location icon */}
                    </span>
                    <div>
                      <div className="text-gray-500">Location</div>
                      <div className="font-medium text-black">
                        New York, United States
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-gray-400">
                      <i className="fas fa-users" /> {/* Company size icon */}
                    </span>
                    <div>
                      <div className="text-gray-500">Company Size</div>
                      <div className="font-medium text-black">
                        101-500 employees
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-gray-400">
                      <i className="fas fa-dollar-sign" /> {/* Revenue icon */}
                    </span>
                    <div>
                      <div className="text-gray-500">Estimated Revenue</div>
                      <div className="font-medium text-black">$10M-$50M</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-gray-400">
                      <i className="fas fa-calendar-alt" /> {/* Founded icon */}
                    </span>
                    <div>
                      <div className="text-gray-500">Founded</div>
                      <div className="font-medium text-black">2015</div>
                    </div>
                  </div>
                </div>

                {/* Areas of Interest */}
                <div className="mt-6">
                  <div className="text-gray-500 mb-2">Areas of Interest</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      Marketing Automation
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      Analytics
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      Lead Generation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BuyerInteractions = () => {
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // NEW: tab state

  // Helper to get buyer object for PendingFollowUpTab (since it lacks email)
  const getBuyerFromPending = (item) => {
    // Try to find matching buyer in 'data' by name and company
    const found = data.find(
      (d) => d.name === item.name && d.company === item.company
    );
    return found || { ...item, email: "" };
  };

  // Helper to get buyer object for HighEngagementTab
  const getBuyerFromHigh = (item) => {
    // Try to find matching buyer in 'data' by name and company
    const found = data.find(
      (d) => d.name === item.name && d.company === item.company
    );
    return found || { ...item, email: "" };
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-semibold">Buyer Interactions</h2>
        <div className="flex flex-wrap gap-3">
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

      {/* Search */}
      <div className="relative w-full mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
        </span>
        <input
          type="text"
          placeholder="Search by name, email, company or demo watched..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className={`px-4 py-2 rounded-md font-medium text-sm ${activeTab === "all" ? "bg-gray-200" : "hover:bg-gray-100"}`}
          onClick={() => setActiveTab("all")}
        >
          All Interactions
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm ${activeTab === "pending" ? "bg-gray-200 font-medium" : "hover:bg-gray-100"}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Follow-up
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm ${activeTab === "high" ? "bg-gray-200 font-medium" : "hover:bg-gray-100"}`}
          onClick={() => setActiveTab("high")}
        >
          High Engagement
        </button>
      </div>

      {/* Subheading & Content */}
      {activeTab === "all" && (
        <>
          <h3 className="text-lg font-semibold mb-2">Recent Interactions</h3>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                <tr>
                  <th className="px-4 sm:px-6 py-3">Buyer</th>
                  <th className="px-4 sm:px-6 py-3">Demo Watched</th>
                  <th className="px-4 sm:px-6 py-3">
                    <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mx-auto" />
                  </th>
                  <th className="px-4 sm:px-6 py-3">
                    <ClockIcon className="w-4 h-4 mx-auto" />
                  </th>
                  <th className="px-4 sm:px-6 py-3">
                    <div className="flex items-center">
                      Engagement <span className="ml-1">⇅</span>
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3">Follow-up Status</th>
                  <th className="px-4 sm:px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-gray-500">{item.company}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">{item.demo}</td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      {item.messages}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center font-medium">
                      {item.time}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
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
                    <td className="px-4 sm:px-6 py-4">
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
                    <td className="px-4 sm:px-6 py-4">
                      <button
                        className="px-4 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                        onClick={() => setSelectedBuyer(item)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {activeTab === "pending" && (
        <PendingFollowUpTab setSelectedBuyer={setSelectedBuyer} getBuyerFromPending={getBuyerFromPending} />
      )}
      {activeTab === "high" && (
        <HighEngagementTab setSelectedBuyer={setSelectedBuyer} getBuyerFromHigh={getBuyerFromHigh} />
      )}
      {/* Modal */}
      {selectedBuyer && (
        <BuyerDetailsModal
          buyer={selectedBuyer}
          onClose={() => setSelectedBuyer(null)}
        />
      )}
    </div>
  );
};

export default BuyerInteractions;



const PendingFollowUpTab = ({ setSelectedBuyer, getBuyerFromPending }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Pending Follow-up</h2>
      <table className="w-full text-sm">
        <thead className="text-gray-500 border-b">
          <tr>
            <th className="text-left py-2">Buyer</th>
            <th className="text-left py-2">Demo Watched</th>
            <th className="text-center py-2">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mx-auto" />
            </th>
            <th className="text-center py-2">
              <ClockIcon className="w-4 h-4 mx-auto" />
            </th>
            <th className="text-left py-2">Engagement ⬍</th>
            <th className="text-left py-2">Follow-up Status</th>
            <th className="text-left py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingFollowUps.map((item, idx) => (
            <tr key={idx} className="border-b">
              <td className="py-4">
                <div className="font-medium">{item.name}</div>
                <div className="text-gray-400">{item.company}</div>
              </td>
              <td className="py-4">{item.demo}</td>
              <td className="py-4 text-center">{item.messages}</td>
              <td className="py-4 text-center">{item.time}</td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${
                        item.engagement >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${item.engagement}%` }}
                    />
                  </div>
                  <span className="text-gray-700">{item.engagement}%</span>
                </div>
              </td>
              <td className="py-4">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                  {item.status}
                </span>
              </td>
              <td className="py-4">
                <button
                  className="px-4 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                  onClick={() => setSelectedBuyer(getBuyerFromPending(item))}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const HighEngagementTab = ({ setSelectedBuyer, getBuyerFromHigh }) => {
  // Only show high engagement (>= 80)
  const highEngagementRows = data.filter((item) => item.engagement >= 80);
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">High Engagement</h2>
      <table className="w-full text-sm">
        <thead className="text-gray-500 border-b">
          <tr>
            <th className="text-left py-2">Buyer</th>
            <th className="text-left py-2">Demo Watched</th>
            <th className="text-center py-2">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mx-auto" />
            </th>
            <th className="text-center py-2">
              <ClockIcon className="w-4 h-4 mx-auto" />
            </th>
            <th className="text-left py-2">Engagement ⬍</th>
            <th className="text-left py-2">Follow-up Status</th>
            <th className="text-left py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {highEngagementRows.map((item, idx) => (
            <tr key={idx} className="border-b">
              <td className="py-4">
                <div className="font-medium">{item.name}</div>
                <div className="text-gray-400">{item.company}</div>
              </td>
              <td className="py-4">{item.demo}</td>
              <td className="py-4 text-center">{item.messages}</td>
              <td className="py-4 text-center">{item.time}</td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${item.engagement}%` }}
                    />
                  </div>
                  <span className="text-gray-700">{item.engagement}%</span>
                </div>
              </td>
              <td className="py-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {item.status}
                </span>
              </td>
              <td className="py-4">
                <button
                  className="px-4 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                  onClick={() => setSelectedBuyer(getBuyerFromHigh(item))}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};



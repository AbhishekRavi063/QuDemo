import React, { useState } from "react";

const tabs = [
  { name: "AI Assistant", key: "ai" },
  { name: "CTA Buttons", key: "cta" },
  { name: "Notifications", key: "notifications" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("ai");
  const [assistantTone, setAssistantTone] = useState("balanced");
  const [concise, setConcise] = useState(false);
  const [technical, setTechnical] = useState(true);
  const [ctaEnabled, setCtaEnabled] = useState(true);
  const [primaryCta, setPrimaryCta] = useState("Book a Meeting");
  const [secondaryCta, setSecondaryCta] = useState("Contact Sales");
  const [showCtaAfter, setShowCtaAfter] = useState("Immediately");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [emailNotif, setEmailNotif] = useState(true);
  const [highEngagement, setHighEngagement] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [notifEmail, setNotifEmail] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Custom Switch component for better UX
  const Switch = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col py-4">
    <h2 className="text-3xl font-bold mb-10">Settings</h2>

      {/* Tabs */}
      
        <div className="flex border border-gray-200 mb-8 bg-white rounded-xl shadow-md">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex-1 py-3  text-center text-base font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-blue-600 bg-gray-50 text-blue-700"
                  : "border-b-2 border-transparent text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.name}
            </button>
          ))}
        </div>

      <div className="w-full max-w-8xl bg-white rounded-xl shadow-md p-0  items-center">
        {/* Content */}
        <div className="p-8">
          {activeTab === "ai" && (
            <form>
              <h2 className="text-xl font-semibold mb-2">AI Assistant Configuration</h2>
              <p className="text-gray-500 mb-6">Customize how the AI responds to buyer questions</p>
              {/* Assistant Tone */}
              <div className="mb-6">
                <div className="font-medium mb-2">Assistant Tone</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tone"
                      checked={assistantTone === "formal"}
                      onChange={() => setAssistantTone("formal")}
                      className="accent-blue-600"
                    />
                    <span>
                      <span className="font-medium">Formal</span>
                      <span className="block text-gray-500 text-sm">
                        Professional, detailed responses with <span className="text-blue-600">industry terminology</span>
                      </span>
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tone"
                      checked={assistantTone === "balanced"}
                      onChange={() => setAssistantTone("balanced")}
                      className="accent-blue-600"
                    />
                    <span>
                      <span className="font-medium">Balanced</span>
                      <span className="block text-gray-500 text-sm">
                        Friendly but professional, moderate detail level
                      </span>
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tone"
                      checked={assistantTone === "casual"}
                      onChange={() => setAssistantTone("casual")}
                      className="accent-blue-600"
                    />
                    <span>
                      <span className="font-medium">Casual</span>
                      <span className="block text-gray-500 text-sm">
                        Conversational, easy-going, and approachable
                      </span>
                    </span>
                  </label>
                </div>
              </div>
              {/* Response Style */}
              <div className="mb-6">
                <div className="font-medium mb-2">Response Style</div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">Concise Responses</div>
                    <div className="text-gray-500 text-sm">Keep answers short and to the point</div>
                  </div>
                  <Switch checked={concise} onChange={() => setConcise(!concise)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Technical Details</div>
                    <div className="text-gray-500 text-sm">Include technical specifications in responses</div>
                  </div>
                  <Switch checked={technical} onChange={() => setTechnical(!technical)} />
                </div>
              </div>
              {/* Knowledge Base */}
              <div className="mb-8">
                <div className="font-medium mb-2">Knowledge Base</div>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-100">
                  <div>
                    <div className="text-gray-700">5 documents uploaded</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-4 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm"
                    >
                      Manage Documents
                    </button>
                    <button
                      type="button"
                      className="px-4 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm"
                    >
                      Test AI
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded font-medium"
              >
                Save AI Settings
              </button>
            </form>
          )}

          {activeTab === "cta" && (
            <form>
              <h2 className="text-xl font-semibold mb-2">Call-to-Action Buttons</h2>
              <p className="text-gray-500 mb-6">
                Configure the action buttons shown to prospects
              </p>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="font-medium">Enable CTA Buttons</div>
                  <div className="text-gray-500 text-sm">Show action buttons in the demo</div>
                </div>
                <Switch checked={ctaEnabled} onChange={() => setCtaEnabled(!ctaEnabled)} />
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">Primary CTA</label>
                <select
                  value={primaryCta}
                  onChange={(e) => setPrimaryCta(e.target.value)}
                  className="border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Book a Meeting</option>
                  <option>Contact Sales</option>
                  <option>Request Demo</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">Secondary CTA</label>
                <select
                  value={secondaryCta}
                  onChange={(e) => setSecondaryCta(e.target.value)}
                  className="border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Contact Sales</option>
                  <option>Book a Meeting</option>
                  <option>Request Demo</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">Show CTA After</label>
                <select
                  value={showCtaAfter}
                  onChange={(e) => setShowCtaAfter(e.target.value)}
                  className="border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Immediately</option>
                  <option>After Interaction</option>
                  <option>After 1 Minute</option>
                </select>
              </div>
              <div className="mb-8">
                <label className="block font-medium mb-1">Meeting Booking URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://calendly.com/your-link"
                    className="border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="inline-flex items-center p-2 text-gray-400">
                    <svg width="20" height="20" fill="none" stroke="currentColor">
                      <path d="M10 3v1m0 12v1m7-7h-1M4 10H3m11.31-6.31l-.71.71M6.41 17.59l-.71.71m12.02-12.02l-.71.71M6.41 2.41l-.71.71" />
                    </svg>
                  </span>
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Where to send prospects when they click "Book a Meeting"
                </div>
              </div>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded font-medium"
              >
                Save CTA Settings
              </button>
            </form>
          )}

          {activeTab === "notifications" && (
            <form>
              <h2 className="text-xl font-semibold mb-2">Notification Settings</h2>
              <p className="text-gray-500 mb-6">
                Configure when and how you receive alerts
              </p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-gray-500 text-sm">Receive updates via email</div>
                </div>
                <Switch checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium">High Engagement Alerts</div>
                  <div className="text-gray-500 text-sm">Alert when prospects show high interest</div>
                </div>
                <Switch checked={highEngagement} onChange={() => setHighEngagement(!highEngagement)} />
              </div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="font-medium">Daily Activity Digest</div>
                  <div className="text-gray-500 text-sm">Receive a summary each day</div>
                </div>
                <Switch checked={dailyDigest} onChange={() => setDailyDigest(!dailyDigest)} />
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">Notification Email</label>
                <input
                  type="email"
                  value={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-8">
                <label className="block font-medium mb-1">Webhook URL (Optional)</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-crm.com/webhook"
                  className="border rounded px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-gray-400 text-xs mt-1">
                  Send interaction data to your CRM or other systems
                </div>
              </div>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded font-medium"
              >
                Save Notification Settings
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

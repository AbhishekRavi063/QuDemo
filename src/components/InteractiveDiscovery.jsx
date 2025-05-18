import React, { useState } from "react";
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/outline";

const InteractiveDiscovery = () => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([
    {
      sender: "AI",
      text: "✨ Welcome to an interactive journey! I'm your product experience guide. Let's create a personalized demo just for you. First off, what should I call you?",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setChatLog([...chatLog, { sender: "You", text: message }]);
    setMessage("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white w-full max-w-3xl h-[600px] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-6 w-6 text-white" />
            <div>
              <div className="font-semibold text-lg">Interactive Discovery</div>
              <div className="text-sm text-white/80">Personalized product experience</div>
            </div>
          </div>
          <button>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50">
          {chatLog.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "AI" ? "justify-start" : "justify-end"}`}>
              <div
                className={`rounded-lg px-5 py-3 max-w-[75%] text-base ${
                  msg.sender === "AI"
                    ? "bg-white border text-gray-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="text-blue-600 hover:text-blue-800 transition"
          >
            <PaperAirplaneIcon className="h-8 w-10"  />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDiscovery;

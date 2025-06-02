import React, { useState } from "react";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";

const InteractiveDemoPopup = ({ onClose }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4 py-6">
      <div className="bg-white w-full max-w-3xl h-full max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 px-4 sm:px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-6 w-6 text-white" />
            <div>
              <div className="font-semibold text-lg">Interactive Discovery</div>
              <div className="text-sm text-white/80">Personalized product experience</div>
            </div>
          </div>
          <button onClick={onClose} className="hover:text-gray-300">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 px-4 sm:px-6 py-4 space-y-4 overflow-y-auto bg-gray-50">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "AI" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`rounded-lg px-4 py-2 text-sm sm:text-base max-w-[80%] ${
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
        <div className="p-3 sm:p-4 border-t flex items-center gap-3 bg-white">
          <input
            type="text"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <NavLink to="/VideoDemoChatPopup">
            <button
              onClick={sendMessage}
              className="text-blue-600 hover:text-blue-800 transition"
            >
              <PaperAirplaneIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemoPopup;

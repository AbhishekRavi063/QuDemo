import React, { useState } from "react";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const VideoDemoChatPopup = () => {
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Hello! I'm your AI assistant. Feel free to ask any questions about the product while watching the demo.",
      time: "7:34 PM",
    },
  ]);
  const [input, setInput] = useState("");

  const navigate = useNavigate();

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([...messages, { sender: "You", text: input, time: now }]);
    setInput("");
  };

  const handleClose = () => {
    navigate("/home"); // Redirect to home when modal is closed
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      <div
        className="w-[80vw] h-[90vh] bg-white rounded-lg shadow-2xl flex overflow-hidden relative"
        onClick={(e) => e.stopPropagation()} // Prevent click propagation
      >
        {/* Left: Video Section */}
        <div className="w-2/3 bg-black relative">
          <video
            controls
            className="w-full h-full object-cover"
            poster="https://via.placeholder.com/800x450"
          >
            <source src="your-video-url.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Right: Chat Section */}
        <div className="w-1/3 flex flex-col bg-white border-l">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
            <div>
              <div className="font-semibold">Ask questions about this demo</div>
              <div className="text-xs text-white/80">
                Our AI assistant will answer in real-time
              </div>
            </div>
            <XMarkIcon className="h-5 w-5 cursor-pointer" onClick={handleClose} />
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 ${
                  msg.sender === "AI" ? "justify-start" : "justify-end"
                }`}
              >
                {msg.sender === "AI" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                    AI
                  </div>
                )}

                <div
                  className={`rounded-xl px-4 py-2 max-w-[70%] text-sm ${
                    msg.sender === "AI"
                      ? "bg-white border text-gray-800"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sender === "You" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    Y
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              placeholder="Ask a question about this product..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="text-blue-600 hover:text-blue-800"
            >
              <PaperAirplaneIcon className="h-8 w-10 " />
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="p-6 flex justify-between text-xs bg-white">
            <span className="text-gray-500 py-2">Powered by Qudemo AI</span>
            <div className="flex gap-2">
              <button className="text-blue-600 font-semibold hover:underline border border-gray-300 rounded px-4 py-2">
                FAQs
              </button>
              <button className="text-blue-600 font-semibold hover:underline border border-gray-300 rounded px-4 py-2">
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDemoChatPopup;

import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player/youtube";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TypingIndicator = () => (
  <div className="typing-indicator flex space-x-1">
    <span className="dot animate-bounce delay-150"></span>
    <span className="dot animate-bounce delay-300"></span>
    <span className="dot animate-bounce delay-450"></span>

    <style jsx>{`
      .typing-indicator {
        align-items: center;
      }
      .dot {
        width: 8px;
        height: 8px;
        background-color: #2563eb; /* blue-600 */
        border-radius: 50%;
        display: inline-block;
        animation-duration: 1s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
      }
      .animate-bounce {
        animation-name: bounce-dot;
      }
      .delay-150 {
        animation-delay: 0.15s;
      }
      .delay-300 {
        animation-delay: 0.3s;
      }
      .delay-450 {
        animation-delay: 0.45s;
      }

      @keyframes bounce-dot {
        0%, 80%, 100% {
          transform: translateY(0);
          opacity: 0.3;
        }
        40% {
          transform: translateY(-8px);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

const VideoDemoChatPopup = () => {
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Hello! I'm your AI assistant. Ask any questions related to this demo.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [videoUrl, setVideoUrl] = useState(
    "https://youtu.be/_zRaJOF-trE?si=-49QCSw2FbrTxpvi&t=0"
  );
  const [playing, setPlaying] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const playerRef = useRef();
  const navigate = useNavigate();

  const getTimestampFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const tParam = urlObj.searchParams.get("t");
      return tParam ? parseInt(tParam, 10) : 0;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    if (videoUrl && playerRef.current) {
      const seconds = getTimestampFromUrl(videoUrl);
      const timer = setTimeout(() => {
        playerRef.current.seekTo(seconds, "seconds");
        setPlaying(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [videoUrl]);

  const cleanMessageText = (text) => {
    return text
      .replace(/\*\*/g, "") // remove bold
      .replace(/^- /gm, "") // remove list dash
      .replace(/\* /g, "") // remove bullets
      .replace(/\(.*?page.*?\)/gi, "") // remove (page x)
      .replace(/help\.puzzle\.io.*?\.pdf/gi, "") // remove file names
      .replace(/\s{2,}/g, " ") // collapse multiple spaces
      .trim();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { sender: "You", text: input, time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPlaying(false);
    setIsTyping(true);

    try {
      const res = await axios.post("https://qudemoo-backend.onrender.com/ask", { question: input });

      if (res.data.video_url) {
        setVideoUrl(res.data.video_url);
      }

      const aiMsg = {
        sender: "AI",
        text: cleanMessageText(res.data.answer),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("API error", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClose = () => navigate("/home");

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-7xl h-full max-h-[85vh] bg-white rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Section */}
        <div className="w-full md:w-2/3 relative">
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            controls
            playing={playing}
            width="100%"
            height="100%"
          />
        </div>

        {/* Chat Section */}
        <div className="w-full md:w-2/4 flex flex-col bg-white border-l">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm sm:text-base">Ask questions about this demo</div>
              <div className="text-xs text-white/80">Our AI assistant will answer in real-time</div>
            </div>
            <XMarkIcon className="h-5 w-5 cursor-pointer" onClick={handleClose} />
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "AI" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`rounded-xl px-4 py-2 max-w-[80%] ${
                    msg.sender === "AI"
                      ? "bg-white border text-gray-800"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-xl px-4 py-2 max-w-[80%] bg-white border text-gray-800 select-none">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              placeholder="Ask a question about this product..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="text-blue-600 hover:text-blue-800">
              <PaperAirplaneIcon className="h-7 w-8" />
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 flex flex-col sm:flex-row sm:justify-between items-center text-xs gap-2 bg-white border-t">
            <span className="text-gray-500">Powered by Qudemo AI</span>
            <div className="flex gap-2">
              <button className="text-blue-600 font-semibold hover:underline border border-gray-300 rounded px-3 py-1.5">
                FAQs
              </button>
              <button className="text-blue-600 font-semibold hover:underline border border-gray-300 rounded px-3 py-1.5">
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

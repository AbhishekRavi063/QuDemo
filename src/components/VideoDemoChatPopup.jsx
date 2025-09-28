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
        background-color: #2563eb;
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
        0%,
        80%,
        100% {
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

const cleanMessageText = (text) => {
  // Remove unwanted patterns
  let cleaned = text
    .replace(/\*\*/g, "")
    .replace(/\(.*?page.*?\)/gi, "")
    .replace(/help\.puzzle\.io.*?\.pdf/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Convert URLs to clickable links
  cleaned = cleaned.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${url}</a>`
  );

  // Split at each '– ' and wrap each in <p> tags, preserving the intro as its own paragraph
  const parts = cleaned.split(/(?=– )/g);
  return parts.map(part => `<p>${part.trim()}</p>`).join("");
};

const VideoDemoChatPopup = ({ onClose }) => {
    const [source, setSource] = useState("puzzle");
    const [messages, setMessages] = useState([
      {
        sender: "AI",
        text: cleanMessageText(`Hello! I'm your AI Assistant for this puzzle demo.`),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
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

  const sendMessage = async () => {
    if (!input.trim()) return;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const userMsg = { sender: "You", text: input, time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPlaying(false);
    setIsTyping(true);

    try {
      // Choose endpoint based on source
      let endpoint = "https://qudemo-backend.onrender.com/ask/puzzle";
      if (source === "mixpanel") {
        endpoint = "https://qudemo-backend.onrender.com/ask/mixpanel";
      }
      const res = await axios.post(endpoint, {
        question: input,
      });
      if (res.data.video_url) {
        setVideoUrl(res.data.video_url);
      }
      const aiMsg = {
        sender: "AI",
        text: cleanMessageText(res.data.answer),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("API error", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  };

  const handleSourceChange = async (e) => {
    const selectedSource = e.target.value;
    setSource(selectedSource);
    // Update the initial message based on the dropdown
    setMessages([
      {
        sender: "AI",
        text: getInitialMessage(selectedSource),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    // Update the video based on the dropdown
    setVideoUrl(
      selectedSource === "mixpanel"
        ? "https://youtu.be/c7SfDNFhD0E?si=1oD7SVquYz2R7i4R"
        : "https://youtu.be/_zRaJOF-trE?si=-49QCSw2FbrTxpvi&t=0"
    );
    try {
      await axios.post("https://qudemo-backend.onrender.com/bucket", { source: selectedSource });
    } catch (err) {
      console.error("Error posting to /bucket:", err);
    }
  };

  const getInitialMessage = (source) => {
    if (source === "mixpanel") {
      return cleanMessageText(`
    Hello! I'm your AI Assistant for mixpanel demo.
      `);
    } else {
      return cleanMessageText(`
    Hello! I'm your AI Assistant for this product demo.
      `);
    }
  };

  // List of suggested questions for puzzle
  const puzzleQuestions = [
    "How to integrate with Stripe?",
    "Explain the Spotlight feature.",
    "How do I upload my invoices?",
    "How does the real-time dashboard calculate metrics like net burn and runway?",
    "How to do reconciliations?",
    "What is the general ledger in Puzzle?",
    "How can I view or add fixed assets?",
    "How can I manage my prepaid accounts?",
    "How can I add manual journals?",
    "How does Puzzle handle charts of accounts?"
  ];

  // Handle clicking a question bubble
  const handleQuestionClick = async (question) => {
    setInput(question);
    // Wait for input to update, then send
    setTimeout(() => {
      sendMessage(question);
    }, 0);
  };

  return (
    <div
      className=" inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[1200px]  h-[600px] max-h-[85vh] bg-white rounded-lg flex flex-col md:flex-row overflow-hidden relative"
        style={{ boxShadow: '0 0 40px 8px purple' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Section */}
        <div className="w-full md:w-2/3 relative">
          <ReactPlayer
            key={videoUrl} // <-- add this line
            ref={playerRef}
            url={videoUrl}
            controls
            playing={playing}
            width="100%"
            height="100%"
            config={{
              youtube: {
                playerVars: {
                  rel: 0,
                  modestbranding: 1,
                  iv_load_policy: 3,
                  fs: 0,
                  cc_load_policy: 0,
                  disablekb: 1,
                  playsinline: 1,
                  showinfo: 0,
                  loop: 0,
                  end: 0,
                  wmode: 'opaque',
                  origin: window.location.origin,
                  widget_referrer: window.location.origin,
                  html5: 1,
                  vq: 'hd720',
                  disable_polymer: 1,
                  no_https: 1,
                  hl: 'en',
                  cc_lang_pref: 'en'
                }
              }
            }}
          />
        </div>

        {/* Chat Section */}
        <div className="w-full md:w-2/4 flex flex-col bg-white border-l">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="font-semibold text-sm sm:text-base">
                Ask questions about this demo
              </div>
              
              {/* Dropdown 
              <select
                className="ml-2 px-2 py-1 rounded text-blue-700 text-xs sm:text-sm focus:outline-none cursor-pointer"
                value={source}
                onChange={handleSourceChange}
              >
                <option value="puzzle">Puzzle</option>
                <option value="mixpanel">Mixpanel</option>
              </select>*/}
            </div>
            <XMarkIcon
              className="h-5 w-5 cursor-pointer"
              onClick={handleClose}
            />
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
                    msg.sender === "AI" ? "bg-white border text-gray-800" : "bg-blue-600 text-white"
                  }`}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: msg.text, // already cleaned before storing
                    }}
                  />
                </div>
              </div>
            ))}
            {/* Show question bubbles for puzzle source */}
            {source === "puzzle" && (
              <div className="flex flex-wrap gap-2 mb-3">
                {puzzleQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition border border-blue-200"
                    onClick={() => handleQuestionClick(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-2 max-w-[80%] bg-white border text-gray-800 select-none">
                <TypingIndicator />
              </div>
            </div>
          )}

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
            <button
              onClick={sendMessage}
              className="text-blue-600 hover:text-blue-800"
            >
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

import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player/youtube";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCompany } from "../context/CompanyContext";

const TypingIndicator = () => (
  <div className="typing-indicator flex space-x-1">
    <span className="dot animate-bounce delay-150"></span>
    <span className="dot animate-bounce delay-300"></span>
    <span className="dot animate-bounce delay-450"></span>

    <style>{`
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
    .replace(/\s{2,}/g, " ")
    .trim();

  // Ensure bullet points and numbers are on new lines
  cleaned = cleaned
    // New line before bullets (•, -, *) if not already at line start
    .replace(/\s*([•\-*])\s+/g, "<br/>$1 ")
    // New line before numbered lists (1., 2., etc.) if not already at line start
    .replace(/\s*(\d+\.)\s+/g, "<br/>$1 ");

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

const VideoDemoChatPopup = () => {
    const { company, isLoading } = useCompany();
    const [messages, setMessages] = useState([
      {
        sender: "AI",
        text: cleanMessageText(`Hello! I'm your AI Assistant for this demo.`),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    const [companyVideos, setCompanyVideos] = useState([]);
    const [videoUrl, setVideoUrl] = useState("");
    const [playing, setPlaying] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [input, setInput] = useState("");
    const playerRef = useRef();
    const navigate = useNavigate();

    // Fetch company videos on mount or when company changes
    useEffect(() => {
      if (!company || !company.id) return;
      const fetchVideos = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/qudemos?companyId=${company.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (res.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
            setCompanyVideos(data.data);
            // Pick a random video
            const randomVideo = data.data[Math.floor(Math.random() * data.data.length)];
            setVideoUrl(randomVideo.video_url);
          } else {
            setCompanyVideos([]);
            setVideoUrl("");
          }
        } catch (err) {
          setCompanyVideos([]);
          setVideoUrl("");
        }
      };
      fetchVideos();
    }, [company]);

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

    // Debug: Monitor videoUrl changes
    useEffect(() => {
      console.log("Video URL changed to:", videoUrl);
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
        if (!company || !company.name) throw new Error("No company selected");
        const endpoint = `${process.env.REACT_APP_PYTHON_API_URL}/ask/${company.name}`;
        const res = await axios.post(endpoint, {
          question: input,
        });
        
        if (res.data.error) {
          // Handle error response from the API
          const errorMsg = {
            sender: "AI",
            text: res.data.error,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMessages((prev) => [...prev, errorMsg]);
        } else {
          // Handle successful response
          console.log("API Response:", res.data);
          if (res.data.video_url) {
            console.log("Setting video URL to:", res.data.video_url);
            setVideoUrl(res.data.video_url);
          } else {
            console.log("No video_url in response");
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
        }
      } catch (err) {
        console.error("API error", err);
        
        // Show user-friendly error message
        let errorMessage = "Sorry, I couldn't process your question right now. Please try again.";
        
        if (err.response) {
          // Server responded with error status
          if (err.response.data && err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.status === 500) {
            errorMessage = "Sorry, there was a server error. Please try again later.";
          } else if (err.response.status === 404) {
            errorMessage = "Sorry, the service is not available right now.";
          }
        } else if (err.request) {
          // Network error
          errorMessage = "Sorry, I couldn't connect to the server. Please check your internet connection and try again.";
        }
        
        const errorMsg = {
          sender: "AI",
          text: errorMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    };

    const handleClose = () => navigate("/");

    // Handle clicking a question bubble
    const handleQuestionClick = async (question) => {
      setInput(question);
      // Wait for input to update, then send
      setTimeout(() => {
        sendMessage(question);
      }, 0);
    };

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (!company) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No company selected.</div>
        </div>
      );
    }

    if (companyVideos.length === 0 || !videoUrl) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No videos found for this company.</div>
        </div>
      );
    }

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
            {console.log("Rendering ReactPlayer with URL:", videoUrl)}
            <ReactPlayer
              key={videoUrl}
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
              <div className="flex items-center gap-4">
                <div className="font-semibold text-sm sm:text-base">
                  Ask questions about this demo
                </div>
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
                      msg.sender === "AI"
                        ? "bg-white border text-gray-800 text-left"
                        : "bg-blue-600 text-white text-right"
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
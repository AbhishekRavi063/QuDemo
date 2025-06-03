// import React, { useState, useRef } from "react";
// import ReactPlayer from "react-player/youtube";
// import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const VideoDemoChatPopup = () => {
//   const [messages, setMessages] = useState([
//     {
//       sender: "AI",
//       text: "Hello! I'm your AI assistant. Ask any questions related to this demo.",
//       time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const navigate = useNavigate();
//   const playerRef = useRef();

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//     const userMsg = { sender: "You", text: input, time: now };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");

//     try {
//       const res = await axios.post("http://127.0.0.1:8000/ask", { question: input });

//       // Extract first timestamp from source string
//       const firstTimestamp = res.data.sources?.[0]?.match(/\[(\d{2}):(\d{2}):(\d{2}),/);
//       if (firstTimestamp) {
//         const [ , h, m, s ] = firstTimestamp.map(Number);
//         const seconds = h * 3600 + m * 60 + s;
//         if (playerRef.current) {
//           playerRef.current.seekTo(seconds, "seconds");
//         }
//       }

//       const aiMsg = {
//         sender: "AI",
//         text: res.data.answer,
//         time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//       };
//       setMessages((prev) => [...prev, aiMsg]);
//     } catch (err) {
//       console.error("API error", err);
//     }
//   };

//   const handleClose = () => navigate("/home");

//   return (
//     <div
//       className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
//       onClick={handleClose}
//     >
//       <div
//         className="w-full max-w-7xl h-full max-h-[85vh] bg-white rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Video Section */}
//         <div className="w-full md:w-2/3 relative">
//           <ReactPlayer
//             ref={playerRef}
//             url="https://youtu.be/_zRaJOF-trE?si=sVMbw7ORYA3W7YwX"
//             controls
//             width="100%"
//             height="100%"
//           />
//         </div>

//         {/* Chat Section */}
//         <div className="w-full md:w-2/4 flex flex-col bg-white border-l">
//           {/* Header */}
//           <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
//             <div>
//               <div className="font-semibold text-sm sm:text-base">Ask questions about this demo</div>
//               <div className="text-xs text-white/80">
//                 Our AI assistant will answer in real-time
//               </div>
//             </div>
//             <XMarkIcon className="h-5 w-5 cursor-pointer" onClick={handleClose} />
//           </div>

//           {/* Chat Messages */}
//           <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50 text-sm">
//             {messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`flex ${msg.sender === "AI" ? "justify-start" : "justify-end"}`}
//               >
//                 <div
//                   className={`rounded-xl px-4 py-2 max-w-[80%] ${
//                     msg.sender === "AI"
//                       ? "bg-white border text-gray-800"
//                       : "bg-blue-600 text-white"
//                   }`}
//                 >
//                   {msg.text}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Input */}
//           <div className="p-3 border-t flex items-center gap-2">
//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               type="text"
//               placeholder="Ask a question about this product..."
//               className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button onClick={sendMessage} className="text-blue-600 hover:text-blue-800">
//               <PaperAirplaneIcon className="h-7 w-8" />
//             </button>
//           </div>

//           {/* Footer */}
//           <div className="p-4 flex flex-col sm:flex-row sm:justify-between items-center text-xs gap-2 bg-white border-t">
//             <span className="text-gray-500">Powered by Qudemo AI</span>
//             <div className="flex gap-2">
//               <button className="text-blue-600 font-semibold hover:underline border border-gray-300 rounded px-3 py-1.5">
//                 FAQs
//               </button>
//               <button className="text-blue-600 font-semibold hover:underline border border-gray-300 rounded px-3 py-1.5">
//                 Schedule Meeting
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoDemoChatPopup;

import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player/youtube";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  ); // Default video URL including t=0 for consistency
  const [playing, setPlaying] = useState(false); // Control autoplay

  const playerRef = useRef();
  const navigate = useNavigate();

  // Function to parse timestamp from YouTube URL query param `t`
  const getTimestampFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const tParam = urlObj.searchParams.get("t");
      return tParam ? parseInt(tParam, 10) : 0;
    } catch {
      return 0;
    }
  };

  // Seek video to timestamp when videoUrl changes or player is ready
  useEffect(() => {
    if (videoUrl && playerRef.current) {
      const seconds = getTimestampFromUrl(videoUrl);
      const timer = setTimeout(() => {
        playerRef.current.seekTo(seconds, "seconds");
        setPlaying(true);  // Start autoplay after seeking
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [videoUrl]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { sender: "You", text: input, time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPlaying(false); // Pause while waiting for answer

    try {
      const res = await axios.post("https://qudemoo-backend.onrender.com/ask", { question: input });

      // If backend returns a new video URL, update the player URL with full timestamp
      if (res.data.video_url) {
        setVideoUrl(res.data.video_url);
      }

      const aiMsg = {
        sender: "AI",
        text: res.data.answer,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("API error", err);
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
            playing={playing}    // <-- autoplay control
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
              <div className="text-xs text-white/80">
                Our AI assistant will answer in real-time
              </div>
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

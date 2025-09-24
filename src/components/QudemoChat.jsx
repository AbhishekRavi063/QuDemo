import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { useCompany } from '../context/CompanyContext';
import { getNodeApiUrl } from '../config/api';
import { authenticatedFetch, clearAuthTokens } from '../utils/tokenRefresh';

const QudemoChat = ({ qudemoId, qudemoTitle }) => {
  const { company } = useCompany();
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: `Hello! I'm your AI Assistant for "${qudemoTitle}". I can help you with questions about this specific qudemo's content, including videos and knowledge sources. What would you like to know?`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Monitor timestamp changes and reset video state when needed
  useEffect(() => {
    if (currentTimestamp > 0) {
      // When timestamp changes, ensure video is ready to play
      setIsPlaying(true);

    }
  }, [currentTimestamp]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      sender: "You",
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {

        setMessages(prev => [...prev, {
          sender: "AI",
          text: "Please log in to ask questions.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        }]);
        setIsTyping(false);
        return;
      }

      const response = await authenticatedFetch(getNodeApiUrl(`/api/qa/qudemo/${qudemoId}`), {
        method: 'POST',
        body: JSON.stringify({
          question: input
        })
      });

      // Handle authentication errors after refresh attempt
      if (response.status === 401 || response.status === 403) {

        clearAuthTokens();
        
        setMessages(prev => [...prev, {
          sender: "AI",
          text: "Your session has expired. Please refresh the page and log in again.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        }]);
        setIsTyping(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          sender: "AI",
          text: data.answer,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sources: data.sources || [],
          videoUrl: data.video_url,
          timestamp: data.start,
          answerSource: data.answer_source, // can be 'video' | 'knowledge' | 'hybrid' | 'combined'
          searchMethod: data.search_method, // 'hybrid' | 'standard' | 'topic_wise'
          confidence: data.confidence,
          searchScore: data.search_score,
          hybridScores: data.hybrid_scores,
          formattedTimestamp: data.formatted_timestamp,
          difficultyLevel: data.difficulty_level,
          estimatedTime: data.estimated_time
        };

        setMessages(prev => [...prev, aiMessage]);

        // Enhanced video timestamp handling for hybrid Q&A
        if (data.video_url && data.start !== undefined) {
          setCurrentVideoUrl(data.video_url);
          setCurrentTimestamp(data.start);
          // Force play state when new video timestamp is received
          setIsPlaying(true);
          
          // Enhanced logging for hybrid Q&A
          if (data.searchMethod === 'hybrid') {

          } else {

          }

        }
      } else {
        const errorMessage = {
          sender: "AI",
          text: data.error || "I'm sorry, I couldn't process your question. Please try again.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        sender: "AI",
        text: "I'm sorry, there was an error processing your question. Please try again.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const playVideoAtTimestamp = (videoUrl, timestamp) => {
    setCurrentVideoUrl(videoUrl);
    setCurrentTimestamp(timestamp);
    setIsPlaying(true);
    
    // Force video to play when jumping to timestamp
    // This ensures the video jumps even if it was manually paused

    // If this is a different timestamp than current, force play state
    if (timestamp !== currentTimestamp) {
      setIsPlaying(true);
      // Reset any paused state to ensure video can jump

    }
  };

  const resetVideoState = () => {
    // Reset video state when needed
    setIsPlaying(false);
    setCurrentTimestamp(0);

  };

  const renderMessage = (message, index) => {
    const isAI = message.sender === "AI";
    
    return (
      <div
        key={index}
        className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isAI
              ? 'bg-blue-100 text-gray-800'
              : 'bg-blue-500 text-white'
          }`}
        >
          <div className="text-sm">{message.text}</div>
          
          {/* Source attribution */}
          {isAI && message.sources && message.sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-1">
                Source: {message.answerSource === 'video' ? 'Video Transcript' : message.answerSource === 'knowledge' ? 'Knowledge Base' : 'Combined'}
              </div>
              
              {message.sources.map((source, idx) => (
                <div key={idx} className="text-xs text-gray-500">
                  {((source.type === 'video') || (source.content_type === 'video')) && (source.start_timestamp !== undefined || source.timestamp !== undefined) && (
                    <button
                      onClick={() => playVideoAtTimestamp((source.video_url || source.url), (source.start_timestamp !== undefined ? source.start_timestamp : source.timestamp))}
                      className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      <PlayIcon className="w-3 h-3" />
                      {(source.title || 'Video')} at {formatTimestamp((source.start_timestamp !== undefined ? source.start_timestamp : source.timestamp))}
                    </button>
                  )}
                  {(source.type === 'knowledge' || source.content_type === 'knowledge') && (
                    <div className="text-gray-600">
                      📚 {source.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-1">
            {message.time}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg">
        <h3 className="font-semibold">Qudemo Chat - {qudemoTitle}</h3>
        <p className="text-sm opacity-90">Ask questions about this specific qudemo</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-blue-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">AI is typing</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Video Player Section */}
      {currentVideoUrl && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-700">Video Player</h4>
            <div className="flex space-x-2">
              <button
                onClick={resetVideoState}
                className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1 border border-gray-300 rounded"
                title="Reset video state"
              >
                Reset
              </button>
              <button
                onClick={() => setCurrentVideoUrl(null)}
                className="text-gray-500 hover:text-gray-700"
                title="Close video player"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="bg-black rounded-lg p-2 text-white text-center">
            <div className="flex items-center justify-center space-x-2">
              {isPlaying ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
              <span>Video ready at {formatTimestamp(currentTimestamp)}</span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              {isPlaying ? 'Playing' : 'Paused'} - Click timestamp links above to jump to specific parts
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Status: {isPlaying ? 'Active' : 'Inactive'} | Timestamp: {formatTimestamp(currentTimestamp)}
            </p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about this qudemo..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QudemoChat;

import React, { useState, useRef, useEffect } from "react";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import { useCompany } from '../context/CompanyContext';

const InteractiveDemoPopup = ({ onClose, onSendRocket }) => {
  const { company } = useCompany();
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([
    {
      sender: "AI",
      text: "✨ Welcome! I'm your friendly product assistant. May I know your name, please?",
    },
  ]);
  const [step, setStep] = useState(0);
  const [lead, setLead] = useState({ name: '', company_name: '', phone: '', email: '', position: '', need: '' });
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(false);
  const chatAreaRef = useRef(null);

  const questions = [
    { key: 'name', prompt: "Could you please tell me your name? 😊", validate: v => v.trim().length > 1 },
    { key: 'company_name', prompt: "Thank you! May I know the name of your company?", validate: v => v.trim().length > 1 },
    { key: 'phone', prompt: "Great! Could you share your phone number? (digits only, min 7) 📞", validate: v => /^\d{7,}$/.test(v.trim()) },
    { key: 'email', prompt: "And your email address, please? 📧", validate: v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()) },
    { key: 'position', prompt: "What is your position at your company?", validate: v => v.trim().length > 1 },
    { key: 'need', prompt: "Finally, what would you like to achieve or explore with this demo?", validate: v => v.trim().length > 3 },
  ];

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [chatLog]);

  const sendMessage = async () => {
    if (!message.trim() || isComplete) return;
    const currentQ = questions[step];
    setChatLog([...chatLog, { sender: "You", text: message }]);
    setMessage("");
    if (!currentQ.validate(message)) {
      setTimeout(() => {
        setChatLog(log => [...log, { sender: "AI", text: `Oops! That doesn't seem right. ${currentQ.prompt}` }]);
        setRetry(true);
      }, 500);
      return;
    }
    setLead({ ...lead, [currentQ.key]: message });
    setRetry(false);
    if (step < questions.length - 1) {
      setTimeout(() => {
        setChatLog(log => [...log, { sender: "AI", text: questions[step + 1].prompt }]);
        setStep(step + 1);
      }, 500);
    } else {
      setIsSubmitting(true);
      setTimeout(async () => {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...lead, [currentQ.key]: message, company_id: company?.id }),
          });
          const data = await res.json();
          if (data.success) {
            setChatLog(log => [...log, { sender: "AI", text: "Thank you so much! Your details have been received. Our team will reach out soon. Feel free to ask anything or explore the demo!" }]);
            setIsComplete(true);
            if (typeof onSendRocket === 'function') onSendRocket(data.data.id);
          } else {
            setError(data.error || 'Failed to submit details.');
          }
        } catch (err) {
          setError('Network error. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      }, 800);
    }
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
        <div className="flex-1 px-4 sm:px-6 py-4 space-y-4 overflow-y-auto bg-gray-50" ref={chatAreaRef}>
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
            placeholder={isComplete ? "Thank you!" : "Type your answer here..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isComplete || isSubmitting}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={() => {
              sendMessage();
            }}
            className="text-blue-600 hover:text-blue-800 transition"
            disabled={isComplete || isSubmitting}
          >
            <PaperAirplaneIcon className="h-7 w-7 sm:h-8 sm:w-8" />
          </button>
        </div>

        {error && (
          <div className="p-2 text-red-600 text-center text-sm bg-red-50 border border-red-200 rounded mt-2">{error}</div>
        )}
      </div>
    </div>
  );
};

export default InteractiveDemoPopup;

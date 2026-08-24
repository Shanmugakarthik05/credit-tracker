import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

const QUICK_CHIPS = [
  'How is GPA calculated?',
  'What is CGPA?',
  'How to upload results?',
  'Track remaining credits',
];

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your CreditTracker assistant. Ask me anything about how the app works, GPA calculations, or uploading results!",
      sender: 'bot',
      time: getTime(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const { token } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowScrollBtn(!isNearBottom);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !token) return;
    setInputValue('');
    setMessages((prev) => [...prev, { id: Date.now(), text, sender: 'user', time: getTime() }]);
    setIsTyping(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text }),
      });
      const data = response.ok ? await response.json() : null;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: data?.response ?? "Sorry, I'm having trouble connecting right now.",
          sender: 'bot',
          time: getTime(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: "Sorry, I'm having trouble connecting right now.", sender: 'bot', time: getTime() },
      ]);
    }
    setIsTyping(false);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <>
      {/* ── FAB ─────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl text-white transition-all duration-300 flex items-center justify-center ${
          isOpen
            ? 'bg-slate-700 hover:bg-slate-600 rotate-90'
            : 'bg-gradient-to-br from-indigo-500 to-violet-600 hover:scale-110'
        }`}
        aria-label="Toggle chat"
      >
        {/* Pulse ring (visible when closed) */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-indigo-500/50 animate-ping-slow" />
        )}
        {isOpen ? <X className="w-5 h-5" /> : <Sparkles className="w-6 h-6" />}
      </button>

      {/* ── Chat Window ──────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[340px] sm:w-[380px] h-[520px] max-h-[75vh] bg-white rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden z-50 border border-slate-100 animate-slide-up">

          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 flex items-center gap-3">
            {/* Bot avatar */}
            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm leading-tight">Tracker Assistant</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-white/60 text-[10px] font-medium">Online · Powered by AI</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 px-4 py-4 overflow-y-auto bg-slate-50 space-y-3 custom-scrollbar"
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-auto">
                    <Bot className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                )}
                <div className={`group relative max-w-[82%]`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm'
                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {/* Timestamp on hover */}
                  <p className={`text-[10px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                  {[0, 150, 300].map((delay) => (
                    <div
                      key={delay}
                      className="w-2 h-2 bg-indigo-400 rounded-full"
                      style={{ animation: `bounce-dot 1s ${delay}ms ease-in-out infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll-to-bottom button */}
          {showScrollBtn && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute bottom-[72px] left-1/2 -translate-x-1/2 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-full p-1.5 shadow-md transition-all animate-fade-up z-10"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* Quick chips (only when 1 message) */}
          {messages.length === 1 && !isTyping && (
            <div className="px-3 py-2 border-t border-slate-100 bg-white flex gap-2 flex-wrap">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="text-[11px] font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors border border-indigo-100"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="px-3 py-3 bg-white border-t border-slate-100 flex gap-2 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 text-sm transition-all placeholder-slate-400"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full flex items-center justify-center disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

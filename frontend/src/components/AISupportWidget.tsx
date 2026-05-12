import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendHelpdeskMessage } from '../api/endpoints';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'How do I track my order?',
  'How do I pay for my order?',
  'Can I order from multiple shops?',
  'How long does delivery take?',
];

const AISupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'Hi! 👋 I\'m QuickMart\'s AI assistant. Ask me anything about orders, deliveries, or how to use the platform!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasNew(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Build conversation_history format for the API
  const buildHistory = (msgs: ChatMsg[]) =>
    msgs.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content,
    }));

  const handleSend = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isLoading) return;

    const userMsg: ChatMsg = { role: 'user', content: messageText };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setInput('');
    setIsLoading(true);

    try {
      const res = await sendHelpdeskMessage(messageText, buildHistory(updatedMsgs));
      const reply = res.data?.response || res.data?.message || res.data?.reply || 'I\'m sorry, I couldn\'t process that. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      if (!isOpen) setHasNew(true);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-4xl shadow-2xl shadow-orange-500/20 border-2 border-orange-100 overflow-hidden flex flex-col"
            style={{ maxHeight: '70vh' }}
          >
            {/* Header */}
            <div className="bg-orange-600 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm">QuickMart AI Support</p>
                <p className="text-orange-200 text-[10px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Always online
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-orange-50/20">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-orange-600 flex items-center justify-center text-white text-[10px] font-black shrink-0 mr-2 mt-0.5">
                      AI
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-[12px] leading-relaxed font-medium ${
                    msg.role === 'user'
                      ? 'bg-orange-600 text-white rounded-tr-sm font-bold'
                      : 'bg-white text-slate-700 border border-orange-100 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-orange-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">AI</div>
                  <div className="bg-white border border-orange-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="shrink-0 px-3 py-2 bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-black rounded-xl hover:bg-orange-100 transition-all whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-orange-50 bg-white">
              <div className="flex items-center gap-2 bg-orange-50 rounded-2xl p-1.5 border-2 border-orange-100 focus-within:border-orange-400 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 font-bold text-xs px-3 py-2 placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-orange-600/30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
              <p className="text-center text-[8px] text-slate-300 font-bold uppercase tracking-widest mt-2">Powered by QuickMart AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-20 sm:bottom-8 right-4 sm:right-6 z-50 w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl shadow-2xl shadow-orange-600/40 flex items-center justify-center transition-colors"
        aria-label="Open AI Support"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
              className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
              className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </motion.svg>
          )}
        </AnimatePresence>
        {hasNew && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>
    </>
  );
};

export default AISupportWidget;

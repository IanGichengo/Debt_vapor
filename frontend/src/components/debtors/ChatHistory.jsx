import React, { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';

export default function ChatHistory({ messages, onRefresh, debtorId }) {
  const scrollRef = useRef(null);

  // 1. Auto-scroll to bottom whenever new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 2. ⭐ AUTO-REFRESH LOGIC (Polling)
  useEffect(() => {
    if (!debtorId) return;

    // Refresh every 5 seconds
    const interval = setInterval(() => {
      console.log("Polling for new WhatsApp messages...");
      onRefresh();
    }, 5000);

    // Cleanup when the user leaves the page or changes debtor
    return () => clearInterval(interval);
  }, [debtorId, onRefresh]);

  return (
    <div className="flex flex-col h-[500px] bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-200 dark:border-gray-800 overflow-hidden">

      {/* Scrollable Area */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto scroll-smooth space-y-2 custom-scrollbar"
      >
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 opacity-60">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">No conversation history</p>
          </div>
        )}
      </div>

      {/* Optional: Chat Footer Info */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700">
        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
          Live Connection: Encrypted via WhatsApp Business API
        </p>
      </div>
    </div>
  );
}

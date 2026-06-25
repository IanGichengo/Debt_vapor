import React from 'react';
import { Bot, User, Clock, CheckCheck } from 'lucide-react';

export default function ChatBubble({ message }) {
  // Normalize direction to uppercase to avoid "in" vs "IN" bugs
  const direction = (message.direction || "OUT").toUpperCase();
  const isOutgoing = direction === "OUT" || direction === "OUTGOING";

  // Use message.content if it exists, otherwise fallback to message.message
  const textContent = message.content || message.message || "";

  return (
    <div className={`flex flex-col w-full mb-6 ${isOutgoing ? "items-end" : "items-start"}`}>

      {/* Header: Icon and Label */}
      <div className={`flex items-center gap-2 mb-1.5 px-1 ${isOutgoing ? "flex-row-reverse" : ""}`}>
        <div className={`p-1 rounded-full ${isOutgoing ? "bg-blue-100" : "bg-slate-100"}`}>
          {isOutgoing ? (
            <Bot className="w-3 h-3 text-blue-600" />
          ) : (
            <User className="w-3 h-3 text-slate-600" />
          )}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-tighter ${isOutgoing ? "text-blue-600" : "text-slate-500"}`}>
          {isOutgoing ? "DCS AI Assistant" : "Debtor Response"}
        </span>
      </div>

      {/* The Bubble */}
      <div className={`relative p-4 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm transition-all ${
        isOutgoing
          ? "bg-blue-600 text-white rounded-tr-none"
          : "bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-gray-700 rounded-tl-none"
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {textContent}
        </p>

        {/* Tail pseudo-element (Optional: for that extra polish) */}
        <div className={`absolute top-0 w-2 h-2 ${
          isOutgoing
            ? "-right-1 bg-blue-600 clip-path-triangle-right"
            : "-left-1 bg-white dark:bg-gray-800 border-t border-l border-slate-100 dark:border-gray-700 clip-path-triangle-left"
        }`} />
      </div>

      {/* Footer: Timestamp and Status */}
      <div className={`mt-1.5 flex items-center gap-3 px-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest ${isOutgoing ? "flex-row-reverse" : ""}`}>
        <div className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
        </div>

        {isOutgoing && (
          <div className="flex items-center gap-0.5 text-blue-500">
            <CheckCheck className="w-3 h-3" />
            <span>{message.status || "SENT"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

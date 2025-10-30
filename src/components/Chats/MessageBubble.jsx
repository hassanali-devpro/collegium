import React from "react";
import { motion } from "framer-motion";
import { Check, CheckCheck, Circle } from "lucide-react";

const MessageBubble = ({ message, isMyMessage, showAvatar, currentUser }) => {
  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSenderName = () => {
    if (!message.senderId) return "Unknown";
    
    // Handle both populated and non-populated senderId
    if (typeof message.senderId === "object" && message.senderId.name) {
      return message.senderId.name;
    }
    
    return "User";
  };

  const getSenderInitial = () => {
    const name = getSenderName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 ${isMyMessage ? "justify-end" : "justify-start"} items-end`}
    >
      {/* Avatar or Spacer for alignment */}
      {!isMyMessage && (
        <>
          {showAvatar ? (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
              {getSenderInitial()}
            </div>
          ) : (
            <div className="flex-shrink-0 w-8 h-8" />
          )}
        </>
      )}

      <div className={`flex flex-col max-w-[70%] ${isMyMessage ? "items-end" : "items-start"}`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {/* Sender Name */}
        {!isMyMessage && showAvatar && (
          <span className="text-xs text-gray-600 mb-1 px-2">
            {getSenderName()}
          </span>
        )}

        {/* Message Content */}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isMyMessage
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
          }`}
          style={{ maxWidth: '100%', wordBreak: 'break-word', overflowWrap: 'break-word' }}
        >
          {/* Reply Preview */}
          {message.replyTo && typeof message.replyTo === "object" && (
            <div
              className={`border-l-4 pl-2 mb-2 ${
                isMyMessage ? "border-blue-300" : "border-gray-300"
              }`}
            >
              <p className={`text-xs font-medium ${
                isMyMessage ? "text-blue-100" : "text-gray-600"
              }`}>
                {typeof message.replyTo.senderId === "object" 
                  ? message.replyTo.senderId.name 
                  : "User"}
              </p>
              <p className={`text-xs truncate ${
                isMyMessage ? "text-blue-200" : "text-gray-500"
              }`}>
                {message.replyTo.content}
              </p>
            </div>
          )}

          <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>{message.content}</p>

          {/* Time and Read Status */}
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className={`${isMyMessage ? "text-blue-200" : "text-gray-500"}`}>
              {formatTime(message.createdAt)}
            </span>
            {isMyMessage && (
              <span>
                {message.isSending ? (
                  <Circle size={12} className="text-blue-200 animate-pulse" />
                ) : message.isRead ? (
                  <CheckCheck size={12} className="text-blue-200" />
                ) : (
                  <Check size={12} className="text-blue-200" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;


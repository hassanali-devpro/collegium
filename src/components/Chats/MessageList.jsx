import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, MoreVertical } from "lucide-react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ chat, messages, isLoading, onSendMessage, currentUser }) => {
  const [inputMessage, setInputMessage] = useState("");
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    }
  };

  useEffect(() => {
    // Delay slightly to ensure DOM is fully rendered
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [messages]);

  // Also scroll when component mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 200);
    
    return () => clearTimeout(timeout);
  }, []);

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    onSendMessage(inputMessage, "text");
    setInputMessage("");
  };

  const getChatName = () => {
    if (chat.name) return chat.name;
    
    const currentUserId = currentUser?._id || currentUser?.id;
    const otherParticipants = chat.participants?.filter(
      (p) => (p._id || p.id) !== currentUserId
    );
    
    if (otherParticipants?.length === 1) {
      return otherParticipants[0].name || otherParticipants[0].email;
    }
    
    return "Group Chat";
  };

  const getChatAvatar = () => {
    const currentUserId = currentUser?._id || currentUser?.id;
    const otherParticipants = chat.participants?.filter(
      (p) => (p._id || p.id) !== currentUserId
    );
    
    if (otherParticipants?.length === 1) {
      const name = otherParticipants[0].name || "U";
      return name.charAt(0).toUpperCase();
    }
    
    return "GC";
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 bg-white">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
          {getChatAvatar()}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{getChatName()}</h3>
          <p className="text-xs text-gray-500">
            {chat.chatType === "group" ? `${chat.participants?.length || 0} members` : "Active now"}
          </p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <MoreVertical size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Spacer to push messages to bottom */}
            <div className="flex-1" />
          <div className="space-y-2">
            {messages.map((message, index) => {
              // Skip if it's a duplicate (temp message and real message with same content)
              if (message._id?.startsWith('temp_') && messages.filter(m => m.content === message.content && !m._id?.startsWith('temp_')).length > 0) {
                return null;
              }
              
              const currentUserId = currentUser?._id || currentUser?.id;
              const messageSenderId = message.senderId?._id || message.senderId?.id || message.senderId;
              const isMyMessage = messageSenderId === currentUserId;
              
              const showAvatar = index === 0 || 
                (messages[index - 1] && (
                  (messages[index - 1].senderId?._id || messages[index - 1].senderId?.id || messages[index - 1].senderId) !== messageSenderId
                ));

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isMyMessage={isMyMessage}
                  showAvatar={showAvatar}
                  currentUser={currentUser}
                />
              );
            })}
          </div>
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <Paperclip size={20} className="text-gray-600" />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className={`p-2 rounded-full transition ${
              inputMessage.trim()
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MessageList;


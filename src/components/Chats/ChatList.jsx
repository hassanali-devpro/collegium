import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const ChatList = ({ chats, selectedChat, onSelectChat, currentUser }) => {
  const formatLastMessage = (chat) => {
    if (!chat.lastMessage) return "No messages yet";
    return chat.lastMessage.length > 50
      ? chat.lastMessage.substring(0, 50) + "..."
      : chat.lastMessage;
  };

  const formatTime = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now - messageDate;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    const daysDiff = Math.floor(diff / 86400000);
    if (daysDiff === 1) return "Yesterday";
    if (daysDiff < 7) return `${daysDiff}d ago`;
    
    return messageDate.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getChatName = (chat) => {
    if (chat.name) return chat.name;
    
    // For direct chats, show the other participant's name
    const currentUserId = currentUser?._id || currentUser?.id;
    const otherParticipants = chat.participants?.filter(
      (p) => (p._id || p.id) !== currentUserId
    );
    
    if (otherParticipants?.length === 1) {
      return otherParticipants[0].name || otherParticipants[0].email;
    }
    
    return "Group Chat";
  };

  const getChatAvatar = (chat) => {
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

  return (
    <div className="flex flex-col">
      {chats.map((chat) => (
        <motion.div
          key={chat._id}
          whileHover={{ backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.98 }}
          className={`p-4 border-b border-gray-100 cursor-pointer transition ${
            selectedChat?._id === chat._id ? "bg-blue-50" : ""
          }`}
          onClick={() => onSelectChat(chat)}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {getChatAvatar(chat)}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-800 truncate">
                  {getChatName(chat)}
                </h3>
                {chat.lastMessageAt && (
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatTime(chat.lastMessageAt)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600 truncate flex-1">
                  {formatLastMessage(chat)}
                </p>
                {chat.unreadCount > 0 && selectedChat?._id !== chat._id && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ChatList;


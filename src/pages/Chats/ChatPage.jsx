import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSocket } from "../../contexts/SocketContext";
import {
  useGetUserChatsQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
} from "../../features/chat/chatApi";
import ChatList from "../../components/Chats/ChatList";
import MessageList from "../../components/Chats/MessageList";
import UserSearchModal from "../../components/Chats/UserSearchModal";
import { useSelector } from "react-redux";
import { Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingMessages, setSendingMessages] = useState({}); // Track messages being sent
  const { socket, isConnected } = useSocket();
  const currentUser = useSelector((state) => state.auth?.user);

  // Get user's chats
  const {
    data: chatsData,
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = useGetUserChatsQuery({ page: 1, limit: 50 });

  // Get messages for selected chat
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetChatMessagesQuery(
    { chatId: selectedChat?._id, page: 1, limit: 50 },
    { skip: !selectedChat }
  );

  // Combine real messages with sending messages
  const allMessages = useMemo(() => {
    if (!selectedChat) return [];
    const messages = messagesData?.data || [];
    const sending = Object.values(sendingMessages);
    
    // Merge and sort by date
    const combined = [...messages, ...sending];
    return combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messagesData, sendingMessages, selectedChat]);

  const [sendMessageMutation] = useSendMessageMutation();
  const [markMessagesAsReadMutation] = useMarkMessagesAsReadMutation();

  // Refresh chat list periodically when no chat is selected to check for new messages
  useEffect(() => {
    if (selectedChat) return; // Don't poll when a chat is selected
    
    const interval = setInterval(() => {
      refetchChats();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [selectedChat, refetchChats]);

  // Socket event handlers - listen to all new messages even when no chat is selected
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (data) => {
      // If we have a selected chat and the new message is for that chat
      if (selectedChat && data.chatId === selectedChat._id) {
        // Remove temp messages when real message arrives
        setSendingMessages({});
        refetchMessages();
      }
      
      // Always refresh chat list to update unread counts
      refetchChats();
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, isConnected, selectedChat, refetchMessages, refetchChats]);

  // Join chat room when chat is selected
  useEffect(() => {
    if (!socket || !isConnected || !selectedChat) return;

    socket.emit("join_chat", selectedChat._id);
    
    // Mark messages as read when joining a chat
    markMessagesAsReadMutation(selectedChat._id);

    return () => {
      socket.emit("leave_chat", selectedChat._id);
    };
  }, [socket, isConnected, selectedChat, markMessagesAsReadMutation]);

  const handleSendMessage = async (content, messageType = "text", replyTo = null) => {
    if (!selectedChat || !content.trim()) return;

    const tempId = `temp_${Date.now()}`;
    
    // Add message to sending messages with temporary ID
    setSendingMessages(prev => ({
      ...prev,
      [tempId]: {
        _id: tempId,
        content,
        messageType,
        replyTo,
        senderId: currentUser._id || currentUser.id,
        createdAt: new Date(),
        isSending: true,
      }
    }));

    try {
      const result = await sendMessageMutation({
        chatId: selectedChat._id,
        content,
        messageType,
        replyTo,
      });

      // Emit socket event for real-time update
      if (socket && isConnected) {
        socket.emit("send_message", {
          chatId: selectedChat._id,
          content,
          messageType,
          replyTo,
        });
      }

      // Remove from sending messages and let the real message appear
      setSendingMessages(prev => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });

      refetchChats();
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove sending message on error
      setSendingMessages(prev => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });
    }
  };

  const filteredChats = chatsData?.data?.filter((chat) =>
    chat.participants
      ?.filter((p) => p._id !== currentUser?._id)
      .some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex h-[calc(100vh-12rem)]">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Messages</h2>
              <button
                onClick={() => setShowUserSearch(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <Plus size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="mx-4 mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded-lg">
              <p className="text-xs text-yellow-800">
                Reconnecting to chat...
              </p>
            </div>
          )}

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chatsLoading ? (
              <div className="p-4 text-center text-gray-500">Loading chats...</div>
            ) : filteredChats?.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No chats found
              </div>
            ) : (
              <ChatList
                chats={filteredChats || []}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                currentUser={currentUser}
              />
            )}
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <MessageList
              chat={selectedChat}
              messages={allMessages}
              isLoading={messagesLoading}
              onSendMessage={handleSendMessage}
              currentUser={currentUser}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Select a chat to start messaging
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the left to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Search Modal */}
      <AnimatePresence>
        {showUserSearch && (
          <UserSearchModal
            isOpen={showUserSearch}
            onClose={() => setShowUserSearch(false)}
            onSelectChat={setSelectedChat}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;


import React, { useState, useEffect, useMemo } from "react";
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
import { Plus, Search, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingMessages, setSendingMessages] = useState({});
  const { socket, isConnected } = useSocket();
  const currentUser = useSelector((state) => state.auth?.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    data: chatsData,
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = useGetUserChatsQuery({ page: 1, limit: 50 });

  useEffect(() => {
    const openChatId = location.state?.openChatId;
    if (!openChatId || !chatsData?.data) return;
    const found = chatsData.data.find((c) => c._id === openChatId);
    if (found) {
      setSelectedChat(found);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, chatsData, navigate, location.pathname]);

  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetChatMessagesQuery(
    { chatId: selectedChat?._id, page: 1, limit: 50 },
    { skip: !selectedChat }
  );

  const allMessages = useMemo(() => {
    if (!selectedChat) return [];
    const messages = messagesData?.data || [];
    const sending = Object.values(sendingMessages);
    const combined = [...messages, ...sending];
    return combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messagesData, sendingMessages, selectedChat]);

  const [sendMessageMutation] = useSendMessageMutation();
  const [markMessagesAsReadMutation] = useMarkMessagesAsReadMutation();

  useEffect(() => {
    if (selectedChat) return;
    const interval = setInterval(() => refetchChats(), 5000);
    return () => clearInterval(interval);
  }, [selectedChat, refetchChats]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (data) => {
      if (selectedChat && data.chatId === selectedChat._id) {
        setSendingMessages({});
        refetchMessages();
      }
      refetchChats();
    };

    socket.on("new_message", handleNewMessage);
    return () => socket.off("new_message", handleNewMessage);
  }, [socket, isConnected, selectedChat, refetchMessages, refetchChats]);

  useEffect(() => {
    if (!socket || !isConnected || !selectedChat) return;
    socket.emit("join_chat", selectedChat._id);
    markMessagesAsReadMutation(selectedChat._id);
    return () => socket.emit("leave_chat", selectedChat._id);
  }, [socket, isConnected, selectedChat, markMessagesAsReadMutation]);

  const handleSendMessage = async (content, messageType = "text", replyTo = null) => {
    if (!selectedChat || !content.trim()) return;
    const tempId = `temp_${Date.now()}`;
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
      await sendMessageMutation({
        chatId: selectedChat._id,
        content,
        messageType,
        replyTo,
      });
      if (socket && isConnected) {
        socket.emit("send_message", {
          chatId: selectedChat._id,
          content,
          messageType,
          replyTo,
        });
      }
      setSendingMessages(prev => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });
      refetchChats();
    } catch (error) {
      console.error("Error sending message:", error);
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

  const handleBackToChats = () => {
    setSelectedChat(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
        {/* Chat List */}
        <div
          className={`w-full md:w-80 border-r border-gray-200 bg-white flex flex-col transition-transform duration-300
          ${isMobileView && selectedChat ? "-translate-x-full hidden" : "translate-x-0"}`}
        >
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

          {!isConnected && (
            <div className="mx-4 mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded-lg">
              <p className="text-xs text-yellow-800">Reconnecting to chat...</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {chatsLoading ? (
              <div className="p-4 text-center text-gray-500">Loading chats...</div>
            ) : filteredChats?.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No chats found</div>
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
        <div
          className={`flex-1 flex flex-col bg-gray-50 transition-transform duration-300
          ${isMobileView && !selectedChat ? "translate-x-full hidden" : "translate-x-0"}`}
        >
          {selectedChat ? (
            <div className="flex flex-col h-full">
              {/* Mobile header */}
              {isMobileView && (
                <div className="flex items-center p-3 border-b bg-white shadow-sm">
                  <button onClick={handleBackToChats} className="mr-3">
                    <ArrowLeft size={22} className="text-gray-700" />
                  </button>
                  <h3 className="text-lg font-semibold">{selectedChat?.chatName || "Chat"}</h3>
                </div>
              )}
              <MessageList
                chat={selectedChat}
                messages={allMessages}
                isLoading={messagesLoading}
                onSendMessage={handleSendMessage}
                currentUser={currentUser}
              />
            </div>
          ) : (
            !isMobileView && (
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
            )
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

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, MessageCircle } from "lucide-react";
import { useSearchUsersQuery, useCreateChatMutation } from "../../features/chat/chatApi";
import { useSelector } from "react-redux";

const UserSearchModal = ({ isOpen, onClose, onSelectChat }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const currentUser = useSelector((state) => state.auth?.user);
  
  const { data, isLoading } = useSearchUsersQuery({ 
    search: searchTerm,
    limit: 20 
  });
  
  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();

  const handleStartChat = async (userId) => {
    try {
      const result = await createChat({
        participantIds: [userId],
        chatType: "direct",
      }).unwrap();

      if (result.data) {
        onSelectChat(result.data);
        onClose();
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const users = data?.data || [];
  const currentUserId = currentUser?._id || currentUser?.id;
  
  const filteredUsers = users.filter((user) => {
    const userId = user._id || user.id;
    return userId !== currentUserId;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Start New Chat
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* User List */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="text-center text-gray-500 py-8">
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    {searchTerm ? "No users found" : "Search for users to start a chat"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <motion.div
                        key={user._id}
                        whileHover={{ backgroundColor: "#f3f4f6" }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition hover:bg-gray-50"
                        onClick={() => handleStartChat(user._id)}
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {user.name || user.email}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {user.role || ""}
                          </p>
                        </div>

                        {/* Chat Icon */}
                        <button className="p-2 hover:bg-blue-100 rounded-full transition text-blue-600">
                          <MessageCircle size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {isCreatingChat && (
                  <div className="text-center text-blue-600 py-4">
                    Starting chat...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserSearchModal;


import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const aiMessage = {
        role: "assistant",
        content: "🤖 This is a sample AI response. (Integrate API here!)",
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 600);

    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.3 }}
            className="w-80 h-96 mb-3 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-4 flex justify-between items-center font-semibold text-lg">
              Collegium AI
              <button onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-2xl max-w-[75%] shadow-sm break-words ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white self-end ml-auto"
                      : "bg-gray-200 text-gray-800 self-start"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-gray-100 border-t flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow hover:opacity-90 transition"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

{!isOpen && (
  <motion.div
    key="chat-button"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center"
  >
    <button
      onClick={() => setIsOpen(true)}
      className="w-14 h-14 rounded-full bg-gradient-to-r from-[#F42222] to-[#8e3d3d] flex items-center justify-center shadow-lg text-white hover:opacity-90 transition"
    >
      <MessageCircle size={24} />
    </button>
    <span className="mt-2 text-sm text-gray-600 font-medium">
      Collegium AI
    </span>
  </motion.div>
)}

    </div>
  );
}

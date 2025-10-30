import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { countryFaqs , basicFaqs } from "../../content/faqData";

const countryList = [
  "france",
  "italy",
  "cyprus",
  "malta",
  "sweden",
  "finland",
  "germany",
  "belgium",
  "uk",
  "spain",
  "usa",
  "australia",
  "canada",
  "hungary",
  "netherlands",
  "denmark",
  "lithuania",
  "estonia",
  "belarus",
  "georgia",
];


export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm Collegium AI, How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (selectedCountry) {
      console.log("Selected country:", selectedCountry);
    }
  }, [selectedCountry]);

  // Detect country name from message
  const detectCountry = (message) => {
    const lower = message.toLowerCase();
    for (let c of countryList) {
      if (lower.includes(c)) return c;
    }
    return null;
  };

  // ✅ Handle basic and country-based replies
  const getReply = (message) => {
    const lowerMsg = message.toLowerCase();

    // 🔹 1️⃣ Check if it's a basic question first
    for (let rule of basicFaqs) {
      if (rule.keywords.some((kw) => lowerMsg.includes(kw))) {
        return rule.response;
      }
    }

    // 🔹 2️⃣ Detect country
    const detected = detectCountry(lowerMsg);
    if (detected) {
      setSelectedCountry(detected);
    }

    const activeCountry = detected || selectedCountry;

    // 🔹 3️⃣ If no country found yet → ask for one
    if (!activeCountry) {
      return "For which country to need study information?";
    }

    // 🔹 4️⃣ Check country-specific FAQs
    const faqs = countryFaqs[activeCountry] || [];
    for (let rule of faqs) {
      if (rule.keywords.some((kw) => lowerMsg.includes(kw.toLowerCase()))) {
        return rule.response;
      }
    }

    // 🔹 5️⃣ Default fallback
    return `🤔 Sorry, I don’t have information for that question related to ${activeCountry}. Try asking about budget, visa, or universities.`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    const reply = getReply(input);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    }, 400);

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

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {messages.map((msg, i) => (
                <div
                  key={i}
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

            {/* Input */}
            <div className="p-3 bg-gray-100 border-t flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a question..."
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

      {/* Floating Button */}
      {!isOpen && (
        <motion.div
          key="chat-button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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

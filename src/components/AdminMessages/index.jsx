// src/components/AdminChatBoard.jsx
import React, { useState, useEffect, useRef } from "react";
import { Megaphone } from "lucide-react";

const AdminChatBoard = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: " Welcome to the office! Stay productive.", time: "10:00 AM" },
    { id: 2, text: "Meeting at 3 PM in Conference Room A.", time: "10:15 AM" },
  ]);

  const chatContainerRef = useRef(null);

  // Simulate admin sending new messages
  useEffect(() => {
    const interval = setInterval(() => {
      const newMessages = [
        "📢 Please submit your weekly report by EOD.",
        "📢 New project guidelines uploaded to the portal.",
        "📢 Office will remain closed on Friday.",
        "📢 Don’t forget to sign attendance before leaving.",
      ];
      const randomMsg =
        newMessages[Math.floor(Math.random() * newMessages.length)];

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: randomMsg,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 15000); // every 15 seconds for demo

    return () => clearInterval(interval);
  }, []);

  // Auto scroll inside chat box (not the whole page)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full mx-auto bg-white shadow-lg rounded-2xl border border-gray-200 flex flex-col h-96 mb-10">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#F42222] text-white rounded-t-xl">
        <Megaphone size={20} />
        <h2 className="font-semibold">Collegium Updates</h2>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex flex-col items-start bg-blue-50 border border-blue-200 rounded-xl p-3 w-fit max-w-[80%]"
          >
            <p className="text-blue-900">{msg.text}</p>
            <span className="text-xs text-gray-500 self-end">{msg.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminChatBoard;

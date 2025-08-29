import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend } from "react-icons/fi";

export default function ManageChat() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("adminToken");

  // Fetch all chats for sidebar
  const loadChats = () => {
  if (!token) return;
  axios
    .get(`${process.env.NEXT_PUBLIC_API_URL}/admin/chats`, { headers: { token } })
    .then((res) => {
      const sorted = [...res.data.chats].sort((a, b) => {
        const aCount = a.unseen_count || 0;
        const bCount = b.unseen_count || 0;

        if (aCount !== bCount) {
          return bCount - aCount; // unseen first
        }

        // fallback → sort by last_message timestamp
        const aTime = a.last_message?.timestamp
          ? new Date(a.last_message.timestamp).getTime()
          : 0;
        const bTime = b.last_message?.timestamp
          ? new Date(b.last_message.timestamp).getTime()
          : 0;

        return bTime - aTime; // latest at top
      });

      setChats(sorted);
    })
    .catch((err) => console.error("Failed to load chats", err));
};


  useEffect(() => {
    loadChats();
  }, [token]);

  // Load messages of one user
  // Load messages of one user
const openChat = (email) => {
  axios
    .get(`${process.env.NEXT_PUBLIC_API_URL}/admin/chats/${email}`, {
      headers: { token },
    })
    .then((res) => {
      setActiveChat(email);
      setMessages(res.data.messages || []);

      // ✅ directly reset unseen_count in local state
     setChats((prev) => {
  const updated = prev.map((c) =>
    c.email === email ? { ...c, unseen_count: 0 } : c
  );

  return updated.sort((a, b) => {
    const aCount = a.unseen_count || 0;
    const bCount = b.unseen_count || 0;
    if (aCount !== bCount) return bCount - aCount;

    const aTime = a.last_message?.timestamp
      ? new Date(a.last_message.timestamp).getTime()
      : 0;
    const bTime = b.last_message?.timestamp
      ? new Date(b.last_message.timestamp).getTime()
      : 0;
    return bTime - aTime;
  });
});


      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    })
    .catch((err) => console.error("Failed to open chat", err));
};
// Poll messages while chat is open
useEffect(() => {
  if (!activeChat) return;

  const interval = setInterval(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/admin/chats/${activeChat}`, {
        headers: { token },
      })
      .then((res) => {
        setMessages(res.data.messages || []);
      })
      .catch((err) => console.error("Polling failed", err));
  }, 3000); // ⏱ every 3 seconds

  return () => clearInterval(interval); // cleanup on close/unmount
}, [activeChat, token]);

  // Send reply
  const sendReply = () => {
    if (!newMsg.trim() || !activeChat) return;
    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/send-reply`,
        { email: activeChat, text: newMsg },
        { headers: { token } }
      )
      .then((res) => {
        setMessages((prev) => [...prev, res.data.data]);
        setNewMsg("");
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

      setChats((prev) => {
  const updated = prev.map((c) =>
    c.email === activeChat ? { ...c, last_message: res.data.data } : c
  );

  return updated.sort((a, b) => {
    const aCount = a.unseen_count || 0;
    const bCount = b.unseen_count || 0;
    if (aCount !== bCount) return bCount - aCount;

    const aTime = a.last_message?.timestamp
      ? new Date(a.last_message.timestamp).getTime()
      : 0;
    const bTime = b.last_message?.timestamp
      ? new Date(b.last_message.timestamp).getTime()
      : 0;
    return bTime - aTime;
  });
});

      })
      .catch((err) => console.error("Failed to send reply", err));
  };

  return (
    <div className="flex h-[85vh] border rounded-lg shadow-md overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r bg-white">
        <div className="p-3 font-bold bg-[#158278] text-white">Chats</div>
        {chats.map((chat) => (
          <div
            key={chat.chat_id}
            onClick={() => openChat(chat.email)}
            className={`p-3 cursor-pointer border-b hover:bg-gray-100 transition ${
              activeChat === chat.email ? "bg-green-50" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">{chat.email}</span>
              {chat.unseen_count > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {chat.unseen_count}
                </span>
              )}
            </div>
            {chat.last_message && (
              <p className="text-xs text-gray-500 truncate">{chat.last_message.text}</p>
            )}
          </div>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-3 border-b bg-[#158278] text-white flex justify-between items-center">
  <span className="font-semibold">Chat with {activeChat}</span>
  <button
    onClick={() => {
      if (!window.confirm("Clear all messages for this user?")) return;
      axios
        .delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/clear-chat/${activeChat}`, {
          headers: { token },
        })
        .then(() => {
          setMessages([]); // ✅ clear locally
          // also update sidebar last message
          setChats((prev) =>
            prev.map((c) =>
              c.email === activeChat ? { ...c, last_message: null } : c
            )
          );
        })
        .catch((err) => console.error("Failed to clear chat", err));
    }}
    className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600 transition"
  >
    Clear
  </button>
</div>


            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
              <AnimatePresence>
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"} msg-bubble`}
                  >
                   <div
  className={`px-4 py-2 rounded-lg max-w-[70%] text-sm shadow-md ${
    m.sender === "admin"
      ? "bg-[#158278] text-white rounded-br-none"
      : "bg-white text-gray-900 rounded-bl-none"
  }`}
>
  <div>{m.text}</div>

{/* only show ID for reference */}
{m.product_id && (
  <div className="mt-1 text-xs text-gray-500">
    Product ID: {m.product_id}
  </div>
)}

</div>

                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef}></div>
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white flex items-center space-x-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendReply()}
                placeholder="Type a message..."
                className="flex-1 border border-gray-400 rounded-full px-4 py-2 
                           text-sm text-gray-800 placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-[#158278]"
              />
              <button
                onClick={sendReply}
                className="bg-[#158278] text-white p-3 rounded-full hover:bg-[#10655d] transition"
              >
                <FiSend />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

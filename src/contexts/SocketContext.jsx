import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../app/apiConfig";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const token = useSelector((state) => state.auth?.token);
  const userId = useSelector((state) => state.auth?.user?.id || state.auth?.user?._id);

  useEffect(() => {
    if (!token || !userId) {
      return;
    }

    // Clean up existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Create new socket connection
    // Extract base URL by removing /api/ paths and trailing slashes
    const baseUrl = API_BASE_URL.replace(/\/api\/?/g, "").replace(/\/$/, "");
    const socketUrl = baseUrl || "http://localhost:5000";
    
    const newSocket = io(socketUrl, {
      auth: {
        token: token,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, userId]);

  const value = {
    socket,
    isConnected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};



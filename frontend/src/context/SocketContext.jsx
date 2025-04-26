// src/context/SocketContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext"; // Usamos el estado de autenticación

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const hasConnected = useRef(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    // Esperamos a que termine la carga de AuthContext y tengamos un usuario
    if (loading || !user || hasConnected.current) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
      auth: { token },
    });
    

    setSocket(newSocket);
    hasConnected.current = true;
    console.log("✅ WebSocket conectado.");

    // Escucha eventos si deseas, por ejemplo:
    newSocket.on("connect_error", (err) => {
      console.warn("⚠️ Error de conexión WebSocket:", err.message);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      hasConnected.current = false;
      console.log("🔴 WebSocket desconectado.");
    };
  }, [user, loading]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

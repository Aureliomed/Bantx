import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";  // Asegúrate de que esté bien configurado

const SomeComponent = () => {
  const { socket } = useSocket();  // Obtener la instancia del socket

  useEffect(() => {
    if (!socket) return;

    socket.on("newEmail", (data) => {
      console.log("Nuevo correo recibido:", data);
    });

    return () => {
      socket.off("newEmail");
    };
  }, [socket]);

  return <div>Esperando mensajes de WebSocket...</div>;
};

export default SomeComponent;

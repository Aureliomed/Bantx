import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import TopBarAdmin from "../components/TopBarAdmin";
import axios from "axios";
import "../styles/globals.css";

const AdminDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [qrUrl, setQrUrl] = useState("");  // Estado para el QR generado

  useEffect(() => {
    if (loading) return;

    // Redirección si no es admin
    if (!user || user.role !== "admin") {
      navigate("/login", { replace: true });
      return;
    }

    // Escuchar el estado del servidor via WebSocket
    if (socket) {
      const handleStatus = (data) => {
        console.log("📡 Estado del servidor recibido:", data);
      };

      socket.on("server-status", handleStatus);

      return () => {
        socket.off("server-status", handleStatus);
      };
    }

    // Solicitar el QR al backend para mostrarlo en la página
    const getQrCode = async () => {
      try {
        const response = await axios.get("/api/verify-phone/generate-qr");
        if (response.data.success) {
          setQrUrl(response.data.qrUrl);  // Seteamos el URL del QR
        }
      } catch (error) {
        console.error("Error al obtener el QR:", error);
      }
    };

    getQrCode();

  }, [user, loading, socket, navigate]);

  return (
    <>
      <TopBarAdmin />
      <div className="layout-page">
        <div className="content-box">
          <img
            src="/logo.png"
            alt="SAPIM Logo"
            style={{ maxWidth: "120px", marginBottom: "20px" }}
          />

          <h1 className="title">⚙ Panel de Administración</h1>
          <p className="subtitle">
            Administra los correos, usuarios y otros recursos del sistema.
          </p>

          {/* Mostrar el QR */}
          <div className="qr-container">
            <h3>Escanea el código QR para cambiar tu número de teléfono:</h3>
            {qrUrl ? (
              <img src={qrUrl} alt="QR de WhatsApp" className="qr-image" />
            ) : (
              <p>Generando QR...</p>
            )}
          </div>

          <div className="button-group">
            <button onClick={() => navigate("/admin/pending-payments")} className="button">
              🕓 Aprobar Pagos
            </button>

            <button onClick={() => navigate("/admin/emails")} className="button">
              📧 Gestionar Correos
            </button>
            <button onClick={() => navigate("/admin/users")} className="button">
              👤 Gestionar Usuarios
            </button>
            <button onClick={() => navigate("/admin/reports")} className="button">
              📊 Reportes
            </button>
            <button onClick={() => navigate("/admin/settings")} className="button">
              ⚙ Configuración
            </button>
          </div>

          <div className="extra-options">
            <button onClick={() => navigate("/")} className="link">
              ⬅ Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

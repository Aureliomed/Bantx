import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import TopBarAdmin from "../components/TopBarAdmin";
import "../styles/globals.css";

const AdminDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
  
    // 🔐 Redirección si no es admin
    if (!user || user.role !== "admin") {
      navigate("/login", { replace: true });
      return;
    }
  
    // 📡 Escuchar estado del servidor vía WebSocket
    if (socket) {
      const handleStatus = (data) => {
        console.log("📡 Estado del servidor recibido:", data);
        // Aquí puedes mostrar una notificación, toast, etc.
      };
  
      socket.on("server-status", handleStatus);
  
      return () => {
        socket.off("server-status", handleStatus);
      };
    }
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

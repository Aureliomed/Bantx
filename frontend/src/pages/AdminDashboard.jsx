import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import TopBarAdmin from "../components/TopBarAdmin";
import axios from "axios";
import "../styles/globals.css";
import "../styles/user-dashboard.css";

import {
  Clock,
  Mail,
  Users,
  BarChart3,
  Settings,
  QrCode,
  ArrowLeft,
  RefreshCcw,
} from "lucide-react";

const AdminDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [qrUrl, setQrUrl] = useState("");
  const [waConnected, setWaConnected] = useState(false);
  const [loadingQR, setLoadingQR] = useState(true);

  const checkConnectionStatus = async () => {
    try {
      const res = await axios.get("/api/verify-phone/status");
      setWaConnected(res.data.connected);
    } catch (err) {
      console.error("❌ Error al verificar estado de WhatsApp:", err);
    }
  };

  const getQrCode = async () => {
    setLoadingQR(true);
    try {
      const res = await axios.get("/api/verify-phone/generate-qr");
      if (res.data.success) {
        setQrUrl(res.data.qrUrl);
        setWaConnected(false);
      }
    } catch (err) {
      console.error("❌ Error al obtener QR:", err);
    } finally {
      setLoadingQR(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") {
      navigate("/login", { replace: true });
      return;
    }

    if (socket) {
      const handleStatus = (data) => {
        console.log("📡 Estado del servidor:", data);
      };
      socket.on("server-status", handleStatus);
      return () => socket.off("server-status", handleStatus);
    }

    checkConnectionStatus().then((connected) => {
      if (!connected) getQrCode();
    });
  }, [user, loading, socket, navigate]);

  return (
    <>
      <TopBarAdmin />
      <div className="layout-page fade-in">
        <div className="content-box">
          {/* Header */}
          <div className="user-header">
            <div className="user-header-left">
              <div className="user-avatar">A</div>
              <div className="user-info">
                <div className="username">@{user?.username || "admin"}</div>
                <div className="status">Administrador</div>
              </div>
            </div>
          </div>

          {/* QR WhatsApp */}
          <div className="user-card">
            <div className="wallet-summary">
              <p className="wallet-label">WhatsApp Bot</p>
              {waConnected ? (
                <h2 className="wallet-amount" style={{ color: "green" }}>
                  ✅ Conexión establecida
                </h2>
              ) : (
                <>
                  <h2 className="wallet-amount">Escanea para vincular tu número</h2>
                  {loadingQR ? (
                    <p style={{ color: "#888" }}>⏳ Generando código QR...</p>
                  ) : qrUrl ? (
                    <img
                      src={qrUrl}
                      alt="QR de WhatsApp"
                      className="qr-image"
                      style={{ maxWidth: "250px", marginTop: "8px" }}
                    />
                  ) : (
                    <p style={{ color: "red" }}>❌ Error al generar QR.</p>
                  )}
                  <button
                    className="button"
                    onClick={getQrCode}
                    style={{ marginTop: "10px" }}
                  >
                    <RefreshCcw size={16} /> Regenerar QR
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Panel navegación */}
          <div className="user-card">
            <div className="wallet-summary">
              <p className="wallet-label">Panel de administración</p>
              <h2 className="wallet-amount">Gestiona recursos y usuarios</h2>
            </div>
            <div className="wallet-actions row">
              <button className="button" onClick={() => navigate("/admin/pending-payments")}>
                <Clock size={16} /> Aprobar Pagos
              </button>
              <button className="button" onClick={() => navigate("/admin/emails")}>
                <Mail size={16} /> Correos
              </button>
              <button className="button" onClick={() => navigate("/admin/users")}>
                <Users size={16} /> Usuarios
              </button>
              <button className="button" onClick={() => navigate("/admin/reports")}>
                <BarChart3 size={16} /> Reportes
              </button>
              <button className="button" onClick={() => navigate("/admin/settings")}>
                <Settings size={16} /> Configuración
              </button>
            </div>
          </div>

          <div className="extra-options" style={{ marginTop: "24px", textAlign: "center" }}>
            <button onClick={() => navigate("/")} className="link">
              <ArrowLeft size={16} style={{ marginRight: "4px" }} />
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

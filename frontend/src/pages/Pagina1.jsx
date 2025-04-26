import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBarUser from "../components/TopBarUser";
import axios from "axios";
import "../styles/globals.css";
import "../styles/user-dashboard.css";
import { Pencil, Send, ArrowDown, ArrowUp, Gift, ClipboardList, Users, FileText, MessageSquare, Repeat, UserPlus, Wallet } from "lucide-react";
import { DollarSign } from "lucide-react";
import { io } from "socket.io-client";

const Pagina1 = () => {
  const { user, loading } = useAuth();
  const [payments, setPayments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [realTimeBalance, setRealTimeBalance] = useState({ usdt: 0, usdc: 0 });
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && user.role === "user" && !user.onboardingCompleted) {
      navigate("/onboarding", { replace: true });
    }
  }, [loading, user, navigate]);

  // WebSocket setup for real-time updates
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("balanceUpdated", (newBalance) => {
      setRealTimeBalance(newBalance);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get("http://localhost:5000/api/payments/all", { headers });
        setPayments(res.data);
      } catch (error) {
        console.error("Error al cargar historial de pagos:", error);
      }
    };
    if (!loading && user) fetchData();
  }, [loading, user]);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get("http://localhost:5000/api/users/referrals", { headers });
        setReferrals(res.data);
      } catch (error) {
        console.error("Error al cargar referidos:", error);
      }
    };
    if (!loading && user) fetchReferrals();
  }, [loading, user]);

  useEffect(() => {
    const fetchSecurityAlerts = async () => {
      // Lógica para mostrar alertas de seguridad (opcional)
      setSecurityAlerts([
        "Revisa la identidad del comprador/vendedor antes de realizar transacciones.",
        "Mantén tu contraseña segura y no compartas datos sensibles."
      ]);
    };
    fetchSecurityAlerts();
  }, []);

  const approvedPayments = payments.filter((p) => p.status === "approved");
  const totalApproved = approvedPayments.reduce((acc, p) => acc + p.amount, 0);
  const usdtBalance = realTimeBalance.usdt ?? totalApproved;
  const usdcBalance = realTimeBalance.usdc ?? 0;
  const rewardPoints = user?.rewardPoints ?? 0;
  const referralCode = user?.referralCode || "N/A";

  if (loading) {
    return (
      <>
        <TopBarUser />
        <div className="layout-page fade-in">
          <div className="content-box">
            <h2 className="title">⏳ Cargando datos...</h2>
          </div>
        </div>
      </>
    );
  }

  const avatarLetter = user?.username?.charAt(0).toUpperCase() || "U";
  const statusLabel = user?.verified ? "Verificado" : "Básico";

  return (
    <>
      <TopBarUser />
      <div className="layout-page fade-in">
  <div className="content-box">
    <div className="user-header">
      <div className="user-header-left">
        <div className="user-avatar">{avatarLetter}</div>
        <div className="user-info">
          <div className="username">@{user?.username}</div>
          <div className="status">{statusLabel}</div>
        </div>
      </div>

      {/* Botón Editar con solo ícono flotante */}
      <button className="edit-button" onClick={() => navigate("/settings")}>
        <Pencil size={16} />
      </button>
    </div>
  

          <div className="user-card">
            <div className="wallet-summary">
              <p className="wallet-label">Saldo Total</p>
              <h2 className="wallet-amount">
                USDT: <strong>${usdtBalance.toFixed(2)}</strong> | USDC: <strong>${usdcBalance.toFixed(2)}</strong>
              </h2>
            </div>
            <div className="wallet-actions row">
              <button className="button" onClick={() => navigate("/wallet/receive")}><ArrowDown size={16} /> Recargar</button>
              <button className="button" onClick={() => navigate("/wallet/send")}><Send size={16} /> Enviar</button>
              <button className="button" onClick={() => navigate("/invite")}><UserPlus size={16} /> Invitar</button>
            </div>
          </div>

          {/* Seguridad Alert */}
          {securityAlerts.length > 0 && (
            <div className="security-alerts">
              <h3>Alertas de seguridad</h3>
              <ul>
                {securityAlerts.map((alert, index) => (
                  <li key={index}>{alert}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="user-card">
            <div className="wallet-summary">
              <p className="wallet-label">Marketplace P2P</p>
              <h2 className="wallet-amount">Explora o publica ofertas</h2>
            </div>
            <div className="wallet-actions row">
  <button className="button" onClick={() => navigate("/marketplace")}>
    <FileText size={16} /> Ver Anuncios
  </button>
  <button className="button" onClick={() => navigate("/marketplace/create")}>
    <ArrowUp size={16} /> Crear Anuncio
  </button>
  <button className="button" onClick={() => navigate("/chat")}>
    <MessageSquare size={16} /> Chat
  </button>
</div>

          </div>

          <div className="user-card">
            <div className="wallet-summary">
              <p className="wallet-label">Transferencias internas</p>
              <h2 className="wallet-amount">Envía fondos a otros usuarios</h2>
            </div>
            <div className="wallet-actions row">
              <button className="button" onClick={() => navigate("/transfer")}><DollarSign size={16} /> Enviar</button>
              <button className="button" onClick={() => navigate("/transactions")}><ClipboardList size={16} /> Movimientos</button>
            </div>
          </div>

          <div className="user-card">
            <div className="wallet-summary">
              <p className="wallet-label">Recompensas y referidos</p>
              <h2 className="wallet-amount">Puntos: <strong>{rewardPoints}</strong></h2>
              <p>Código de referido: <code>{referralCode}</code></p>
              <p>IDs referidos:</p>
              {referrals.length === 0 ? (
                <p style={{ fontStyle: "italic", color: "#888" }}>No hay referidos aún.</p>
              ) : (
                <ul>{referrals.map((ref) => (<li key={ref._id}><code>{ref._id}</code></li>))}</ul>
              )}
            </div>
            <div className="wallet-actions">
              <button className="button" onClick={() => navigator.clipboard.writeText(referralCode)}> Copiar código </button>
              <button className="button" onClick={() => navigate("/invite")}><Gift size={16} /> Compartir</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Pagina1;

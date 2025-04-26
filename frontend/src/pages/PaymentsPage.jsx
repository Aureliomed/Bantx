// src/pages/PaymentsPage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TopBarUser from "../components/TopBarUser";
import axios from "axios";
import "../styles/globals.css";

const PaymentsPage = () => {
  const { user, loading } = useAuth();
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("⚠️ Sesión no válida.");
          return;
        }

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payments/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(res.data);
        } catch (err) {
          console.error(err);
          setError("❌ Error al obtener historial de pagos.");
        }
        
    };

    if (user && !loading) {
      fetchPayments();
    }
  }, [user, loading]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="badge badge-approved">✅ Aprobado</span>;
      case "pending":
        return <span className="badge badge-pending">🕓 Pendiente</span>;
      case "rejected":
        return <span className="badge badge-rejected">❌ Rechazado</span>;
      default:
        return <span className="badge">🔘 Desconocido</span>;
    }
  };

  if (loading) {
    return (
      <>
        <TopBarUser />
        <div className="layout-page">
          <div className="content-box">
            <h2 className="title">⏳ Cargando pagos...</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBarUser />
      <div className="layout-page">
        <div className="content-box">
          <img
            src="/logo.png"
            alt="SAPIM Logo"
            style={{ maxWidth: "120px", marginBottom: "20px" }}
          />

          <h1 className="title">💳 Historial de Pagos</h1>

          {error && <p className="error-message">{error}</p>}

          {payments.length === 0 ? (
            <p className="subtitle">📭 Aún no has realizado pagos.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => (
                    <tr key={idx}>
                      <td>{new Date(p.date).toLocaleDateString()}</td>
                      <td>${p.amount.toFixed(2)}</td>
                      <td>{getStatusBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="button-group" style={{ marginTop: "20px" }}>
            <button className="button" onClick={() => navigate("/make-payment")}>
              💸 Realizar nuevo pago
            </button>
            <button onClick={() => navigate("/pagina1")} className="link">
              ⬅ Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentsPage;

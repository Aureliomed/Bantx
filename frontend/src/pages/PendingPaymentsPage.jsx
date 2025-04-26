// src/pages/PendingPaymentsPage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TopBarAdmin from "../components/TopBarAdmin";
import axios from "axios";
import "../styles/globals.css";

const PendingPaymentsPage = () => {
  const { user, loading } = useAuth();
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payments/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(res.data);
      } catch (err) {
        setError("❌ Error al obtener pagos pendientes.");
      }
    };
  
    if (!loading && user) fetchPendingPayments();
  }, [loading, user]);
  
  const approvePayment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/payments/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(payments.filter((p) => p._id !== id));
    } catch (err) {
      setError("❌ Error al aprobar el pago.");
    }
  };
  
  const deletePayment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(payments.filter((p) => p._id !== id));
    } catch (err) {
      setError("❌ Error al eliminar el pago.");
    }
  };
  
  if (loading) {
    return (
      <>
        <TopBarAdmin />
        <div className="layout-page"><div className="content-box"><h2 className="title">⏳ Cargando...</h2></div></div>
      </>
    );
  }

  return (
    <>
      <TopBarAdmin />
      <div className="layout-page">
        <div className="content-box">
          <h1 className="title">📥 Pagos Pendientes</h1>
          <p className="subtitle">Aprueba los pagos realizados por los usuarios.</p>

          {error && <p className="error-message">{error}</p>}

          {payments.length === 0 ? (
            <p className="subtitle">📭 No hay pagos pendientes.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td>{p.userId?.email || "Desconocido"}</td>
                      <td>${p.amount}</td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="button-group-inline">
                          <button className="button small success" onClick={() => approvePayment(p._id)}>
                            ✅ Aprobar
                          </button>
                          <button className="button small danger" onClick={() => deletePayment(p._id)}>
                            ❌ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="extra-options">
            <button onClick={() => navigate("/admin")} className="link">
              ⬅ Volver al panel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PendingPaymentsPage;

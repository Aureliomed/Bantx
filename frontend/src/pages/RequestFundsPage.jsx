// src/pages/RequestFundsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBarUser from "../components/TopBarUser";
import axios from "axios";
import "../styles/globals.css";

const RequestFundsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    // Validación rápida
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("⚠️ El monto debe ser un número positivo.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/payments/request",
        { amount: parsedAmount, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage("✅ Solicitud enviada correctamente.");
      setAmount("");
      setDescription("");
    } catch (err) {
      console.error("❌ Error al enviar solicitud:", err);
      setErrorMessage("❌ No se pudo enviar la solicitud.");
    }
  };

  if (loading) {
    return (
      <>
        <TopBarUser />
        <div className="layout-page">
          <div className="content-box">
            <h2 className="title">⏳ Cargando...</h2>
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

          <h1 className="title">📝 Solicitud de Fondos</h1>
          <p className="subtitle">Completa los datos para solicitar un adelanto.</p>

          {successMessage && <div className="success-message">{successMessage}</div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <form onSubmit={handleSubmit} className="form">
            <input
              className="input"
              type="number"
              min="1"
              placeholder="💲 Monto solicitado"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <textarea
              className="input"
              placeholder="🗒️ Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
            <button type="submit" className="button" disabled={!amount || !description}>
              📤 Enviar Solicitud
            </button>
          </form>

          <div className="extra-options" style={{ marginTop: "20px" }}>
            <button onClick={() => navigate("/pagina1")} className="link">
              ⬅ Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RequestFundsPage;

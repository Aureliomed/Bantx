import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TopBarUser from "../components/TopBarUser";
import axios from "axios";
import "../styles/globals.css";

const MakePaymentPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
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

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/payments/manual",
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage("✅ Pago registrado correctamente.");
      setAmount("");
    } catch (err) {
      setErrorMessage("❌ No se pudo registrar el pago.");
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

          <h1 className="title">💸 Realizar Pago</h1>
          <p className="subtitle">Ingresa el monto que deseas abonar.</p>

          {successMessage && <div className="success-message">{successMessage}</div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <form onSubmit={handleSubmit} className="form">
            <input
              className="input"
              type="number"
              placeholder="💲 Monto"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <button type="submit" className="button">💳 Pagar</button>
          </form>

          <div className="extra-options" style={{ marginTop: "20px" }}>
            <button onClick={() => navigate("/pay")} className="link">
              ⬅ Volver al historial
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MakePaymentPage;

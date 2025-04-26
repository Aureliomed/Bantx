// src/pages/ForgotPassword.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/globals.css";
import "../styles/homepage.css";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { KeyRound, Send } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmailFormat = (value) => {
    const regex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");
    setLoading(true);

    if (!validateEmailFormat(email)) {
      setEmailValid(false);
      setErrorMessage("❌ Ingresa un correo válido.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage("✅ " + res.data.message);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "❌ Error al enviar el correo de recuperación."
      );
          }

    setLoading(false);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(true);
    setErrorMessage("");

    if (value && !validateEmailFormat(value)) {
      setEmailValid(false);
      setErrorMessage("❌ El formato del correo no es válido.");
    }
  };

  return (
    <div className="layout-page fade-in">
      <Header />

      <div className="content-box register-page fade-slide-up">
        <h1 className="register-title" style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          justifyContent: "center"
        }}>
          <KeyRound size={26} />
          Recuperar Contraseña
        </h1>

        {message && <p className="success-message">{message}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <form onSubmit={handleSubmit} className="form">
          <input
            type="email"
            placeholder="Ingresa tu correo electrónico"
            className={`input ${!emailValid ? "input-error" : ""}`}
            value={email}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <button type="submit" className="button" disabled={loading || !emailValid}>
            {loading ? "⏳ Enviando..." : (
              <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                <Send size={18} />
                Enviar enlace
              </span>
            )}
          </button>
        </form>

        <div className="extra-options">
          <button onClick={() => navigate("/login")} className="link">
            Volver al inicio de sesión
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;

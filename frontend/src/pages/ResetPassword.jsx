import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Lock } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/globals.css";
import "../styles/homepage.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const passwordMismatch = confirmPassword && newPassword !== confirmPassword;

  // 📈 Evaluar fuerza de contraseña en vivo
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength("");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStrength("Débil");
    } else if (newPassword.match(/[A-Z]/) && newPassword.match(/[0-9]/) && newPassword.length >= 8) {
      setPasswordStrength("Fuerte");
    } else {
      setPasswordStrength("Media");
    }
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword.length < 6) {
      return setErrorMessage("⚠️ La contraseña debe tener al menos 6 caracteres.");
    }

    if (passwordMismatch) {
      return setErrorMessage("⚠️ Las contraseñas no coinciden.");
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
        token,
        newPassword,
      });
      setSuccessMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "❌ Error al restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-page fade-in">
      <Header />
      <div className="content-box register-page fade-slide-up">
        <h1 className="register-title" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <LockReset size={26} />
          Restablecer Contraseña
        </h1>

        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <form onSubmit={handleSubmit} className="form">

          {/* Nueva contraseña */}
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Mostrar u ocultar contraseña"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Mostrar fortaleza de la contraseña */}
          {newPassword && (
            <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
              Fortaleza: {passwordStrength}
            </p>
          )}

          {/* Confirmar contraseña */}
          <input
            type="password"
            placeholder="Repetir nueva contraseña"
            className={`input ${passwordMismatch ? "mismatch" : ""}`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {passwordMismatch && (
            <p className="error-message">⚠️ Las contraseñas no coinciden.</p>
          )}

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Actualizando..." : "Restablecer Contraseña"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;

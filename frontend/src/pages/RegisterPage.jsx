// src/pages/RegisterPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import "../styles/globals.css";
import "../styles/homepage.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import LoadingScreen from "../components/LoadingScreen";

import { Eye, EyeOff, UserPlus, Send } from "lucide-react";


const RegisterPage = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    country: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    referralCode: ""
  });

  const [passwordStrength, setPasswordStrength] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/pagina1", { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => console.log("🟢 WebSocket conectado"));
      socket.on("disconnect", () => console.log("🔴 WebSocket desconectado"));
      socket.on("connect_error", (error) =>
        console.error("⚠️ Error de conexión WebSocket:", error.message)
      );
    }

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
      }
    };
  }, [socket]);

  const evaluatePasswordStrength = (pwd) => {
    if (pwd.length < 6) return "Débil";
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && pwd.length >= 8) return "Fuerte";
    return "Media";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: val };

      if (name === "password" || name === "confirmPassword") {
        setPasswordStrength(evaluatePasswordStrength(updatedForm.password));
        setPasswordMismatch(
          updatedForm.confirmPassword &&
          updatedForm.password !== updatedForm.confirmPassword
        );
      }

      return updatedForm;
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!formData.email.includes("@")) {
      return setErrorMessage("⚠️ Correo electrónico no válido.");
    }

    if (formData.password.length < 6 || formData.password !== formData.confirmPassword) {
      return setErrorMessage("⚠️ Las contraseñas no coinciden o son muy cortas.");
    }

    if (!formData.acceptTerms) {
      return setErrorMessage("⚠️ Debes aceptar los Términos y Condiciones.");
    }

    setIsSubmitting(true);

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        referredBy: formData.referralCode || undefined,
        profileData: { country: formData.country }
      });

      setMessage("✅ Registro exitoso. Redirigiendo al inicio de sesión...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "❌ Error en el registro. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user === undefined) {
    return <LoadingScreen />;
  }

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
  <UserPlus size={28} />
  Crear Cuenta
</h1>


        {message && <p className="success-message">{message}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <form onSubmit={handleRegister} className="form">
          <input
            type="text"
            name="username"
            placeholder="Nombre de usuario"
            className="input"
            value={formData.username}
            onChange={handleChange}
            required
          />

<div className="select-wrapper">
  <select
    name="country"
    className="input"
    value={formData.country}
    onChange={handleChange}
    required
  >
    <option value="">Selecciona tu país</option>
    <option value="Venezuela">🇻🇪 Venezuela</option>
    <option value="Colombia">🇨🇴 Colombia</option>
    <option value="Perú">🇵🇪 Perú</option>
    <option value="México">🇲🇽 México</option>
    <option value="Argentina">🇦🇷 Argentina</option>
  </select>
</div>

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            className="input"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Crea una contraseña"
              className="input"
              value={formData.password}
              onChange={handleChange}
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

          {formData.password && (
            <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
            Fortaleza de la contraseña: {passwordStrength}
            </p>
          )}

<input
  type="password"
  name="confirmPassword"
  placeholder="Repite tu contraseña"
  className={`input ${passwordMismatch ? "mismatch" : ""}`}
  value={formData.confirmPassword}
  onChange={handleChange}
  required
/>

          {passwordMismatch && (
            <p className="error-message">⚠️ Las contraseñas no coinciden.</p>
          )}

          <input
            type="text"
            name="referralCode"
            placeholder="Código de referido (opcional)"
            className="input"
            value={formData.referralCode}
            onChange={handleChange}
          />

<label className="terms-checkbox">
  <input
    type="checkbox"
    name="acceptTerms"
    checked={formData.acceptTerms}
    onChange={handleChange}
    required
  />
  Acepto los{" "}
  <button
    type="button"
    className="link"
    onClick={() => navigate("/terms")}
  >
    Términos y Condiciones
  </button>
</label>


          <button type="submit" className="button" disabled={isSubmitting}>
  {isSubmitting ? "Registrando..." : (
    <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
      <Send size={18} />
      Registrarse
    </span>
  )}
</button>

        </form>

        <div className="extra-options">
          <button onClick={() => navigate("/login")} className="link">
            ¿Ya tienes una cuenta? Iniciar sesión
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;

// src/pages/LoginPage.jsx
import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";
import "../styles/homepage.css";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { Eye, EyeOff } from "lucide-react";
import { LogIn } from "lucide-react"; // puedes cambiar por Lock o KeyRound

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const navigate = useNavigate();

  const validateEmailFormat = (value) => {
    const regex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(value);
  };

  const validateInputs = () => {
    const emailCheck = validateEmailFormat(email);
    const passCheck = password.length >= 6;
    setEmailValid(emailCheck);
    setPasswordValid(passCheck);

    if (!emailCheck || !passCheck) {
      setErrorMessage("⚠️ Verifica tus credenciales e intenta de nuevo.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (!res.data?.token) {
        throw new Error("❌ Token no recibido.");
      }

      login(res.data.token, res.data.user);
      toast.success("✅ Inicio de sesión exitoso!");
    } catch (error) {
      const msg = error.response?.data?.message || "❌ No se pudo iniciar sesión.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-page fade-in">
      <Header />

      <div className="content-box register-page fade-slide-up">
      <h1 className="register-title" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
      <LogIn size={26} color="#1F2E55" />
      Iniciar Sesión
</h1>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <form onSubmit={handleLogin} className="form">
          <input
            type="email"
            placeholder="Correo Electrónico"
            className={`input ${!emailValid ? "input-error" : ""}`}
            value={email}
            onChange={(e) => {
              const val = e.target.value;
              setEmail(val);
              setEmailValid(validateEmailFormat(val));
              setErrorMessage("");
            }}
            disabled={loading}
            required
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              className={`input ${!passwordValid ? "input-error" : ""}`}
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                setPasswordValid(val.length >= 6);
                setErrorMessage("");
              }}
              disabled={loading}
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

          <label className="terms-checkbox">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Recordarme en este dispositivo
          </label>

          <button
            type="submit"
            className="button"
            disabled={loading || !emailValid || !passwordValid}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="extra-options">
          <button onClick={() => navigate("/forgot-password")} className="link">
            ¿Olvidaste tu contraseña?
          </button>
          <span className="separator">|</span>
          <button onClick={() => navigate("/register")} className="link">
            Crear cuenta
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;

import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    console.log("🟡 Verificando sesión desde localStorage...");

    if (!token || !storedUser) {
      console.warn("❌ No hay token o usuario en localStorage.");
      setLoading(false);
      return;
    }

    const decoded = parseJwt(token);
    const now = Date.now() / 1000;

    if (decoded?.exp && now > decoded.exp) {
      console.warn("⚠️ Token expirado automáticamente.");
      logout();
      return;
    }

    axios
    .get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      console.log("✅ Usuario verificado:", res.data);
      setUser(res.data);
  
      if (decoded?.exp) {
        const tiempoRestante = decoded.exp * 1000 - Date.now();
        console.log(`⏳ Token expira en ${Math.round(tiempoRestante / 1000)}s`);
  
        const timeout = setTimeout(() => {
          console.warn("🔒 Token expirado. Cerrando sesión.");
          logout();
        }, tiempoRestante);
  
        return () => clearTimeout(timeout);
      }
    })
    .catch((err) => {
      console.error("❌ Error al validar token:", err);
      logout();
    })
    .finally(() => setLoading(false));
    }, []);

    const login = async (token, userData, skipRedirect = false) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    
      if (skipRedirect) return; // 👈
    
      if (userData.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (userData.onboardingCompleted) {
        navigate("/pagina1", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    };
        
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    console.log("👋 Sesión cerrada.");
    navigate("/", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

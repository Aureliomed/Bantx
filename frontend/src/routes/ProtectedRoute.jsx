import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="layout-page">
        <div className="content-box">
          <h2 className="title">⏳ Verificando acceso...</h2>
        </div>
      </div>
    );
  }

  // ❌ Si no hay usuario o el rol no es válido
  if (!user || (requiredRoles.length > 0 && !requiredRoles.includes(user.role))) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 Si es usuario normal y no ha hecho onboarding → redirigir
  if (
    user.role === "user" &&
    !user.onboardingCompleted &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  // ✅ Autorizado y con onboarding completo
  return children;
};

export default ProtectedRoute;

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TopBarAdmin from "../components/TopBarAdmin";
import "../styles/globals.css";

const ReportsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <>
        <TopBarAdmin />
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
      <TopBarAdmin />
      <div className="layout-page">
        <div className="content-box">
          <img
            src="/logo.png"
            alt="SAPIM Logo"
            style={{ maxWidth: "120px", marginBottom: "20px" }}
          />
          <h1 className="title">📊 Reportes</h1>
          <p className="subtitle">
            Próximamente podrás visualizar métricas, estadísticas y datos clave de tu plataforma.
          </p>
          <div className="extra-options">
            <button onClick={() => navigate("/admin")} className="link">
              ⬅ Volver al panel de administración
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportsPage;

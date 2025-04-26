import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import "../styles/globals.css";
import "../styles/homepage.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import LoadingScreen from "../components/LoadingScreen";

import { LogIn } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();

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

  if (user === undefined) {
    return <LoadingScreen />;
  }

  return (
    <div className="layout-page fade-in">
      <Header />

      <div className="content-box">
        {/* BOTÓN SUPERIOR SOLO SI NO HAY USUARIO */}
        {!user && (
          <div className="hero-login-button">
  <button className="button outline" onClick={() => navigate("/login")}>
    <LogIn size={20} style={{ marginRight: "8px" }} />
    Iniciar sesión
  </button>
</div>
        )}

        {/* HERO PRINCIPAL */}
        <section className="trust-section fade-slide-up">
          <img src="/images/hero-banner-realistic.png" alt="Hero" className="section-img" />
          <h1>Compra, vende y transfiere USDT con total confianza</h1>
          <p>Escrow, encriptación y más de 70 métodos de pago disponibles sin comisiones ocultas.</p>
        </section>

        {/* SEGURIDAD */}
        <section className="trust-section fade-slide-up">
          <img src="/images/security-trust-visual.png" alt="Seguridad Garantizada" className="section-img" />
          <h2>Tu seguridad es nuestra prioridad</h2>
          <p>Protegemos cada transacción con escrow automático y cifrado extremo a extremo.</p>
        </section>

        {/* BENEFICIOS */}
        <section className="benefits-section fade-slide-up">
          <div className="benefit-card">
            <img src="/images/benefit-transfer-user.png" alt="Transferencia USDT" className="benefit-card-img" />
            <div className="benefit-card-content">
              <h3>Sin comisiones internas</h3>
              <p>Transfiere USDT entre usuarios verificados sin costo adicional.</p>
            </div>
          </div>

          <div className="benefit-card">
            <img src="/images/benefit-payment-methods.png" alt="Métodos de pago" className="benefit-card-img" />
            <div className="benefit-card-content">
              <h3>70+ métodos de pago</h3>
              <p>Zelle, Nequi, Yape, Pago Móvil, Binance Pay y muchos más.</p>
            </div>
          </div>

          <div className="benefit-card">
            <img src="/images/benefit-escrow-shield.png" alt="Escrow seguro" className="benefit-card-img" />
            <div className="benefit-card-content">
              <h3>Escrow automático</h3>
              <p>Protección completa en cada operación de compra o venta.</p>
            </div>
          </div>
        </section>

        {/* TESTIMONIOS */}
        <section className="trust-section fade-slide-up">
          <img src="/images/testimonials-users.png" alt="Testimonios" className="section-img" />
          <h2>Usuarios satisfechos</h2>
          <p>Historias reales de confianza y crecimiento con BANTX.</p>
        </section>

        {/* CTA FINAL */}
        <section className="trust-section fade-slide-up">
          <img src="/images/cta-mobile-glow.png" alt="Celular con botón" className="section-img" />
          <h2>Únete hoy</h2>
          <p>Haz crecer tu libertad financiera. Rápido. Seguro. Sin comisiones.</p>
          <div className="button-group">
            <button onClick={() => navigate("/register")} className="button">Crear cuenta</button>
            <button onClick={() => navigate("/login")} className="button outline">Iniciar sesión</button>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;

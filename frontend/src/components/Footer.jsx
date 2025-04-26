// 📁 src/components/Footer.jsx
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bantx-footer">
      <p>© 2025 <strong>BANTX</strong>. Todos los derechos reservados.</p>
      <div className="footer-links">
        <button className="link" onClick={() => navigate("/terms")}>Términos</button>
        <span className="separator">|</span>
        <button className="link" onClick={() => navigate("/security")}>Seguridad</button>
        <span className="separator">|</span>
        <button className="link" onClick={() => navigate("/")}>Español 🇪🇸</button>
      </div>
    </footer>
  );
};

export default Footer;
// 📁 src/components/Header.jsx
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bantx-header">
      <img src="/images/bantx-logo.png" alt="Inicio - BANTX" className="bantx-logo" />
      <nav className="bantx-nav">
        <button className="link" onClick={() => navigate("/")}>Inicio</button>
        <button className="link" onClick={() => navigate("/how-it-works")}>Cómo funciona</button>
        <button className="link" onClick={() => navigate("/security")}>Seguridad</button>
        <button className="link" onClick={() => navigate("/blog")}>Blog</button>
        <button className="link" onClick={() => navigate("/faq")}>FAQ</button>
        <button className="link" onClick={() => navigate("/")}>ES 🇪🇸</button>
      </nav>
    </header>
  );
};

export default Header;

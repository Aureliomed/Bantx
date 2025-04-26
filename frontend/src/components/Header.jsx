// 📁 src/components/Header.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(prevState => !prevState);  // Alterna el estado del menú
  };

  return (
    <header className="bantx-header">
      <img src="/images/bantx-logo.png" alt="Inicio - BANTX" className="bantx-logo" />
      <nav className={`bantx-nav ${isMenuOpen ? "open" : ""}`}>
        <button className="link" onClick={() => navigate("/")}>Inicio</button>
        <button className="link" onClick={() => navigate("/how-it-works")}>Cómo funciona</button>
        <button className="link" onClick={() => navigate("/security")}>Seguridad</button>
        <button className="link" onClick={() => navigate("/blog")}>Blog</button>
        <button className="link" onClick={() => navigate("/faq")}>FAQ</button>
        <button className="link" onClick={() => navigate("/")}>ES 🇪🇸</button>
      </nav>

      {/* Menú hamburguesa */}
      <div className="menu-icon" onClick={toggleMenu}>
        &#9776;
      </div>
    </header>
  );
};

export default Header;

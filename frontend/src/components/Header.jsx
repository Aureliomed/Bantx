import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para controlar la visibilidad del menú

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Cambia el estado de visibilidad del menú
  };

  return (
    <header className="bantx-header">
      <img src="/images/bantx-logo.png" alt="Inicio - BANTX" className="bantx-logo" />
      <nav className={`bantx-nav ${isMenuOpen ? "open" : ""}`}> {/* Añadimos la clase "open" cuando el menú está abierto */}
        <button className="link" onClick={() => navigate("/")}>Inicio</button>
        <button className="link" onClick={() => navigate("/how-it-works")}>Cómo funciona</button>
        <button className="link" onClick={() => navigate("/security")}>Seguridad</button>
        <button className="link" onClick={() => navigate("/blog")}>Blog</button>
        <button className="link" onClick={() => navigate("/faq")}>FAQ</button>
        <button className="link" onClick={() => navigate("/")}>ES 🇪🇸</button>
      </nav>
      {/* Icono de hamburguesa en pantallas pequeñas */}
      <div className="menu-icon" onClick={toggleMenu}>
        &#9776; {/* Esto es el icono de las tres rayitas */}
      </div>
    </header>
  );
};

export default Header;

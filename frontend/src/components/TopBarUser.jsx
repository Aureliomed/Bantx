import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Menu, MenuItem } from "@mui/material";
import { Menu as MenuIcon } from "lucide-react"; // Ícono de menú de Lucide
import { LogOut as LogoutIcon } from "lucide-react"; // Ícono de logout de Lucide
import { Home, Wallet, ShoppingCart, CreditCard, Settings } from "lucide-react"; // Íconos actualizados

const TopBarUser = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
<AppBar
  position="fixed"
  style={{
    backgroundColor: "#ffffff",
    color: "#333333",
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
    paddingLeft: "8px",
    paddingRight: "8px",
    zIndex: 1300, // Asegura que esté por encima de todo el contenido
    width: "100%", // Hace que ocupe todo el ancho de la pantalla
  }}
>
  <Toolbar style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
    {/* ☰ Botón de menú */}
    <IconButton edge="start" color="inherit" onClick={handleMenuOpen}>
      <MenuIcon size={24} /> {/* Menu de Lucide */}
    </IconButton>

    {/* 📋 Menú desplegable */}
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
      <MenuItem onClick={() => { handleMenuClose(); navigate("/pagina1"); }}>
        <Home size={18} style={{ marginRight: "8px" }} /> Inicio
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate("/wallet"); }}>
        <Wallet size={18} style={{ marginRight: "8px" }} /> Wallet
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate("/marketplace"); }}>
        <ShoppingCart size={18} style={{ marginRight: "8px" }} /> Marketplace
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate("/transactions"); }}>
        <CreditCard size={18} style={{ marginRight: "8px" }} /> Transacciones
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate("/user-profile"); }}>
  <Settings size={18} style={{ marginRight: "8px" }} /> Configuración
</MenuItem>

    </Menu>

        {/* Logo BANTX centrado */}
        <img
          src="/images/bantx-logo.png"
          alt="BANTX Logo"
          style={{ height: "32px", objectFit: "contain" }}
        />

    {/* 🔓 Botón de cerrar sesión */}
    <IconButton color="inherit" onClick={handleLogout}>
      <LogoutIcon size={24} /> {/* LogOut de Lucide */}
    </IconButton>
  </Toolbar>
</AppBar>
  );
};

export default TopBarUser;

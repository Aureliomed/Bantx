import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

const TopBarAdmin = () => {
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
      position="static"
      className="app-bar"
      style={{
        backgroundColor: "#ffffff",
        color: "#333333",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        paddingLeft: "8px",
        paddingRight: "8px",
      }}
    >
      <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
        {/* ☰ Menú lateral */}
        <IconButton edge="start" color="inherit" onClick={handleMenuOpen}>
          <MenuIcon />
        </IconButton>

        {/* 📋 Opciones del admin */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => { handleMenuClose(); navigate("/admin/emails"); }}>
            📧 Correos
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate("/admin/users"); }}>
            👤 Usuarios
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate("/admin/reports"); }}>
            📊 Reportes
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate("/admin/settings"); }}>
            ⚙ Configuración
          </MenuItem>
        </Menu>


        {/* Logo BANTX centrado */}
        <img
          src="/images/bantx-logo.png"
          alt="BANTX Logo"
          style={{ height: "32px", objectFit: "contain" }}
        />

        {/* Logout */}
        <IconButton color="inherit" onClick={handleLogout}>
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopBarAdmin;

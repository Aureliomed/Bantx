import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/globals.css";

const CreateAdminPage = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authPassword, setAuthPassword] = useState(""); // 🔐 Contraseña actual del admin
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/create`,  // Usando la variable de entorno
        { email: adminEmail, password: adminPassword, authPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Administrador creado exitosamente.");
      setTimeout(() => navigate("/admin"), 2000);
    } catch (error) {
      setMessage("❌ Error al crear el administrador.");
    }
  };
  
  return (
    <div className="container">
      <div className="box">
        <h1 className="title">🔐 Crear Administrador</h1>

        {message && <p className="info-message">{message}</p>}

        <form onSubmit={handleCreateAdmin} className="form">
          <input
            type="email"
            placeholder="Correo del nuevo admin"
            className="input"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña del nuevo admin"
            className="input"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Tu contraseña actual (verificación)"
            className="input"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            required
          />
          <button type="submit" className="button">Crear Administrador</button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminPage;

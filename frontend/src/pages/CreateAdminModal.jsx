// CreateAdminModal.jsx
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CreateAdminModal = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/create-admin", {
        email,
        password,
        secretKey,
      });

      toast.success("✅ Administrador creado exitosamente");
      onSuccess && onSuccess(res.data);
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || "Error desconocido";
      toast.error("❌ " + msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="box">
        <h2 className="title">🔐 Crear Administrador</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            className="input"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            className="input"
            type="text"
            placeholder="Clave secreta (ADMIN_SECRET)"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            required
          />

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Creando..." : "💾 Crear Admin"}
          </button>
          <button type="button" onClick={onClose} className="button">
            ❌ Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminModal;

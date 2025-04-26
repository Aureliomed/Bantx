import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  setUsers,
  removeUser,
  updateUser,
  setLoading,
  setError,
} from "../store/userSlice";
import { toast } from "react-toastify";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBarAdmin from "../components/TopBarAdmin";
import "../styles/globals.css";

// 🧩 Modal para crear administrador
const CreateAdminModal = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/auth/create-admin",
        { email, password, secretKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Administrador creado");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("❌ Error al crear administrador");
    }
  };

  return (
    <div className="modal">
      <div className="box">
        <h2 className="title">➕ Crear Administrador</h2>
        <form onSubmit={handleSubmit} className="form">
          <input className="input" type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input className="input" type="text" placeholder="Clave Secreta" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} required />
          <button type="submit" className="button">💾 Crear</button>
          <button type="button" onClick={onClose} className="button">❌ Cancelar</button>
        </form>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users);
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [search, setSearch] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [expandedAdmins, setExpandedAdmins] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState(true);
  const [editUserId, setEditUserId] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const fetchUsers = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(setUsers(res.data));
    } catch (error) {
      dispatch(setError("❌ Error al cargar usuarios"));
    }
  };

  useEffect(() => {
    if (!socket || !socket.connected) return;
    fetchUsers();
    socket.on("userRemoved", (userId) => dispatch(removeUser(userId)));
    socket.on("userUpdated", (updatedUser) => dispatch(updateUser(updatedUser)));
    return () => {
      socket.off("userRemoved");
      socket.off("userUpdated");
    };
  }, [socket, dispatch]);

  const handleUpdate = async (user) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/profile`,
        { email: user.email, role: editRole, status: editStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(updateUser(res.data.user));
      socket?.emit("userUpdated", res.data.user);
      toast.success("✅ Usuario actualizado");
      setEditUserId(null);
    } catch {
      toast.error("❌ Error al actualizar usuario");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(removeUser(userId));
      socket?.emit("userRemoved", userId);
      toast.success("🗑️ Usuario eliminado!");
    } catch {
      toast.error("❌ No se pudo eliminar el usuario.");
    }
  };

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));
  const admins = filtered.filter(u => u.role === "admin");
  const regularUsers = filtered.filter(u => u.role === "user");

  return (
    <>
      <TopBarAdmin />
      <div className="layout-page">
        <div className="content-box">
          <h1 className="title">👥 Gestión de Usuarios</h1>
          <input
            type="text"
            className="input"
            placeholder="Buscar por correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="button" onClick={() => setShowAdminModal(true)}>➕ Crear Administrador</button>

          {/* ADMINISTRADORES */}
          <button className="button" onClick={() => setExpandedAdmins(!expandedAdmins)}>
            👑 Administradores ({admins.length}) {expandedAdmins ? "▲" : "▼"}
          </button>
          {expandedAdmins && admins.map((u) => (
            <div key={u._id} className="user-card">
              {editUserId === u._id ? (
                <>
                  <input className="input" value={editRole} onChange={(e) => setEditRole(e.target.value)} />
                  <input className="input" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} />
                  <button className="button" onClick={() => handleUpdate(u)}>💾 Guardar</button>
                  <button className="button" onClick={() => setEditUserId(null)}>❌ Cancelar</button>
                </>
              ) : (
                <>
                  <span>{u.email}</span>
                  <button className="edit-btn" onClick={() => {
                    setEditUserId(u._id);
                    setEditRole(u.role);
                    setEditStatus(u.status);
                  }}>✏️</button>
                  <button className="delete-btn" onClick={() => handleDelete(u._id)}>🗑️</button>
                </>
              )}
            </div>
          ))}

          {/* USUARIOS */}
          <button className="button" onClick={() => setExpandedUsers(!expandedUsers)}>
            🧑 Usuarios ({regularUsers.length}) {expandedUsers ? "▲" : "▼"}
          </button>
          {expandedUsers && regularUsers.map((u) => (
            <div key={u._id} className="user-card">
              {editUserId === u._id ? (
                <>
                  <input className="input" value={editRole} onChange={(e) => setEditRole(e.target.value)} />
                  <input className="input" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} />
                  <button className="button" onClick={() => handleUpdate(u)}>💾 Guardar</button>
                  <button className="button" onClick={() => setEditUserId(null)}>❌ Cancelar</button>
                </>
              ) : (
                <>
                  <span>{u.email}</span>
                  <button className="edit-btn" onClick={() => {
                    setEditUserId(u._id);
                    setEditRole(u.role);
                    setEditStatus(u.status);
                  }}>✏️</button>
                  <button className="delete-btn" onClick={() => handleDelete(u._id)}>🗑️</button>
                </>
              )}
            </div>
          ))}

          {showAdminModal && (
            <CreateAdminModal onClose={() => setShowAdminModal(false)} onSuccess={fetchUsers} />
          )}

          <div className="extra-options" style={{ marginTop: "24px" }}>
            <button onClick={() => navigate("/admin")} className="link">
              ⬅ Volver al panel de administración
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersPage;

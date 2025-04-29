import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../styles/globals.css";
import "../styles/user-dashboard.css";
import { Pencil, Key, UserCheck, Lock } from "lucide-react";
import { toast } from "react-toastify";

const UserProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...user.profileData });
  const [isEditing, setIsEditing] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user.settings.pinEnabled);
  const [isKYCVerified, setIsKYCVerified] = useState(user.kycVerified);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    // Check if the user is fully onboarded and verified
    if (!user.onboardingCompleted) {
      navigate("/onboarding", { replace: true });
    }
  }, [user, navigate]);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      // Update the user profile with the changes
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        profileData: form,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("¡Perfil actualizado correctamente!");
      setIsEditing(false);
    } catch (error) {
      toast.error("❌ Error al actualizar el perfil");
    }
  };

  const toggle2FA = async () => {
    try {
      // Send a request to enable/disable 2FA
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/enable-2fa`, {
        enable: !is2FAEnabled,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setIs2FAEnabled(!is2FAEnabled);
      toast.success(`2FA ${is2FAEnabled ? 'desactivado' : 'activado'} correctamente`);
    } catch (error) {
      toast.error("❌ Error al cambiar el estado de 2FA");
    }
  };

  const handleChangePin = async () => {
    if (newPin !== confirmPin) {
      toast.error("❌ Los PINs no coinciden");
      return;
    }

    try {
      // Update PIN in the backend
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/change-pin`, {
        newPin,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("✅ PIN actualizado correctamente");
      setNewPin("");
      setConfirmPin("");
    } catch (error) {
      toast.error("❌ Error al cambiar el PIN");
    }
  };

  return (
    <div className="layout-page fade-in">
      <div className="content-box">
        {/* User Header */}
        <div className="user-header">
          <div className="user-header-left">
            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="username">@{user.username}</div>
              <div className="status">{isKYCVerified ? "Verificado" : "Pendiente KYC"}</div>
            </div>
          </div>
          {/* Edit Button */}
          <button className="edit-button" onClick={handleEdit}>
            <Pencil size={16} />
          </button>
        </div>

        {/* Profile Form */}
        <form className="form">
          <h2>Información del Usuario</h2>

          {/* Editable fields */}
          {isEditing ? (
            <>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              />
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
              <button type="button" onClick={handleSave} className="button">Guardar Cambios</button>
            </>
          ) : (
            <div>
              <p><strong>Nombre:</strong> {form.nombre}</p>
              <p><strong>Apellido:</strong> {form.apellido}</p>
              <p><strong>Teléfono:</strong> {form.telefono}</p>
            </div>
          )}

          {/* 2FA Toggle */}
          <div className="user-card">
            <h3>Seguridad</h3>
            <button onClick={toggle2FA} className="button">
              {is2FAEnabled ? "Desactivar 2FA" : "Activar 2FA"}
              <Key size={16} />
            </button>
          </div>

          {/* PIN Change */}
          <div className="user-card">
            <h3>Cambiar PIN</h3>
            <input
              type="password"
              placeholder="Nuevo PIN"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmar PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
            />
            <button type="button" onClick={handleChangePin} className="button">Actualizar PIN</button>
          </div>

          {/* KYC Status */}
          <div className="user-card">
            <h3>Verificación KYC</h3>
            {isKYCVerified ? (
              <p><UserCheck size={16} /> KYC Verificado</p>
            ) : (
              <button onClick={() => navigate("/kyc")} className="button">
                Completar KYC
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;

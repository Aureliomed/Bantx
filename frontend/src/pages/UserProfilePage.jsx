import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react"; // Íconos de verificación
import "../styles/user-dashboard.css";

const UserProfilePage = () => {
  const { user } = useAuth();
  const [isPhoneVerified, setIsPhoneVerified] = useState(user.profileData.phoneVerified);
  const [verificationCode, setVerificationCode] = useState("");  // Código ingresado por el usuario
  const [isCodeSent, setIsCodeSent] = useState(false); // Indica si el código ha sido enviado
  const [isVerifying, setIsVerifying] = useState(false); // Indica si estamos verificando el código

  const sendVerificationCode = async () => {
    setIsVerifying(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/verify-phone`, {
        phoneNumber: user.profileData.telefono,
      });
      if (response.data.success) {
        setIsCodeSent(true);  // El código ha sido enviado
      }
    } catch (error) {
      console.error("Error al enviar el código de verificación:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyCode = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/verify-code`, {
        phoneNumber: user.profileData.telefono,
        code: verificationCode,
      });
      if (response.data.success) {
        setIsPhoneVerified(true);  // Actualizamos el estado de verificación
      }
    } catch (error) {
      console.error("Error al verificar el código:", error);
    }
  };

  return (
    <div className="user-profile-container">
      <div className="user-header">
        <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <div className="username">@{user.username}</div>
          <div className="status">{user.kycVerified ? "Verificado" : "Pendiente KYC"}</div>
        </div>
      </div>

      <div className="form">
        <h2>Información del Usuario</h2>
        
        <p><strong>Nombre:</strong> {user.profileData.nombre}</p>
        <p><strong>Apellido:</strong> {user.profileData.apellido}</p>
        
        {/* Teléfono */}
        <p><strong>Teléfono:</strong> {user.profileData.telefono} 
          {isPhoneVerified ? (
            <CheckCircle size={16} color="green" style={{ marginLeft: "8px" }} />
          ) : (
            <XCircle size={16} color="red" style={{ marginLeft: "8px" }} />
          )}
        </p>

        {/* Botón de verificación */}
        {!isPhoneVerified && !isCodeSent && (
          <button onClick={sendVerificationCode} className="button" disabled={isVerifying}>
            {isVerifying ? "Enviando..." : "Enviar código de verificación"}
          </button>
        )}

        {isCodeSent && !isPhoneVerified && (
          <div>
            <input
              type="text"
              placeholder="Código de verificación"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="input"
            />
            <button onClick={verifyCode} className="button">Verificar Código</button>
          </div>
        )}

        {/* Otros botones */}
        <div>
          <button className="button">Activar 2FA</button>
          <button className="button">Actualizar PIN</button>
          <button className="button">Completar KYC</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

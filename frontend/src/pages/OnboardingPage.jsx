// src/pages/OnboardingPage.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "../styles/globals.css";

const paises = [
  { nombre: "Venezuela", codigo: "+58", bandera: "🇻🇪" },
  { nombre: "Colombia", codigo: "+57", bandera: "🇨🇴" },
  { nombre: "Perú", codigo: "+51", bandera: "🇵🇪" },
  { nombre: "México", codigo: "+52", bandera: "🇲🇽" },
  { nombre: "Argentina", codigo: "+54", bandera: "🇦🇷" },
];

const documentos = [
  "Carnet de identificación",
  "Pasaporte",
  "Licencia de conducir",
];

const referencias = [
  "Por un amigo/familiar/conocido",
  "Publicidad",
  "TikTok",
  "Instagram",
  "YouTube",
  "Por Google Play Store o App Store",
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    nacionalidad: "",
    pais: "",
    ciudad: "",
    tipoDocumento: "",
    numeroDocumento: "",
    telefono: "",
    prefijo: "",
    pin: "",
    confirmarPin: "",
    referencia: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "nacionalidad") {
      const pais = paises.find((p) => p.nombre === value);
      setForm((prev) => ({ ...prev, prefijo: pais?.codigo || "", pais: value }));
    }
  };

  const avanzar = () => {
    if (step === 1) {
      const campos = ["nombre", "apellido", "fechaNacimiento", "nacionalidad", "tipoDocumento", "numeroDocumento", "telefono", "ciudad"];
      const incompletos = campos.some((campo) => !form[campo]);
      if (incompletos) {
        alert("⚠️ Todos los campos deben ser completados.");
        return;
      }
    }
    if (step === 2 && form.pin !== form.confirmarPin) {
      alert("⚠️ Los PIN no coinciden.");
      return;
    }
    if (step < 3) setStep((prev) => prev + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      const profileData = {
        nombre: form.nombre,
        apellido: form.apellido,
        fechaNacimiento: form.fechaNacimiento,
        pais: form.pais,
        ciudad: form.ciudad,
        nacionalidad: form.nacionalidad,
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: form.numeroDocumento,
        phone: `${form.prefijo} ${form.telefono}`,
        pin: form.pin,
        referencia: form.referencia,
        // Asegúrate de enviar un objeto wallet válido (con valores predeterminados si no se proporciona uno)
        wallet: { usdt: 0, usdc: 0 },
      };
  
      // Realiza la solicitud PUT para actualizar el perfil
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        profileData,
        onboardingCompleted: true,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Obtén el token del localStorage
        },
      });
  
      // Aquí puedes continuar con el flujo después de un onboarding exitoso
      const updatedUser = { ...user, onboardingCompleted: true, profileData };
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Actualiza el user en el localStorage
      login(localStorage.getItem("token"), updatedUser); // Realiza login con el usuario actualizado
      navigate("/pagina1", { replace: true }); // Redirige al siguiente paso del onboarding
  
    } catch (error) {
      console.error("❌ Error al guardar datos del onboarding:", error);
      // Aquí puedes manejar errores de manera más específica si es necesario
    }
  };
  
  return (
    <div className="layout-page fade-in">
      <div className="content-box" style={{ padding: "32px 16px", maxWidth: "480px" }}>
        {step === 1 && (
          <form className="form">
            <h2 className="bantx-title">📄 Completemos tu información</h2>

            <input type="text" name="nombre" placeholder="Nombre" className="input" value={form.nombre} onChange={handleChange} required />
            <input type="text" name="apellido" placeholder="Apellido" className="input" value={form.apellido} onChange={handleChange} required />
            <input type="date" name="fechaNacimiento" className="input" value={form.fechaNacimiento} onChange={handleChange} required />

            <select name="nacionalidad" value={form.nacionalidad} onChange={handleChange} className="input" required>
              <option value="">Nacionalidad</option>
              {paises.map((p) => (
                <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
              ))}
            </select>

            <input type="text" name="ciudad" placeholder="Ciudad de residencia" className="input" value={form.ciudad} onChange={handleChange} required />

            <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} className="input" required>
              <option value="">Tipo de documento</option>
              {documentos.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <input type="text" name="numeroDocumento" placeholder="Número del documento" className="input" value={form.numeroDocumento} onChange={handleChange} required />

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="input" style={{ display: "flex", alignItems: "center", gap: "4px", width: "90px" }}>
                <span>{paises.find(p => p.nombre === form.nacionalidad)?.bandera}</span>
                <span>{form.prefijo}</span>
              </div>
              <input
                type="tel"
                name="telefono"
                placeholder="424 123 4567"
                className="input"
                style={{ flex: 1 }}
                value={form.telefono}
                onChange={handleChange}
                required
              />
            </div>

            <button type="button" onClick={avanzar} className="button">Siguiente</button>
          </form>
        )}

        {step === 2 && (
          <form className="form">
            <h2 className="bantx-title">🔐 Protege tu cuenta</h2>
            <p>Crea un PIN para proteger tu cuenta.</p>
            <input type="password" name="pin" placeholder="Ingresa PIN" className="input" maxLength="4" value={form.pin} onChange={handleChange} required />
            <input type="password" name="confirmarPin" placeholder="Confirma PIN" className="input" maxLength="4" value={form.confirmarPin} onChange={handleChange} required />
            <button type="button" onClick={avanzar} className="button">Siguiente</button>
          </form>
        )}

        {step === 3 && (
          <form className="form">
            <h2 className="bantx-title">📣 ¿Cómo supiste de nosotros?</h2>
            <select name="referencia" value={form.referencia} onChange={handleChange} className="input" required>
              <option value="">Selecciona una opción</option>
              {referencias.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button type="button" onClick={avanzar} className="button">Finalizar</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;

// backend/services/phoneVerificationService.js

const { makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const QRCode = require('qrcode');
const User = require("../models/User");

// Enviar código de verificación por WhatsApp
const sendVerificationCodeToPhone = async (phoneNumber) => {
  const { state, saveState } = useSingleFileAuthState('auth_info.json');
  const sock = makeWASocket({ auth: state });

  await sock.connect();

  const code = Math.floor(100000 + Math.random() * 900000);
  const message = `Tu código de verificación es: ${code}`;

  try {
    await sock.sendMessage(`${phoneNumber}@s.whatsapp.net`, { text: message });
    saveState();

    const user = await User.findOne({ "profileData.phone": phoneNumber });
    if (!user) return { success: false, message: "Usuario no encontrado con ese teléfono." };

    user.verification.code = code.toString();
    user.verification.expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    await user.save();

    return { success: true };
  } catch (error) {
    console.error("❌ Error al enviar el código:", error);
    return { success: false, message: "No se pudo enviar el mensaje" };
  }
};

// Generar código QR para conectar WhatsApp Web
const generateWhatsAppQRCode = async () => {
  return new Promise(async (resolve, reject) => {
    const { state, saveState } = useSingleFileAuthState('auth_info.json');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });

    sock.ev.on('connection.update', async (update) => {
      const { qr, connection } = update;

      if (qr) {
        try {
          const qrUrl = await QRCode.toDataURL(qr);
          resolve(qrUrl);
        } catch (err) {
          reject("❌ Error generando el QR: " + err.message);
        }
      }

      if (connection === 'open') {
        console.log("✅ Conectado a WhatsApp");
        saveState();
      }

      if (connection === 'close') {
        console.log("🔴 Desconectado de WhatsApp");
      }
    });

    try {
      await sock.connect();
    } catch (err) {
      reject("❌ Error conectando con WhatsApp: " + err.message);
    }
  });
};

// Validar código ingresado por el usuario
const validateVerificationCode = async (phoneNumber, code) => {
  try {
    const user = await User.findOne({ "profileData.phone": phoneNumber }).select("+verification.code +verification.expires");

    if (!user) return { success: false, message: "Usuario no encontrado" };
    if (!user.verification.code || !user.verification.expires)
      return { success: false, message: "No se ha solicitado verificación" };

    if (user.verification.code !== code)
      return { success: false, message: "Código incorrecto" };

    if (user.verification.expires < new Date())
      return { success: false, message: "Código expirado" };

    user.verification.phoneVerified = true;
    user.verification.code = undefined;
    user.verification.expires = undefined;
    await user.save();

    return { success: true };
  } catch (error) {
    console.error("❌ Error validando código:", error);
    return { success: false, message: "Error interno" };
  }
};

module.exports = {
  sendVerificationCodeToPhone,
  generateWhatsAppQRCode,
  validateVerificationCode,
};

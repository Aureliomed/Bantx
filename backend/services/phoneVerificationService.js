// backend/services/phoneVerificationService.js

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const path = require('path');
const User = require("../models/User");

let sock = null; // Socket persistente

const initWhatsAppSocket = async () => {
  const authPath = path.resolve('./auth_info'); // Carpeta para guardar sesión
  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    markOnlineOnConnect: false,
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
};

const generateWhatsAppQRCode = async () => {
  return new Promise(async (resolve, reject) => {
    const sock = await initWhatsAppSocket();

    sock.ev.on("connection.update", async ({ qr, connection }) => {
      if (qr) {
        try {
          const qrUrl = await QRCode.toDataURL(qr);
          return resolve(qrUrl);
        } catch (err) {
          return reject("Error generando el QR: " + err.message);
        }
      }

      if (connection === "open") {
        console.log("✅ WhatsApp conectado");
      }

      if (connection === "close") {
        console.log("🔴 WhatsApp desconectado");
      }
    });
  });
};

const sendVerificationCodeToPhone = async (phoneNumber) => {
  if (!sock) sock = await initWhatsAppSocket();

  const code = Math.floor(100000 + Math.random() * 900000);
  const message = `Tu código de verificación es: ${code}`;

  try {
    await sock.sendMessage(`${phoneNumber}@s.whatsapp.net`, { text: message });

    const user = await User.findOne({ "profileData.phone": phoneNumber });
    if (!user) return { success: false, message: "Usuario no encontrado" };

    user.verification.code = code.toString();
    user.verification.expires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    return { success: true };
  } catch (err) {
    console.error("❌ Error al enviar código:", err);
    return { success: false, message: "No se pudo enviar el mensaje" };
  }
};

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
  generateWhatsAppQRCode,
  sendVerificationCodeToPhone,
  validateVerificationCode,
};

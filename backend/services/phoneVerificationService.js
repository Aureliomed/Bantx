// backend/services/phoneVerificationService.js

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const path = require('path');
const User = require("../models/User");

let sock = null;
let isConnectedToWhatsApp = false;

const authPath = path.resolve('./auth_info'); // Carpeta persistente de sesión

const initWhatsAppSocket = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    markOnlineOnConnect: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection } = update;
    if (connection === "open") {
      isConnectedToWhatsApp = true;
    } else if (connection === "close") {
      isConnectedToWhatsApp = false;
    }
  });

  return sock;
};

const generateWhatsAppQRCode = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const authPath = path.resolve('./auth_info'); // Asegúrate que sea consistente
      const { state, saveCreds } = await useMultiFileAuthState(authPath);

      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        markOnlineOnConnect: false,
      });

      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", async (update) => {
        const { qr, connection } = update;

        if (qr) {
          try {
            const qrUrl = await QRCode.toDataURL(qr);
            isConnectedToWhatsApp = false;
            return resolve({ qrUrl, success: true, connected: false });
          } catch (err) {
            return reject({ success: false, message: "Error generando QR", error: err.message });
          }
        }

        if (connection === "open") {
          isConnectedToWhatsApp = true;
          return resolve({ success: true, qrUrl: null, connected: true });
        }

        if (connection === "close") {
          isConnectedToWhatsApp = false;
        }
      });

      // 🚫 Ya no llames `sock.connect()` porque `makeWASocket()` ya lo hace por ti
    } catch (err) {
      return reject({ success: false, message: "❌ Error conectando con WhatsApp", error: err.message });
    }
  });
};

const getWhatsAppConnectionStatus = async () => {
  return { connected: isConnectedToWhatsApp };
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
  sendVerificationCodeToPhone,
  generateWhatsAppQRCode,
  validateVerificationCode,
  getWhatsAppConnectionStatus,
};

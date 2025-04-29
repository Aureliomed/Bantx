// backend/controllers/phoneVerificationController.js

const {
    sendVerificationCodeToPhone,
    generateWhatsAppQRCode,
    validateVerificationCode,
  } = require("../services/phoneVerificationService");
  
  // Enviar código a un número
  const sendCode = async (req, res) => {
    const { phoneNumber } = req.body;
  
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: "Falta el número de teléfono." });
    }
  
    const result = await sendVerificationCodeToPhone(phoneNumber);
    if (!result.success) {
      return res.status(500).json({ success: false, message: result.message || "Error al enviar el código." });
    }
  
    return res.status(200).json({ success: true, message: "Código enviado correctamente." });
  };
  
  // Verificar código ingresado por el usuario
  const verifyCode = async (req, res) => {
    const { phoneNumber, code } = req.body;
  
    if (!phoneNumber || !code) {
      return res.status(400).json({ success: false, message: "Faltan datos." });
    }
  
    const result = await validateVerificationCode(phoneNumber, code);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
  
    return res.status(200).json({ success: true, message: "Teléfono verificado exitosamente." });
  };
  
  // Generar QR para vincular el bot de WhatsApp
  const getQr = async (req, res) => {
    try {
      const result = await generateWhatsAppQRCode();
  
      if (!result || !result.qrUrl) {
        return res.status(500).json({ success: false, message: "No se pudo generar el QR." });
      }
  
      return res.status(200).json({
        success: true,
        qrUrl: result.qrUrl,
        connected: result.connected || false,
      });
    } catch (error) {
      console.error("❌ Error al generar QR:", error);
      return res.status(500).json({ success: false, message: "No se pudo generar el QR." });
    }
  };
    
  module.exports = {
    sendCode,
    verifyCode,
    getQr,
  };
  
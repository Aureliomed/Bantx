const express = require('express');
const router = express.Router();
const { sendVerificationCode, verifyCode } = require('../controllers/phoneVerificationController');
const { generateWhatsAppQRCode } = require('../services/phoneVerificationService');


// Ruta para enviar el código de verificación al teléfono
router.post('/send-verification-code', sendVerificationCode);

// Ruta para verificar el código ingresado por el usuario
router.post('/verify-code', verifyCode);

// Ruta para generar el QR
router.get('/generate-qr', async (req, res) => {
    try {
      const qrUrl = await generateWhatsAppQRCode();  // Llamamos a la función para generar el QR
      res.status(200).json({ success: true, qrUrl });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al generar el QR" });
    }
  });

  
module.exports = router;

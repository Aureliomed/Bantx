// backend/routes/phoneVerificationRoutes.js

const express = require("express");
const router = express.Router();
const {
  sendCode,
  verifyCode,
  getQr,
} = require("../controllers/phoneVerificationController");

// Enviar código de verificación
router.post("/send-code", sendCode);

// Verificar código recibido
router.post("/verify-code", verifyCode);

// Obtener QR para vincular WhatsApp
router.get("/generate-qr", getQr);

module.exports = router;

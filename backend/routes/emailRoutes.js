const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

// 📌 Middleware de autenticación y verificación de token
router.use(verifyToken);

// ✅ Log para depuración: Confirmar que el token fue verificado correctamente
router.use((req, res, next) => {
  console.log(`🛡️ Usuario autenticado: ${req.user?.email}, Rol: ${req.user?.role}`);
  next();
});

// 📩 Enviar email
router.post("/send", emailController.sendEmail);

// 📌 Obtener emails (Solo Admins)
router.get("/", checkRole(["admin"]), emailController.getEmails);

// 🗑️ Eliminar un email (Solo Admins)
router.delete("/:id", checkRole(["admin"]), emailController.deleteEmail);

// 🔄 Actualizar un email (Solo Admins)
router.put("/:id", checkRole(["admin"]), emailController.updateEmail);

// ❌ Manejo de rutas no encontradas
router.use((req, res) => {
  res.status(404).json({ message: "🚫 Ruta de emails no encontrada." });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const logger = require("../utils/logger");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");

// 🔥 Validar que todos los métodos existen
[
  "registerUser", "login", "forgotPassword", "resetPassword",
  "createAdmin", "getAuthenticatedUser", "getAllUsers",
  "refreshToken", "logout"
].forEach(method => {
  if (typeof authController[method] !== "function") {
    throw new Error(`❌ Error: ${method} no está definido o no es una función en authController.js`);
  }
});

// 📌 Destructurar métodos
const {
  registerUser, login, forgotPassword, resetPassword,
  createAdmin, getAuthenticatedUser, getAllUsers,
  refreshToken, logout
} = authController;

// 📌 Middleware de validaciones
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsgs = errors.array().map(e => e.msg);
    logger.warn("⚠️ Errores de validación:", errorMsgs);
    return res.status(400).json({ message: errorMsgs.join(" | ") });
  }
  next();
};

// 📋 Validadores
const validators = {
  register: [
    check("email", "El correo electrónico es inválido.").isEmail(),
    check("password", "La contraseña debe tener al menos 6 caracteres.").isLength({ min: 6 }),
    handleValidationErrors,
  ],
  login: [
    check("email", "El correo electrónico es inválido.").isEmail(),
    check("password", "La contraseña es requerida.").exists(),
    handleValidationErrors,
  ],
  forgotPassword: [
    check("email", "El correo electrónico es inválido.").isEmail(),
    handleValidationErrors,
  ],
  resetPassword: [
    check("token", "El token es requerido.").exists(),
    check("newPassword", "La nueva contraseña debe tener al menos 8 caracteres.").isLength({ min: 8 }),
    handleValidationErrors,
  ],
  createAdmin: [
    check("email", "El correo electrónico es inválido.").isEmail(),
    check("password", "La contraseña debe tener al menos 8 caracteres.").isLength({ min: 8 }),
    check("secretKey", "La clave secreta es requerida.").exists(),
    handleValidationErrors,
  ],
};

// ✅ Rutas públicas
router.post("/register", validators.register, registerUser);
router.post("/login", validators.login, login);
router.post("/forgot-password", validators.forgotPassword, forgotPassword);
router.post("/reset-password", validators.resetPassword, resetPassword);
router.post("/create-admin", validators.createAdmin, createAdmin);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// ✅ Rutas protegidas
router.get("/me", verifyToken, getAuthenticatedUser);

// ✅ Solo admins
router.get("/", verifyToken, checkRole(["admin"]), getAllUsers);

// 🚫 Ruta no encontrada
router.all("*", (req, res) => {
  logger.warn(`❌ Ruta no encontrada: ${req.originalUrl}`);
  res.status(404).json({ message: "🚫 Ruta no encontrada en authRoutes." });
});

module.exports = router;

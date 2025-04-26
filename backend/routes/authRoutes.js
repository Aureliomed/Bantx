const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const logger = require("../utils/logger");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

// 📌 Importar controladores
const authController = require("../controllers/authController");

// 📌 Verificar que los métodos existen en authController
const requiredMethods = [
  "registerUser",
  "login",
  "forgotPassword",
  "resetPassword",
  "createAdmin",
  "getAuthenticatedUser",
  "getAllUsers",
  "refreshToken",
  "logout"
];

requiredMethods.forEach((method) => {
  if (typeof authController[method] !== "function") {
    throw new Error(`❌ Error: ${method} no está definido o no es una función en authController.js`);
  }
});

// 📌 Destructuración de los métodos
const {
  registerUser,
  login,
  forgotPassword,
  resetPassword,
  createAdmin,
  getAuthenticatedUser,
  getAllUsers,
  refreshToken,
  logout
} = authController;

// 📌 Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsgs = errors.array().map(e => e.msg);
    logger.warn("⚠️ Errores de validación:", errorMsgs);
    return res.status(400).json({ message: errorMsgs.join(" | ") });
  }
  next();
};

// 📌 Validaciones
const validateRegister = [
  check("email", "El correo electrónico es inválido.").isEmail(),
  check("password", "La contraseña debe tener al menos 6 caracteres.").isLength({ min: 6 }),
  handleValidationErrors,
];

const validateLogin = [
  check("email", "El correo electrónico es inválido.").isEmail(),
  check("password", "La contraseña es requerida.").exists(),
  handleValidationErrors,
];

const validateForgotPassword = [
  check("email", "El correo electrónico es inválido.").isEmail(),
  handleValidationErrors
];

const validateResetPassword = [
  check("token", "El token es requerido.").exists(),
  check("newPassword", "La nueva contraseña debe tener al menos 8 caracteres.").isLength({ min: 8 }),
  handleValidationErrors,
];

const validateCreateAdmin = [
  check("email", "El correo electrónico es inválido.").isEmail(),
  check("password", "La contraseña debe tener al menos 8 caracteres.").isLength({ min: 8 }),
  check("secretKey", "La clave secreta es requerida.").exists(),
  handleValidationErrors,
];

// 📌 Rutas públicas
router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, login);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);
router.post("/create-admin", validateCreateAdmin, createAdmin);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// 📌 Ruta protegida: Obtener usuario autenticado
router.get("/me", verifyToken, getAuthenticatedUser);

// 📌 Ruta protegida: Obtener todos los usuarios (solo admin)
router.get("/", verifyToken, checkRole(["admin"]), getAllUsers);

// 📌 Manejo de rutas no definidas
router.use((req, res) => {
  logger.warn(`❌ Ruta no encontrada: ${req.originalUrl}`);
  res.status(404).json({ message: "🚫 Ruta no encontrada en authRoutes." });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

// 🔥 Validar que todos los métodos existan al iniciar
[
  "getAllUsers",
  "getProfile",
  "updateProfile",
  "deleteUser",
  "saveOnboardingData",
  "getReferrals",
].forEach(fn => {
  if (typeof userController[fn] !== "function") {
    throw new Error(`❌ Error: ${fn} no está definido en userController.js`);
  }
});

// ✅ Rutas protegidas
router.use(verifyToken); // Aplica auth a todas las rutas debajo

// 📋 Perfil del usuario
router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);

// 🎯 Onboarding inicial
router.post("/onboarding", userController.saveOnboardingData);

// 🫂 Referidos
router.get("/referrals", userController.getReferrals);

// 👑 Acciones solo para Admins
router.get("/", checkRole(["admin"]), userController.getAllUsers);
router.delete("/:id", checkRole(["admin"]), userController.deleteUser);

// 🚫 Ruta no encontrada
router.all("*", (req, res) => {
  res.status(404).json({ message: "🚫 Ruta no encontrada en userRoutes." });
});

module.exports = router;

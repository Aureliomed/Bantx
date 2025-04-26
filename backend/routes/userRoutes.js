const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

if (!userController.getAllUsers) {
  throw new Error("❌ Error: getAllUsers no está definido en userController.js");
}
if (!userController.getProfile) {
  throw new Error("❌ Error: getProfile no está definido en userController.js");
}
if (!userController.updateProfile) {
  throw new Error("❌ Error: updateProfile no está definido en userController.js");
}
if (!userController.deleteUser) {
  throw new Error("❌ Error: deleteUser no está definido en userController.js");
}

// 📌 Asignación directa
const getAllUsers = userController.getAllUsers;
const getProfile = userController.getProfile;
const updateProfile = userController.updateProfile;
const deleteUser = userController.deleteUser;
const getReferrals = userController.getReferrals;

// ✅ NUEVA RUTA: Guardar datos de onboarding
router.post("/onboarding", verifyToken, userController.saveOnboardingData);

// 📌 Rutas protegidas
router.get("/", verifyToken, checkRole(["admin"]), getAllUsers);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.get("/referrals", verifyToken, getReferrals);
router.delete("/:id", verifyToken, checkRole(["admin"]), deleteUser);

// 📌 Manejo de rutas no definidas
router.use((req, res) => {
  res.status(404).json({ message: "🚫 Ruta no encontrada en userRoutes." });
});

module.exports = router;

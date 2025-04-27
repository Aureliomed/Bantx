const User = require("../models/User");
const logger = require("../utils/logger");

// 📌 Obtener perfil del usuario autenticado
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "🚫 Usuario no encontrado." });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error en getProfile:", err);
    return res.status(500).json({ message: "❌ Error en el servidor." });
  }
};

// 📌 Actualizar perfil del usuario
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "🚫 Usuario no encontrado." });
    }

    const { email, role, profileData, onboardingCompleted } = req.body;

    // Actualizar email si se proporciona
    if (email) user.email = email;

    // Solo admin puede cambiar el rol
    if (role && req.user.role === "admin") {
      user.role = role;
    }

    if (profileData && typeof profileData === "object") {
      if (!user.profileData) user.profileData = {};
      if (!user.profileData.wallet || typeof user.profileData.wallet !== "object") {
        user.profileData.wallet = { usdt: 0, usdc: 0 };
      }

      // Actualizar campos de wallet
      if (profileData.wallet && typeof profileData.wallet === "object") {
        user.profileData.wallet = {
          ...user.profileData.wallet,
          ...profileData.wallet,
        };
      }

      // Actualizar otros campos de profileData
      Object.entries(profileData).forEach(([key, value]) => {
        if (key !== "wallet") {
          user.profileData[key] = value;
        }
      });

      user.markModified("profileData");
    }

    // Validar si el onboarding puede completarse
    const camposObligatorios = [
      "nombre", "apellido", "fechaNacimiento", "pais", "ciudad",
      "tipoDocumento", "numeroDocumento", "phone", "pin", "referencia"
    ];
    const camposFaltantes = camposObligatorios.filter(campo => !user.profileData?.[campo]);

    if (onboardingCompleted === true || camposFaltantes.length === 0) {
      user.onboardingCompleted = true;
    } else {
      console.warn(`⏳ Onboarding incompleto. Faltan campos: ${camposFaltantes.join(", ")}`);
    }

    await user.save();

    return res.status(200).json({
      message: "✅ Perfil actualizado con éxito.",
      onboardingCompleted: user.onboardingCompleted,
    });

  } catch (err) {
    console.error("❌ Error en updateProfile:", err);
    return res.status(500).json({ message: "❌ Error en el servidor." });
  }
};

// 📌 Obtener lista de usuarios (admin)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "🚫 Acceso denegado. Solo administradores pueden ver todos los usuarios." });
    }

    const { page = 1, limit = 10 } = req.query;

    const users = await User.find()
      .select("-password")
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    logger.info("✅ Usuarios obtenidos desde MongoDB.");
    return res.status(200).json(users);
  } catch (err) {
    logger.error("❌ Error en getAllUsers:", err);
    return res.status(500).json({ message: "❌ Error en el servidor." });
  }
};

// 📌 Eliminar un usuario (solo admin)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "🚫 Acceso denegado. Solo administradores pueden eliminar usuarios." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "🚫 Usuario no encontrado." });
    }

    return res.status(200).json({ message: "✅ Usuario eliminado con éxito." });
  } catch (err) {
    console.error("❌ Error en deleteUser:", err);
    return res.status(500).json({ message: "❌ Error en el servidor." });
  }
};

// 📌 Guardar datos del onboarding inicial
exports.saveOnboardingData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "🚫 Usuario no encontrado." });
    }

    const { nombre, apellido, fechaNacimiento, pais, ciudad } = req.body;

    user.onboardingCompleted = true;
    user.profileData = { ...user.profileData, nombre, apellido, fechaNacimiento, pais, ciudad };
    user.markModified("profileData");

    await user.save();

    return res.status(200).json({ message: "✅ Datos guardados correctamente." });
  } catch (err) {
    console.error("❌ Error en saveOnboardingData:", err);
    return res.status(500).json({ message: "❌ Error al guardar datos del onboarding." });
  }
};

exports.getReferrals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("referralCode");

    if (!user || !user.referralCode) {
      return res.status(404).json({ message: "❌ Código de referido no encontrado." });
    }

    const referredUsers = await User.find({ referredBy: user.referralCode })
      .select("username email createdAt");

    return res.status(200).json(referredUsers);
  } catch (err) {
    console.error("❌ Error al obtener referidos:", err);
    return res.status(500).json({ message: "❌ Error interno del servidor." });
  }
};

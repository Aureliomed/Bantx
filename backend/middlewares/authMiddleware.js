const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

// 📌 Cargar clave pública para verificar los tokens RS256
const publicKeyPath = path.join(__dirname, "../keys/public.pem");

if (!fs.existsSync(publicKeyPath)) {
  throw new Error("❌ ERROR: Clave pública no encontrada. Asegúrate de haber generado las claves.");
}

const publicKey = fs.readFileSync(publicKeyPath, "utf8");

// 📌 Middleware para verificar token JWT
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("🚫 Token no proporcionado o mal formado.");
      return res.status(401).json({ message: "🚫 Acceso denegado. Token no válido." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      logger.error("❌ Error: Token no recibido.");
      return res.status(401).json({ message: "🚫 Token faltante en la solicitud." });
    }

    let decoded;
    try {
      // 📌 Verificar token con la clave pública y algoritmo RS256
      decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
      logger.info("📥 Decoded JWT:", decoded);

    } catch (error) {
      logger.error("❌ Error al verificar token:", error.message);
      return res.status(401).json({ message: "⚠️ Token inválido o expirado. Inicia sesión nuevamente." });
    }

    // 📌 Buscar usuario en la base de datos
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      logger.warn("⚠️ Token inválido: usuario no encontrado en la base de datos.");
      return res.status(404).json({ message: "🚫 Usuario no encontrado." });
    }

    req.user = { id: user._id, email: user.email, role: user.role };
    logger.info(`✅ Token verificado: Usuario ${user.email} con rol ${user.role}`);

    next();
  } catch (err) {
    logger.error("❌ Error general en la verificación del token:", err.message);
    return res.status(500).json({ message: "❌ Error en la autenticación." });
  }
};


// 📌 Middleware para verificar roles dinámicamente
exports.checkRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn("🚫 Acceso denegado: No hay usuario en req.user");
        return res.status(403).json({ message: "🚫 No autorizado. Inicia sesión." });
      }

      if (!roles.includes(req.user.role)) {
        logger.warn(`🚫 Acceso denegado para ${req.user.email} con rol ${req.user.role}`);
        return res.status(403).json({ message: "🚫 Acceso denegado. Permiso insuficiente." });
      }

      logger.info(`🔒 Acceso permitido: Usuario ${req.user.email} con rol ${req.user.role}`);
      next();
    } catch (err) {
      logger.error("❌ Error en checkRole middleware:", err.message);
      return res.status(500).json({ message: "❌ Error en la validación de permisos." });
    }
  };
};

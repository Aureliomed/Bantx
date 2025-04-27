const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const logger = require("../utils/logger");
const { sendEmail } = require("../utils/sendEmail");

// 📌 Cargar claves RSA
const privateKey = fs.readFileSync(path.join(__dirname, "../keys/private.pem"), "utf8");
const publicKey = fs.readFileSync(path.join(__dirname, "../keys/public.pem"), "utf8");

// 📌 Generadores de Tokens
const generateAccessToken = (userId, role) => jwt.sign({ id: userId, role }, privateKey, { algorithm: "RS256", expiresIn: "15m" });
const generateRefreshToken = (userId) => jwt.sign({ id: userId }, privateKey, { algorithm: "RS256", expiresIn: "7d" });

// 📌 Verificar Token
const verifyToken = (token) => jwt.verify(token, publicKey, { algorithms: ["RS256"] });

// 📌 Registro de usuario
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, profileData, referredBy } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "⚠️ Todos los campos son requeridos." });
    }

    const emailExists = await User.findOne({ email });
    const usernameExists = await User.findOne({ username });

    if (emailExists) return res.status(400).json({ message: "⚠️ El correo ya está registrado." });
    if (usernameExists) return res.status(400).json({ message: "⚠️ El nombre de usuario ya está en uso." });

    const newUser = new User({
      username,
      email,
      password,
      profileData: {
        ...profileData,
        fullName: profileData?.fullName || username,
      },
    });

    // Asignar referido si existe
    if (referredBy) {
      const referrer = await User.findOne({ referralCode: referredBy.trim().toUpperCase() });
      if (referrer) {
        newUser.referredBy = referrer._id;
        referrer.rewardPoints += 10;
        await referrer.save();
      } else {
        logger.warn(`⚠️ Código de referido inválido: ${referredBy}`);
      }
    }

    await newUser.save();
    logger.info(`✅ Usuario registrado: ${username}`);
    return res.status(201).json({ message: "✅ Registro exitoso." });

  } catch (err) {
    logger.error("❌ Error en registro:", err);
    return res.status(500).json({ message: "❌ Error interno del servidor." });
  }
};

// 📌 Registro de administrador
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password, secretKey } = req.body;

    if (!username || !email || !password || !secretKey) {
      return res.status(400).json({ message: "❌ Todos los campos son requeridos." });
    }

    if (secretKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "🚫 Acceso no autorizado." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "⚠️ Este administrador ya existe." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      username,
      email,
      password: hashedPassword,
      role: "admin",
      profileData: {
        fullName: username, // 🧩 puedes asignar el username como fullName si quieres
      },
    });

    await newAdmin.save();
    return res.status(201).json({ message: "✅ Administrador creado exitosamente." });

  } catch (err) {
    logger.error("❌ Error creando admin:", err);
    return res.status(500).json({ message: "❌ Error en el servidor." });
  }
};

// 📌 Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const sanitizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: sanitizedEmail }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "⚠️ Credenciales inválidas." });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    logger.info(`✅ Login exitoso: ${user.email}`);

    return res.status(200).json({
      message: "✅ Inicio de sesión exitoso.",
      token: accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted || false,
        referralCode: user.referralCode || "",
        rewardPoints: user.rewardPoints || 0,
        profileData: user.profileData || {},
        settings: user.settings || {},
      },
    });

  } catch (err) {
    logger.error("❌ Error en login:", err);
    return res.status(500).json({ message: "❌ Error interno del servidor." });
  }
};

// 📌 Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(403).json({ message: "🚫 No autorizado." });

    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(403).json({ message: "🚫 Usuario no encontrado." });

    const newAccessToken = generateAccessToken(user._id, user.role);
    return res.status(200).json({ accessToken: newAccessToken });

  } catch (err) {
    logger.error("❌ Error en refreshToken:", err);
    return res.status(500).json({ message: "❌ Error interno del servidor." });
  }
};

// 📌 Logout
exports.logout = (req, res) => {
  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "✅ Cierre de sesión exitoso." });
};

// 📌 Obtener usuario autenticado
exports.getAuthenticatedUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "🚫 Usuario no encontrado." });
    }
    return res.status(200).json(user);
  } catch (err) {
    logger.error("❌ Error obteniendo usuario:", err);
    return res.status(500).json({ message: "❌ Error interno del servidor." });
  }
};

// 📌 Obtener todos los usuarios (solo admin)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "🚫 Acceso denegado." });
    }
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (err) {
    logger.error("❌ Error obteniendo usuarios:", err);
    return res.status(500).json({ message: "❌ Error interno del servidor." });
  }
};

// 📌 Olvidé mi contraseña
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "⚠️ Email requerido." });

    const sanitizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) return res.status(404).json({ message: "❌ Cuenta no encontrada." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = await bcrypt.hash(resetToken, 10);
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Restablecimiento de contraseña",
      html: `
        <p>Hola <strong>${user.username}</strong>,</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <p><a href="${resetUrl}">Restablecer contraseña</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <hr>
        <p>Equipo SAPIM</p>
      `,
    });

    logger.info(`✅ Correo de recuperación enviado a: ${user.email}`);
    return res.status(200).json({ message: "✅ Correo enviado correctamente." });

  } catch (err) {
    logger.error("❌ Error en forgotPassword:", err);
    return res.status(500).json({ message: "❌ Error interno del servidor." });
  }
};

// 📌 Restablecer contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "❌ Token inválido o expirado." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    logger.info(`✅ Contraseña actualizada para: ${user.email}`);

    return res.status(200).json({ message: "✅ Contraseña restablecida." });

  } catch (err) {
    logger.error("❌ Error en resetPassword:", err);
    return res.status(500).json({ message: "❌ Error interno del servidor." });
  }
};

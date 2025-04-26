const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const logger = require("../utils/logger");
const { sendEmail } = require("../utils/sendEmail");

// 📌 Cargar claves para RS256 (Validación de existencia)
const privateKeyPath = path.join(__dirname, "../keys/private.pem");
const publicKeyPath = path.join(__dirname, "../keys/public.pem");

if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
  throw new Error("❌ ERROR: Claves RSA no encontradas. Genera las claves con OpenSSL.");
}

const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

// 📌 Generar Access Token con firma RS256
const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, privateKey, {
    algorithm: "RS256",
    expiresIn: "15m",
  });
};

// 📌 Generar Refresh Token con firma RS256
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, privateKey, {
    algorithm: "RS256",
    expiresIn: "7d",
  });
};

// 📌 Verificar Token con RS256
const verifyToken = (token) => {
  return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
};

// ✅ Registro de usuario con sistema de referidos
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, profileData, referredBy } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "⚠️ Todos los campos obligatorios deben ser completados." });
    }

    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingEmail) {
      return res.status(400).json({ message: "⚠️ El correo ya está registrado." });
    }

    if (existingUsername) {
      return res.status(400).json({ message: "⚠️ El nombre de usuario ya está en uso." });
    }

    const newUser = new User({
      username,
      email,
      password,
      profileData: {
        ...profileData,
        fullName: profileData?.fullName || username,
      },
    });

    // 🎁 Si hay un código de referido, buscar y asignar el usuario que refirió
    if (referredBy) {
      const referrer = await User.findOne({ referralCode: referredBy.trim().toUpperCase() });
      if (referrer) {
        newUser.referredBy = referrer._id;
        referrer.rewardPoints += 10; // puedes ajustar esta cantidad
        await referrer.save();
      } else {
        console.warn(`⚠️ Código de referido no válido: ${referredBy}`);
      }
    }

    await newUser.save();
    logger.info(`✅ Nuevo usuario registrado: ${username}`);

    return res.status(201).json({ message: "✅ Registro exitoso." });
  } catch (err) {
    logger.error("❌ Error en el registro:", err);
    return res.status(500).json({ message: "❌ Error interno del servidor." });
  }
};

// 📌 Registro manual de administrador
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    if (!email || !password || !secretKey) {
      return res.status(400).json({ message: "❌ Todos los campos son requeridos." });
    }

    if (secretKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "🚫 Acceso no autorizado." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "⚠️ Este administrador ya existe." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({ email, password: hashedPassword, role: "admin" });

    await newAdmin.save();
    return res.status(201).json({ message: "✅ Administrador creado correctamente." });
  } catch (error) {
    console.error("❌ Error creando admin:", error);
    return res.status(500).json({ message: "❌ Error del servidor." });
  }
};


// 📌 Login de usuario con almacenamiento seguro del Refresh Token
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

    logger.info(`✅ Inicio de sesión exitoso: ${user.email}`);

    return res.status(200).json({
      message: "✅ Inicio de sesión exitoso",
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

  } catch (error) {
    logger.error("❌ Error en login:", error);
    return res.status(500).json({ message: "❌ Error en el servidor." });
  }
};

// 📌 Generar un nuevo Access Token con Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(403).json({ message: "🚫 No autorizado." });
    }

    jwt.verify(refreshToken, publicKey, { algorithms: ["RS256"] }, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "⚠️ Token inválido o expirado." });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(403).json({ message: "🚫 Usuario no encontrado." });
      }

      const newAccessToken = generateAccessToken(user._id, user.role);
      return res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    logger.error("❌ Error al refrescar token:", error);
    return res.status(500).json({ message: "❌ Error en el servidor." });
  }
};

// 📌 Cerrar sesión y eliminar el Refresh Token
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
    logger.error("❌ Error al obtener usuario:", err);
    return res.status(500).json({ message: "❌ Error en el servidor." });
  }
};

// 📌 Obtener todos los usuarios (Solo Admins)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "🚫 Acceso denegado." });
    }
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (err) {
    logger.error("❌ Error al obtener usuarios:", err);
    return res.status(500).json({ message: "❌ Error en el servidor." });
  }
};


// 📌 Olvido de contraseña (📩 Envía un correo con un link para resetear)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "El email es requerido." });
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return res.status(404).json({ message: "No existe una cuenta con este email." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Restablecimiento de contraseña",
      html: `
        <p>Hola <strong>${user.username}</strong>,</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para continuar:</p>
        <p><a href="${resetUrl}" style="color:#4BB38D;">Restablecer contraseña</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si tú no realizaste esta solicitud, simplemente ignora este mensaje.</p>
        <hr>
        <p>Saludos,<br>Equipo de SAPIM</p>
      `
    });

    logger.info(`✅ Correo de restablecimiento enviado a: ${user.email}`);
    return res.status(200).json({ message: "Correo enviado para restablecer la contraseña." });

  } catch (error) {
    logger.error("❌ Error en forgotPassword:", error);
    return res.status(500).json({ message: "Error en el servidor." });
  }
};

// 📌 Restablecimiento de contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: "El token es inválido o ha expirado." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    logger.info(`✅ Contraseña restablecida para: ${user.email}`);

    return res.status(200).json({ message: "Contraseña restablecida con éxito." });
  } catch (error) {
    logger.error("❌ Error en resetPassword:", error);
    return res.status(500).json({ message: "Error en el servidor." });
  }
};

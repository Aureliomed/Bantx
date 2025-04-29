require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const socketIo = require("socket.io");
const logger = require("./utils/logger");
const { startSMTPServer } = require("./config/smtpServer");

const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", true);
}

const PORT = process.env.PORT || 8080;

// 🔐 Seguridad
app.use(helmet());

// 🌐 Configuración CORS segura
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "https://bantx.vercel.app",
  "https://bantx-git-main-aureliomeds-projects.vercel.app",
  "https://bantx-4wmrj67z3-aureliomeds-projects.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🔴 CORS: origen bloqueado -> ${origin}`);
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));

// 🧠 Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🚫 Límite de peticiones
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "🚫 Demasiadas solicitudes, intenta más tarde.",
}));

// 📅 Conexión MongoDB
(async () => {
  try {
    if (!process.env.MONGO_URI) {
      logger.error("❌ MONGO_URI no definido en .env. Abortando.");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    logger.info("✅ Conectado a MongoDB correctamente.");

    const User = require("./models/User");
    const userCount = await User.countDocuments();
    logger.info(`📊 Usuarios registrados: ${userCount}`);

    startSMTPServer();

  } catch (err) {
    logger.error(`❌ Error de conexión MongoDB: ${err.message}`);
    process.exit(1);
  }
})();

// 📜 Rutas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const emailRoutes = require("./routes/emailRoutes");
const paymentsRoutes = require("./routes/payments");
const phoneVerificationRoutes = require("./routes/phoneVerificationRoutes"); // ✅

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/verify-phone", phoneVerificationRoutes); // ✅

app.get("/", (req, res) => {
  res.status(200).json({ message: "✅ Backend funcionando." });
});

// ❌ 404
app.use((req, res) => {
  res.status(404).json({ message: "🚫 Ruta no encontrada." });
});

// 🧨 Error global
app.use((err, req, res, next) => {
  logger.error(`❌ Error del servidor: ${err.message}`);
  if (!res.headersSent) {
    res.status(err.status || 500).json({ message: err.message || "Error interno" });
  }
});

// 🌐 WebSocket
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  logger.info(`🟢 WebSocket conectado: ${socket.id}`);
  socket.on("disconnect", () => {
    logger.info(`🔴 WebSocket desconectado: ${socket.id}`);
  });
});

const API_URL = process.env.VITE_API_URL || `http://localhost:${PORT}`;

server.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en ${API_URL}`);

  io.emit("server-status", {
    api: API_URL,
    smtp: "activo",
    mongodb: "conectado",
    websocket: "activo",
    timestamp: new Date().toISOString(),
  });

  console.log(`
✅ SERVIDOR ARRANCADO:

📡 API: ${API_URL}
📧 SMTP: puerto 2525
📅 MongoDB: Conectado
🌌 WebSocket: Activo
  `);
});

module.exports = { app, io };

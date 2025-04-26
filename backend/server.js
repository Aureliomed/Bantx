// 📌 Importaciones básicas
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const socketIo = require("socket.io");
const logger = require("./utils/logger"); // 📌 Logger centralizado con Winston
const { startSMTPServer } = require("./config/smtpServer"); // 📩 Importar el servidor SMTP

const app = express();
const PORT = process.env.PORT || 5000;

// 🔒 Middlewares de seguridad
app.use(helmet());

// ✅ Configuración avanzada de CORS
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",   // Vercel frontend en producción
  "https://bantx.vercel.app",  // URL de producción de frontend en Vercel
  "https://bantx-git-main-aureliomeds-projects.vercel.app",  // Otros dominios de producción Vercel
  "https://bantx-4wmrj67z3-aureliomeds-projects.vercel.app",  // Otros dominios de producción Vercel
  "https://insurance-app-xi.vercel.app", // Si tienes más dominios Vercel
  "https://wealthy-kellie-aurelio104-48c9a52a.koyeb.app",  // Koyeb frontend (si se aplica)
  "https://insurance-3gzup83o0-aurelio104s-projects.vercel.app", // Más dominios de producción
  "https://insurance-frq4np317-aureli104s-projects.vercel.app",
  "https://insurance-99hv2wop0-aureli104s-projects.vercel.app",
];

// Middleware CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);  // Permite el origen
    } else {
      console.warn(`🛑 Origen no permitido por CORS: ${origin}`);
      callback(new Error("No permitido por CORS"));  // Bloquea el origen
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));

// 📌 Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🚫 Protección contra ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "🚫 Demasiadas solicitudes desde esta IP. Inténtalo de nuevo más tarde.",
});
app.use(limiter);

// 📌 Conexión a MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/sapim");
    logger.info("✅ Conectado a MongoDB");

    // 🚀 Después de conectar MongoDB, iniciar el servidor SMTP
    startSMTPServer();
  } catch (err) {
    logger.error(`❌ Error de conexión a MongoDB: ${err.message}`);
    process.exit(1);
  }
})();

// 📌 Importar rutas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const emailRoutes = require("./routes/emailRoutes");
const paymentsRoutes = require("./routes/payments");

const routes = {
  "/api/auth": authRoutes,
  "/api/users": userRoutes,
  "/api/emails": emailRoutes,
  "/api/payments": paymentsRoutes,
};

Object.entries(routes).forEach(([path, route]) => {
  if (!route) {
    logger.error(`❌ Error: La ruta ${path} no está correctamente importada.`);
    process.exit(1);
  }
  app.use(path, route);
});

// Middleware para loguear cada request
app.use((req, res, next) => {
  logger.info(`📥 ${req.method} ${req.path}`);
  next();
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.status(200).json({ message: "✅ ¡Backend funcionando correctamente!" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "🚫 Ruta no encontrada." });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  logger.error(`❌ Error en el servidor: ${err.message}`);
  if (!res.headersSent) {
    res.status(err.status || 500).json({ message: err.message || "Error interno del servidor." });
  }
});

// 🌐 WebSocket Server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado a WebSocket", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado", socket.id);
  });
});

server.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);

  io.emit("server-status", {
    api: `http://localhost:${PORT}`,
    smtp: "activo",
    mongodb: "conectado",
    websocket: "activo",
    timestamp: new Date().toISOString()
  });

  console.log(`
🟢 TODOS LOS SERVICIOS INICIADOS CORRECTAMENTE:

📡 API:           http://localhost:${PORT}
📬 SMTP:          puerto 2525
🛢️  MongoDB:      Conectado
🌐 WebSocket:     Activo
`);
});

module.exports = { app, io };

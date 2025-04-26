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
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",  // Cambiar a tu frontend en Vercel
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Middleware adicional para compatibilidad con CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

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

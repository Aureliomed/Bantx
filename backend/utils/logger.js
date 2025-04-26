const { createLogger, transports, format } = require("winston");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // 📌 Logs en la terminal
    new transports.File({ filename: "logs/error.log", level: "error" }), // 📌 Solo errores
    new transports.File({ filename: "logs/combined.log" }), // 📌 Todos los logs
  ],
});

module.exports = logger;

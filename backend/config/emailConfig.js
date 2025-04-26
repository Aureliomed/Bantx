const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 2525, // 🔥 Asegúrate de que es el mismo en todos lados
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;

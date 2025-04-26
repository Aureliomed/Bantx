const transporter = require("../config/emailConfig");

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log("📧 Intentando enviar correo a:", to);

    if (!to || typeof to !== "string" || to.trim() === "") {
      throw new Error("❌ ERROR: El campo 'to' está vacío o es inválido.");
    }

    const mailOptions = {
      from: '"BANTX" <no-reply@bantx.com>',
      to: [to.trim()], // 📌 Convertir `to` en un array
      subject,
      text,
      html,
    };

    console.log("📤 Opciones del correo:", mailOptions);

    let info = await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado a: ${to} con ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    throw new Error("Error enviando el correo.");
  }
};

module.exports = { sendEmail };

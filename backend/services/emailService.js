const transporter = require("../config/emailConfig");

/**
 * Enviar un correo utilizando el servidor SMTP interno.
 * @param {string} to - Dirección de correo del destinatario.
 * @param {string} subject - Asunto del correo.
 * @param {string} text - Cuerpo del correo (opcional si se usa html).
 * @param {string} html - Contenido HTML del correo (opcional).
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!to) {
      throw new Error("El campo 'to' es obligatorio."); // 🚀 Nueva validación para evitar errores
    }

    const mailOptions = {
      from: '"BANTX" <no-reply@bantx.com>',
      to, // 📌 Asegurar que `to` está definido
      subject,
      text,
      html,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log(`📤 Correo enviado a: ${to} con ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    throw new Error("Error enviando el correo.");
  }
};

module.exports = { sendEmail };

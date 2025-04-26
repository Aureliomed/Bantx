const mongoose = require("mongoose");
const transporter = require("../config/emailConfig");
const Email = require("../models/Email");
const logger = require("../utils/logger"); // 📌 Logger centralizado

/**
 * 📩 Enviar un correo utilizando el servidor SMTP interno.
 * @param {string} to - Dirección de correo del destinatario.
 * @param {string} subject - Asunto del correo.
 * @param {string} text - Cuerpo del correo (opcional si se usa html).
 * @param {string} html - Contenido HTML del correo (opcional).
 * @param {string} type - Tipo de correo (password_reset, payment_notification, general, etc.).
 */
exports.sendEmail = async (req, res) => {
  logger.info("🔍 Request body recibido:", req.body);

  const { to, subject, text, html, type } = req.body;

  try {
    if (!type) {
      return res.status(400).json({ message: "El campo 'type' es obligatorio." });
    }

    const mailOptions = {
      from: '"BANTX" <no-reply@bantx.com>',
      to,
      subject,
      text,
      html,
    };

    let info = await transporter.sendMail(mailOptions);
    logger.info(`📤 Correo enviado a: ${to} con ID: ${info.messageId}`);

    const email = new Email({ from: "no-reply@bantx.com", to, subject, text, html, type });
    await email.save();

    res.status(200).json({ message: "Correo enviado con éxito", emailId: info.messageId });
  } catch (error) {
    logger.error("❌ Error enviando correo:", error.message);
    res.status(500).json({ message: "No se pudo enviar el correo." });
  }
};

/**
 * 📬 Obtener todos los correos enviados (solo para usuarios con rol 'admin').
 * 🔎 Soporta filtros avanzados por tipo, fecha, y paginación (?type=email_type&page=1&limit=10).
 */
exports.getEmails = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "🚫 Acceso denegado. Se requieren permisos de administrador." });
    }

    const { type, page = 1, limit = 10, startDate, endDate } = req.query;
    let filter = {};

    if (type) {
      filter.type = type;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const emails = await Email.find(filter)
      .select("-__v") // 🔹 Excluir campo innecesario
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEmails = await Email.countDocuments(filter);

    logger.info(`📨 ${emails.length} correos obtenidos para admin ${req.user.email}.`);

    res.status(200).json({
      totalEmails,
      totalPages: Math.ceil(totalEmails / limit),
      currentPage: parseInt(page),
      hasNextPage: page < Math.ceil(totalEmails / limit),
      hasPrevPage: page > 1,
      emails,
    });
  } catch (error) {
    logger.error("❌ Error obteniendo correos:", error);
    res.status(500).json({ message: "Error obteniendo correos." });
  }
};

/**
 * 🗑️ Eliminar un correo por ID (solo admins).
 */
exports.deleteEmail = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "🚫 Acceso denegado. Se requieren permisos de administrador." });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de correo inválido." });
    }

    const email = await Email.findByIdAndDelete(id);
    if (!email) {
      return res.status(404).json({ message: "Correo no encontrado." });
    }

    logger.info(`🗑️ Correo eliminado con ID: ${id}`);
    res.status(200).json({ message: "Correo eliminado con éxito." });
  } catch (error) {
    logger.error("❌ Error eliminando correo:", error);
    res.status(500).json({ message: "Error eliminando el correo." });
  }
};

/**
 * 🔄 Actualizar estado de un correo (ejemplo: marcar como leído).
 */
exports.updateEmail = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "🚫 Acceso denegado. Se requieren permisos de administrador." });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de correo inválido." });
    }

    if (!["sent", "read"].includes(status)) {
      return res.status(400).json({ message: "Estado inválido. Debe ser 'sent' o 'read'." });
    }

    const email = await Email.findByIdAndUpdate(id, { status }, { new: true });

    if (!email) {
      return res.status(404).json({ message: "Correo no encontrado." });
    }

    logger.info(`✅ Correo actualizado con ID: ${id}, nuevo estado: ${status}`);
    res.status(200).json({ message: "Correo actualizado con éxito.", email });
  } catch (error) {
    logger.error("❌ Error actualizando correo:", error);
    res.status(500).json({ message: "Error actualizando el correo." });
  }
};

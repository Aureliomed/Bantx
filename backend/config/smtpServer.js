const { SMTPServer } = require("smtp-server");
const { simpleParser } = require("mailparser");
const Email = require("../models/Email");

// Función para iniciar el servidor SMTP
const startSMTPServer = () => {
  const server = new SMTPServer({
    authOptional: true, // No requiere autenticación para pruebas internas
    onData(stream, session, callback) {
      simpleParser(stream, {}, async (err, parsed) => {
        if (err) {
          console.error("❌ Error al procesar el correo:", err);
          return callback(err);
        }

        console.log("📩 Nuevo correo recibido:");
        console.log(`📤 De: ${parsed.from.text}`);
        console.log(`📥 Para: ${parsed.to.text}`);
        console.log(`📜 Asunto: ${parsed.subject}`);
        console.log(`✉️ Cuerpo: ${parsed.text}`);

        // Guardar el correo en la base de datos
        try {
          const email = new Email({
            from: parsed.from.text,
            to: parsed.to.text,
            subject: parsed.subject,
            text: parsed.text,
            html: parsed.html,
            date: new Date(),
            type: "received_email" // 📌 Agregar un tipo por defecto
          });

          await email.save();
          console.log("✅ Correo guardado en la base de datos.");
        } catch (error) {
          console.error("❌ Error guardando el correo:", error);
        }

        callback();
      });
    },
  });

  // Iniciar el servidor SMTP en el puerto 2525
  server.listen(2525, () => {
    console.log("🚀 Servidor SMTP corriendo en puerto 2525");
  });
};

module.exports = { startSMTPServer };
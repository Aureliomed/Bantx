// utils/startSMTPServer.js
const { SMTPServer } = require("smtp-server");
const { simpleParser } = require("mailparser");
const Email = require("../models/Email");

const startSMTPServer = () => {
  const server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {
      simpleParser(stream, {}, async (err, parsed) => {
        if (err) {
          console.error("❌ Error al procesar el correo:", err);
          return callback(err);
        }

        console.log("📩 Correo recibido:", parsed.subject);

        try {
          const email = new Email({
            from: parsed.from.text,
            to: parsed.to.text,
            subject: parsed.subject,
            text: parsed.text,
            html: parsed.html,
            type: "received_email",
            date: new Date()
          });
          await email.save();
          console.log("✅ Correo guardado.");
        } catch (e) {
          console.error("❌ Error guardando correo:", e);
        }

        callback();
      });
    }
  });

  server.listen(2525, () => {
    console.log("🚀 Servidor SMTP corriendo en puerto 2525");
  });
};

module.exports = { startSMTPServer };

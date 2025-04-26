// test-email.js
const { sendEmail } = require("./utils/sendEmail");

(async () => {
  try {
    const result = await sendEmail({
      to: "aureliomedina_24@hotmail.com",
      subject: "📧 Test de envío directo",
      html: "<p>Este es un correo de prueba directa desde <strong>sendEmail.js</strong></p>",
    });
    console.log("✅ CORREO ENVIADO:", result);
  } catch (error) {
    console.error("❌ ERROR al enviar correo:", error);
  }
})();


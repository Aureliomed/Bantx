// backend/testQR.js

const { generateWhatsAppQRCode } = require("./services/phoneVerificationService");
const fs = require("fs");
const path = require("path");

(async () => {
  try {
    console.log("🟡 Generando código QR para WhatsApp...");

    const qrUrl = await generateWhatsAppQRCode();

    const outputPath = path.join(__dirname, "whatsapp-qr.html");
    const html = `
      <html>
        <head><title>QR WhatsApp</title></head>
        <body>
          <h1>Escanea este QR con WhatsApp</h1>
          <img src="${qrUrl}" alt="QR WhatsApp" />
        </body>
      </html>
    `;

    fs.writeFileSync(outputPath, html);
    console.log(`✅ QR generado. Abre el archivo: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error generando QR:", error);
  }
})();

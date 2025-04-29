const { makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const QRCode = require('qrcode');

// Función para enviar el código de verificación por WhatsApp
const sendVerificationCodeToPhone = async (phoneNumber) => {
  const { state, saveState } = useSingleFileAuthState('auth_info.json');
  const sock = makeWASocket({ auth: state });

  await sock.connect();

  const code = Math.floor(100000 + Math.random() * 900000); // Genera un código aleatorio de 6 dígitos
  const message = `Tu código de verificación es: ${code}`;

  try {
    await sock.sendMessage(phoneNumber + '@s.whatsapp.net', { text: message });
    saveState();
    return { success: true, code }; // Retornamos el código generado para compararlo después
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
    return { success: false };
  }
};

// Función para generar el QR de WhatsApp
const generateWhatsAppQRCode = async () => {
    const { state, saveState } = useSingleFileAuthState('auth_info.json');
    const sock = makeWASocket({ auth: state });
  
    // Esperamos a que se genere el QR
    sock.ev.on('qr', (qr) => {
      QRCode.toDataURL(qr, (err, url) => {
        if (err) {
          console.error("Error generando el QR:", err);
        } else {
          console.log("QR generado");
          return url;  // Retorna el URL del QR para mostrarlo en la página
        }
      });
    });
  
    // Conectamos a WhatsApp
    await sock.connect();
  };

// Función para validar el código de verificación
const validateVerificationCode = async (phoneNumber, code) => {
  // Aquí puedes usar una base de datos o una lógica temporal para validar el código
  // Por ejemplo, almacenando el código generado en la sesión del usuario o en una base de datos
  // Este es un ejemplo básico sin persistencia real
  const storedCode = 123456; // Aquí debes comparar con el código guardado temporalmente
  return code === storedCode;
};

module.exports = {
  sendVerificationCodeToPhone,
  validateVerificationCode,
  generateWhatsAppQRCode,
};

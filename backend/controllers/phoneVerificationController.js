const axios = require('axios');  // Usaremos axios para las solicitudes HTTP si es necesario
const { sendVerificationCodeToPhone, validateVerificationCode } = require('../services/phoneVerificationService');

// Función para enviar el código de verificación al teléfono
const sendVerificationCode = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Llamada a servicio para enviar el código de verificación
    const response = await sendVerificationCodeToPhone(phoneNumber);
    
    if (response.success) {
      return res.status(200).json({ success: true, message: 'Código de verificación enviado correctamente' });
    } else {
      return res.status(500).json({ success: false, message: 'Error al enviar el código de verificación' });
    }
  } catch (error) {
    console.error("Error al enviar el código:", error);
    return res.status(500).json({ success: false, message: 'Error al procesar la solicitud' });
  }
};

// Función para verificar el código ingresado por el usuario
const verifyCode = async (req, res) => {
  const { phoneNumber, code } = req.body;

  try {
    // Validamos el código con un servicio
    const isValid = await validateVerificationCode(phoneNumber, code);
    
    if (isValid) {
      // Aquí actualizas el estado del teléfono como verificado en la base de datos
      // Ejemplo: `await User.update({ phoneVerified: true })`
      return res.status(200).json({ success: true, message: 'Número de teléfono verificado correctamente' });
    } else {
      return res.status(400).json({ success: false, message: 'Código incorrecto' });
    }
  } catch (error) {
    console.error("Error al verificar el código:", error);
    return res.status(500).json({ success: false, message: 'Error al procesar la solicitud' });
  }
};

module.exports = {
  sendVerificationCode,
  verifyCode,
};

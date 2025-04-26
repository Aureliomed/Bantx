const bcrypt = require("bcryptjs");

async function hashPassword() {
  const hashedPassword = await bcrypt.hash("Medina123", 10);
  console.log("Contraseña cifrada:", hashedPassword);
}

hashPassword();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const run = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/bantx");
    console.log("🟢 Conectado a MongoDB");

    // Borrar usuarios antiguos
    await User.deleteMany({});
    console.log("🗑️ Usuarios eliminados");

    // Crear usuario admin
    const admin = new User({
      username: "adminAurelio",
      email: "aurelio@gmail.com",
      password: await bcrypt.hash("Medina123", 10),
      role: "admin",
      status: "active",
      onboardingCompleted: true,
    });

    // Crear usuario normal
    const user = new User({
      username: "usuarioAurelio",
      email: "aurelio1@gmail.com",
      password: await bcrypt.hash("Medina123", 10),
      role: "user",
      status: "active",
      onboardingCompleted: true,
    });

    await admin.save();
    await user.save();

    console.log("✅ Usuarios creados con éxito");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

run();

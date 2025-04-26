const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "blocked", "inactive"],
      default: "active",
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    // 🧍 Perfil completo
    profileData: {
      fullName: String,
      phone: String,
      nombre: String,
      apellido: String,
      fechaNacimiento: String,
      pais: String,
      ciudad: String,
      alias: String,
      preferredCurrency: { type: String, default: "USDT" },
      language: { type: String, default: "es" },
      nacionalidad: String,
      tipoDocumento: String,
      numeroDocumento: String,
      pin: String,
      referencia: String,

      // 💳 Wallet (saldos)
      wallet: {
        usdt: { type: Number, default: 0 },
        usdc: { type: Number, default: 0 },
      },
    },

    // ✅ Estado de onboarding
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // ⚙️ Configuración del usuario
    settings: {
      notificationsEnabled: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
      pinEnabled: { type: Boolean, default: false },
    },

    // 💰 Historial de transacciones
    transactions: [
      {
        type: {
          type: String,
          enum: ["deposit", "withdrawal", "transfer", "loan"],
        },
        amount: Number,
        currency: String,
        to: String,
        from: String,
        status: { type: String, default: "pending" },
        date: { type: Date, default: Date.now },
      },
    ],

    // 🌟 Recompensas y referidos
    referralCode: String,
    referredBy: String,
    rewardPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 🔐 Cifrar contraseña si fue modificada
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && !this.password.startsWith("$2a$")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // 🔐 Generar código de referido si no existe
  if (!this.referralCode) {
    const uniqueCode = generateReferralCode(this.username || this.email);
    this.referralCode = uniqueCode;
  }

  next();
});

// Función auxiliar (puedes moverla arriba o a helpers)
function generateReferralCode(base) {
  const clean = base.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4);
  const rand = Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatorios
  return `${clean}${rand}`;
}


module.exports = mongoose.model("User", UserSchema);

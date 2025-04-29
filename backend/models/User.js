const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 👜 Esquema de billetera
const WalletSchema = new mongoose.Schema({
  usdt: { type: Number, default: 0 },
  usdc: { type: Number, default: 0 },
}, { _id: false });

// 🧾 Esquema de perfil del usuario
const ProfileSchema = new mongoose.Schema({
  fullName: { type: String, trim: true },
  phone: { type: String, trim: true },
  nombre: { type: String, trim: true },
  apellido: { type: String, trim: true },
  fechaNacimiento: { type: String, trim: true },
  pais: { type: String, trim: true },
  ciudad: { type: String, trim: true },
  alias: { type: String, trim: true },
  preferredCurrency: { type: String, default: "USDT" },
  language: { type: String, default: "es" },
  nacionalidad: { type: String, trim: true },
  tipoDocumento: { type: String, trim: true },
  numeroDocumento: { type: String, trim: true },
  pin: { type: String, select: false },
  referencia: { type: String, trim: true },
  wallet: { type: WalletSchema, default: () => ({}) },
}, { _id: false });

// ⚙️ Configuraciones de usuario
const SettingsSchema = new mongoose.Schema({
  notificationsEnabled: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: false },
  pinEnabled: { type: Boolean, default: false },
}, { _id: false });

// 💸 Historial de transacciones
const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "transfer", "loan"],
    required: true,
  },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  to: String,
  from: String,
  status: { type: String, default: "pending" },
  date: { type: Date, default: Date.now },
}, { _id: false });

// 👤 Esquema principal de usuario
const UserSchema = new mongoose.Schema({
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

  // ✅ Verificación (agrupado)
  verification: {
    code: { type: String, select: false },
    expires: { type: Date, select: false },
    phoneVerified: { type: Boolean, default: false }
  },

  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  profileData: { type: ProfileSchema, default: () => ({}) },
  onboardingCompleted: { type: Boolean, default: false },
  settings: { type: SettingsSchema, default: () => ({}) },
  transactions: { type: [TransactionSchema], default: [] },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rewardPoints: { type: Number, default: 0 },
}, { timestamps: true });

// 🔐 Middleware: hash de contraseña + generación de referralCode
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && !this.password.startsWith("$2a$")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (!this.referralCode) {
    const cleanBase = (this.username || this.email)
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 4);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.referralCode = `${cleanBase}${randomDigits}`;
  }

  next();
});

module.exports = mongoose.model("User", UserSchema);

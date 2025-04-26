const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  text: { type: String },
  html: { type: String },
  date: { type: Date, default: Date.now },
  type: { 
    type: String, 
    required: true, 
    enum: ["password_reset", "payment_notification", "general", "received_email"] // ✅ Agregar received_email
  },
});

module.exports = mongoose.model("Email", EmailSchema);

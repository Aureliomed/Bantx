// 📁 models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ["manual", "request"],
    default: "manual", // Por defecto los pagos se consideran "manual"
  },
  description: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending", // Para que se revise antes de acreditar
  },
});

module.exports = mongoose.model("Payment", paymentSchema);

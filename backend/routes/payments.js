// 📁 backend/routes/payments.js
const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const Payment = require("../models/Payment");
const logger = require("../utils/logger");

// 📌 POST /api/payments/request - Solicitar fondos (usuario)
router.post("/request", verifyToken, checkRole(["user"]), async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ message: "⚠️ Todos los campos son obligatorios." });
    }

    const newRequest = new Payment({
      userId: req.user.id,
      amount,
      description,
      type: "request",
      status: "pending",
      createdAt: new Date(),
    });

    await newRequest.save();
    logger.info(`📥 Nueva solicitud de fondos por ${amount} de ${req.user.email}`);
    res.status(201).json({ message: "✅ Solicitud registrada correctamente." });
  } catch (error) {
    logger.error("❌ Error al registrar la solicitud:", error);
    res.status(500).json({ message: "❌ Error al enviar solicitud." });
  }
});

// 📌 POST /api/payments/manual - Registrar pago manual (usuario)
router.post("/manual", verifyToken, checkRole(["user"]), async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "⚠️ Debes ingresar un monto." });
    }

    const newPayment = new Payment({
      userId: req.user.id,
      amount,
      type: "manual",
      status: "pending", // 🟡 Pendiente hasta que admin lo apruebe
      createdAt: new Date(),
    });

    await newPayment.save();
    logger.info(`💰 Nuevo pago pendiente por ${req.user.email} por $${amount}`);
    res.status(201).json({ message: "✅ Pago registrado. Pendiente de aprobación." });
  } catch (error) {
    logger.error("❌ Error al registrar el pago manual:", error);
    res.status(500).json({ message: "❌ Error interno al registrar el pago." });
  }
});

// 📌 GET /api/payments/history - Historial de pagos aprobados (usuario)
router.get("/history", verifyToken, checkRole(["user"]), async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user.id,
      type: { $in: ["manual", "payment"] },
      status: "approved", // ✅ Solo los aprobados
    }).sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    logger.error("❌ Error al obtener historial de pagos:", error);
    res.status(500).json({ message: "❌ Error al cargar historial." });
  }
});

// 📌 GET /api/payments/all - Todos los pagos del usuario (aprobados + pendientes)
router.get("/all", verifyToken, checkRole(["user"]), async (req, res) => {
  try {
    const allPayments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(allPayments);
  } catch (error) {
    logger.error("❌ Error al obtener todos los pagos:", error);
    res.status(500).json({ message: "❌ Error al obtener pagos." });
  }
});

// 📌 GET /api/payments/pending - Ver pagos pendientes (admin)
router.get("/pending", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const pendingPayments = await Payment.find({ status: "pending" })
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    res.status(200).json(pendingPayments);
  } catch (error) {
    logger.error("❌ Error al obtener pagos pendientes:", error);
    res.status(500).json({ message: "❌ Error al obtener pagos." });
  }
});

// 📌 PUT /api/payments/approve/:id - Aprobar pago (admin)
router.put("/approve/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "❌ Pago no encontrado." });
    }

    payment.status = "approved";
    await payment.save();

    logger.info(`✅ Pago aprobado para usuario ${payment.userId} - Monto: $${payment.amount}`);
    res.status(200).json({ message: "✅ Pago aprobado correctamente." });
  } catch (error) {
    logger.error("❌ Error al aprobar el pago:", error);
    res.status(500).json({ message: "❌ Error al aprobar el pago." });
  }
});

// 📌 DELETE /api/payments/:id - Eliminar pago (admin)
router.delete("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "❌ Pago no encontrado para eliminar." });
    }

    logger.info(`🗑️ Pago eliminado: ${payment._id} (${payment.amount}$)`);
    res.status(200).json({ message: "🗑️ Pago eliminado correctamente." });
  } catch (error) {
    logger.error("❌ Error al eliminar el pago:", error);
    res.status(500).json({ message: "❌ Error al eliminar el pago." });
  }
});

module.exports = router;

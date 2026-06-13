const express = require("express");
const router  = express.Router();
const Booking = require("../models/Booking");
const { protect } = require("../middleware/auth");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");

// All booking routes require login
router.use(protect);

const bookingRules = [
  body("tripName").trim().notEmpty().withMessage("Trip name required"),
  body("items").isArray({ min: 1 }).withMessage("At least one item required"),
  body("items.*.type").isIn(["hotel","restaurant","activity","flight"]),
  body("items.*.name").trim().notEmpty(),
  body("items.*.lineTotal").isFloat({ min: 0 }),
  body("grandTotal").isFloat({ min: 0 }),
];

// ── POST /api/bookings ─ create a real booking record ──────────
router.post("/", bookingRules, validate, async (req, res, next) => {
  try {
    const { tripName, items, subtotal, taxAmount, serviceFee, grandTotal, currency } = req.body;

    // Generate a short confirmation ID: TL-2026-XXXXX
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    const confirmationId = `TL-${year}-${rand}`;

    const booking = await Booking.create({
      user: req.user._id,
      tripName,
      items,
      subtotal:       subtotal || grandTotal,
      taxAmount:      taxAmount || 0,
      serviceFee:     serviceFee || 0,
      grandTotal,
      currency:       currency || "USD",
      confirmationId,
      status: "confirmed",
    });

    res.status(201).json({
      booking,
      confirmationId,
      message: `Booking confirmed! Your reference is ${confirmationId}`,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/bookings/me ─ all bookings for the logged-in user ─
router.get("/me", async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/bookings/:id ──────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/bookings/:id/cancel ───────────────────────────────
router.put("/:id/cancel", async (req, res, next) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: "confirmed" },
      { status: "cancelled" },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: "Booking not found or already cancelled" });
    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

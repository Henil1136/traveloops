const mongoose = require("mongoose");

const bookingItemSchema = new mongoose.Schema({
  type:          { type: String, enum: ["hotel","restaurant","activity","flight"], required: true },
  itemId:        { type: String, required: true },
  name:          { type: String, required: true },
  city:          String,
  country:       String,
  img:           String,
  pricePerNight: Number,
  cost:          Number,
  nights:        { type: Number, default: 1 },
  qty:           { type: Number, default: 1 },
  lineTotal:     { type: Number, required: true },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tripName:       { type: String, required: true },
  items:          [bookingItemSchema],
  subtotal:       { type: Number, required: true },
  taxAmount:      { type: Number, required: true },
  serviceFee:     { type: Number, required: true },
  grandTotal:     { type: Number, required: true },
  currency:       { type: String, default: "USD" },
  status:         { type: String, enum: ["confirmed","cancelled","pending"], default: "confirmed" },
  confirmationId: { type: String, required: true, unique: true },
  paymentMethod:  { type: String, default: "demo" },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);

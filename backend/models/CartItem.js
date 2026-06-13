const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type:    { type: String, enum: ["hotel","restaurant","activity","flight"], required: true },
  itemId:  { type: String, required: true },  // ref id from relevant collection
  name:    { type: String, required: true },
  img:     { type: String },
  price:   { type: Number, required: true },
  qty:     { type: Number, default: 1 },
  nights:  { type: Number, default: 1 },      // for hotels
  city:    { type: String },
  meta:    { type: mongoose.Schema.Types.Mixed }, // extra info
}, { timestamps: true });

cartItemSchema.index({ user: 1 });
cartItemSchema.index({ user: 1, itemId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("CartItem", cartItemSchema);

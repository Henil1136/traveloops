const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  city:        { type: String, required: true },
  country:     { type: String, required: true },
  img:         { type: String },
  cuisine:     { type: String },
  priceRange:  { type: String, enum: ["$","$$","$$$","$$$$"], default: "$$" },
  rating:      { type: Number, min: 0, max: 5, default: 4.0 },
  specialty:   { type: String },
  lat:         { type: Number },
  lng:         { type: Number },
  description: { type: String },
}, { timestamps: true });

restaurantSchema.index({ city: 1 });
restaurantSchema.index({ name: "text", city: "text", cuisine: "text", specialty: "text" });

module.exports = mongoose.model("Restaurant", restaurantSchema);

const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  city:         { type: String, required: true },
  country:      { type: String, required: true },
  img:          { type: String },
  stars:        { type: Number, min: 1, max: 5, default: 3 },
  pricePerNight:{ type: Number, required: true },
  rating:       { type: Number, min: 0, max: 5, default: 4.0 },
  amenities:    [{ type: String }],
  lat:          { type: Number },
  lng:          { type: Number },
  description:  { type: String },
}, { timestamps: true });

hotelSchema.index({ city: 1 });
hotelSchema.index({ name: "text", city: "text", country: "text" });

module.exports = mongoose.model("Hotel", hotelSchema);

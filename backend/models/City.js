const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    cityId: { type: Number, unique: true },
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true },
    costIndex: { type: Number, default: 100 },
    emoji: { type: String, default: "🌍" },
    pop: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    img: { type: String, default: "" },
    region: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

// Full-text search index
citySchema.index({ name: "text", country: "text" });

module.exports = mongoose.model("City", citySchema);

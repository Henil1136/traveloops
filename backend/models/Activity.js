const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    activityId: { type: Number, unique: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["sightseeing", "food", "culture", "adventure", "leisure"],
      default: "sightseeing",
    },
    cost: { type: Number, default: 0 },
    duration: { type: Number, default: 1 }, // hours
    icon: { type: String, default: "🎯" },
    description: { type: String, default: "" },
    images: [String],
  },
  { timestamps: true }
);

activitySchema.index({ name: "text", type: "text" });

module.exports = mongoose.model("Activity", activitySchema);

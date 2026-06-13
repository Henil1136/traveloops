const mongoose = require("mongoose");

// ── Sub-schemas ─────────────────────────────────────────────────

const activitySchema = new mongoose.Schema(
  {
    activityId: Number,           // reference to ACTIVITIES_DB id
    name: { type: String, required: true },
    type: String,
    cost: { type: Number, default: 0 },
    duration: Number,
    icon: String,
  },
  { _id: true }
);

const stopSchema = new mongoose.Schema(
  {
    stopId: Number,               // legacy numeric id used by frontend
    cityName: { type: String, required: true },
    city: {
      id: Number,
      name: String,
      country: String,
      costIndex: Number,
      emoji: String,
      img: String,
      pop: String,
    },
    days: { type: Number, default: 1 },
    activities: [activitySchema],
  },
  { _id: true }
);

const noteSchema = new mongoose.Schema(
  {
    noteId: Number,
    text: { type: String, required: true },
    stopId: Number,               // optional — tied to a specific stop
    ts: { type: Date, default: Date.now },
  },
  { _id: true }
);

const checklistItemSchema = new mongoose.Schema(
  {
    itemId: Number,
    item: { type: String, required: true },
    cat: {
      type: String,
      enum: ["documents", "clothing", "electronics", "toiletries", "misc"],
      default: "misc",
    },
    packed: { type: Boolean, default: false },
  },
  { _id: true }
);

// ── Main Trip schema ─────────────────────────────────────────────

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Trip name is required"],
      trim: true,
      maxlength: [120, "Trip name cannot exceed 120 characters"],
    },
    description: { type: String, default: "", maxlength: 1000 },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number, default: 0 },
    coverPhoto: { type: String, default: "" },

    stops: [stopSchema],
    notes: [noteSchema],
    checklist: [checklistItemSchema],

    // Sharing
    isPublic: { type: Boolean, default: false },
    shareSlug: { type: String, unique: true, sparse: true }, // unique public URL slug
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: total days
tripSchema.virtual("totalDays").get(function () {
  if (!this.startDate || !this.endDate) return 0;
  return Math.max(
    1,
    Math.ceil((this.endDate - this.startDate) / 86400000)
  );
});

// Virtual: total activity cost across all stops
tripSchema.virtual("totalActivityCost").get(function () {
  return this.stops.reduce((sum, stop) => {
    return (
      sum +
      stop.activities.reduce((s, a) => s + (a.cost || 0), 0) * (stop.days || 1)
    );
  }, 0);
});

module.exports = mongoose.model("Trip", tripSchema);

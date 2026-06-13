const Trip = require("../models/Trip");
const crypto = require("crypto");

// ── Helper: generate a short unique slug ─────────────────────
const makeSlug = () => crypto.randomBytes(6).toString("hex");

// ── Reusable helper: fetch a trip owned by the current user ──
const getTripOwnedByUser = async (tripId, userId) => {
  const trip = await Trip.findOne({ _id: tripId, user: userId });
  if (!trip) {
    const err = new Error("Trip not found");
    err.statusCode = 404;
    throw err;
  }
  return trip;
};

// ═══════════════════════════════════════════════════════════════
//  TRIPS — CRUD
// ═══════════════════════════════════════════════════════════════

// GET /api/trips
exports.getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    next(err);
  }
};

// GET /api/trips/:id
exports.getTrip = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

// POST /api/trips
exports.createTrip = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, budget, coverPhoto, stops, notes, checklist } = req.body;

    if (!name) return res.status(400).json({ message: "Trip name is required" });

    const trip = await Trip.create({
      user: req.user._id,
      name,
      description,
      startDate,
      endDate,
      budget: budget || 0,
      coverPhoto,
      stops: stops || [],
      notes: notes || [],
      checklist: checklist || [],
    });

    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
};

// PUT /api/trips/:id
exports.updateTrip = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    const allowedFields = [
      "name", "description", "startDate", "endDate",
      "budget", "coverPhoto", "stops", "notes", "checklist", "isPublic",
    ];
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) trip[f] = req.body[f];
    });

    const updated = await trip.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/trips/:id
exports.deleteTrip = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);
    await Trip.deleteOne({ _id: trip._id });
    res.json({ message: "Trip deleted" });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  STOPS
// ═══════════════════════════════════════════════════════════════

// POST /api/trips/:id/stops
exports.addStop = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    trip.stops.push(req.body);
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
};

// PUT /api/trips/:id/stops/:stopId
exports.updateStop = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    const stop = trip.stops.id(req.params.stopId);
    if (!stop) return res.status(404).json({ message: "Stop not found" });

    // Whitelist allowed fields to prevent overwriting immutable fields
    const allowed = {};
    if (req.body.cityName !== undefined) allowed.cityName = req.body.cityName;
    if (req.body.days !== undefined) allowed.days = req.body.days;
    if (req.body.activities !== undefined) allowed.activities = req.body.activities;
    Object.assign(stop, allowed);
    await trip.save();
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/trips/:id/stops/:stopId
exports.deleteStop = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    trip.stops.pull({ _id: req.params.stopId });
    await trip.save();
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  NOTES
// ═══════════════════════════════════════════════════════════════

// GET /api/trips/:id/notes
exports.getNotes = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);
    res.json(trip.notes);
  } catch (err) {
    next(err);
  }
};

// POST /api/trips/:id/notes
exports.addNote = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    const { text, stopId } = req.body;
    if (!text) return res.status(400).json({ message: "Note text is required" });

    trip.notes.push({ text, stopId, ts: new Date() });
    await trip.save();
    res.status(201).json(trip.notes);
  } catch (err) {
    next(err);
  }
};

// PUT /api/trips/:id/notes/:noteId
exports.updateNote = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    const note = trip.notes.id(req.params.noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (req.body.text !== undefined) note.text = req.body.text;
    if (req.body.stopId !== undefined) note.stopId = req.body.stopId;
    await trip.save();
    res.json(trip.notes);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/trips/:id/notes/:noteId
exports.deleteNote = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    trip.notes.pull({ _id: req.params.noteId });
    await trip.save();
    res.json(trip.notes);
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  CHECKLIST
// ═══════════════════════════════════════════════════════════════

// GET /api/trips/:id/checklist
exports.getChecklist = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);
    res.json(trip.checklist);
  } catch (err) {
    next(err);
  }
};

// POST /api/trips/:id/checklist
exports.addChecklistItem = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    const { item, cat } = req.body;
    if (!item) return res.status(400).json({ message: "Item name is required" });

    trip.checklist.push({ item, cat: cat || "misc", packed: false });
    await trip.save();
    res.status(201).json(trip.checklist);
  } catch (err) {
    next(err);
  }
};

// PUT /api/trips/:id/checklist/:itemId  (toggle packed, rename, etc.)
exports.updateChecklistItem = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    const item = trip.checklist.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Whitelist allowed fields
    const allowed = {};
    if (req.body.packed !== undefined) allowed.packed = req.body.packed;
    if (req.body.item !== undefined) allowed.item = req.body.item;
    if (req.body.cat !== undefined) allowed.cat = req.body.cat;
    Object.assign(item, allowed);
    await trip.save();
    res.json(trip.checklist);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/trips/:id/checklist/:itemId
exports.deleteChecklistItem = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    trip.checklist.pull({ _id: req.params.itemId });
    await trip.save();
    res.json(trip.checklist);
  } catch (err) {
    next(err);
  }
};

// PUT /api/trips/:id/checklist/reset  — unpack everything
exports.resetChecklist = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    trip.checklist.forEach((item) => (item.packed = false));
    await trip.save();
    res.json(trip.checklist);
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
//  SHARING
// ═══════════════════════════════════════════════════════════════

// POST /api/trips/:id/share  — generate public share link
exports.shareTrip = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    if (!trip.shareSlug) trip.shareSlug = makeSlug();
    trip.isPublic = true;
    await trip.save();

    res.json({
      shareSlug: trip.shareSlug,
      shareUrl: `${req.protocol}://${req.get("host")}/api/shared/${trip.shareSlug}`,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/trips/:id/unshare
exports.unshareTrip = async (req, res, next) => {
  try {
    const trip = await getTripOwnedByUser(req.params.id, req.user._id);

    trip.isPublic = false;
    await trip.save();
    res.json({ message: "Trip is now private" });
  } catch (err) {
    next(err);
  }
};

// GET /api/shared/:slug  — public read-only view (no auth required)
exports.getSharedTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      shareSlug: req.params.slug,
      isPublic: true,
    }).populate("user", "name");

    if (!trip) return res.status(404).json({ message: "Shared trip not found" });
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

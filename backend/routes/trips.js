const express = require("express");
const router = express.Router();
const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  addStop,
  updateStop,
  deleteStop,
  getNotes,
  addNote,
  updateNote,
  deleteNote,
  getChecklist,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  resetChecklist,
  shareTrip,
  unshareTrip,
} = require("../controllers/tripController");
const { protect } = require("../middleware/auth");
const { tripRules, validate } = require("../middleware/validate");

// All trip routes require authentication
router.use(protect);

// ── Core CRUD ────────────────────────────────────────────────
router.route("/").get(getTrips).post(createTrip);
router.route("/:id").get(getTrip).put(updateTrip).delete(deleteTrip);

// ── Stops ────────────────────────────────────────────────────
router.post("/:id/stops", addStop);
router.put("/:id/stops/:stopId", updateStop);
router.delete("/:id/stops/:stopId", deleteStop);

// ── Notes ────────────────────────────────────────────────────
router.route("/:id/notes").get(getNotes).post(addNote);
router.route("/:id/notes/:noteId").put(updateNote).delete(deleteNote);

// ── Checklist ────────────────────────────────────────────────
router.route("/:id/checklist").get(getChecklist).post(addChecklistItem);
router.put("/:id/checklist/reset", resetChecklist);
router.route("/:id/checklist/:itemId").put(updateChecklistItem).delete(deleteChecklistItem);

// ── Sharing ──────────────────────────────────────────────────
router.post("/:id/share", shareTrip);
router.post("/:id/unshare", unshareTrip);

module.exports = router;

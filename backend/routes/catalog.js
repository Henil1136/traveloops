const express = require("express");
const router = express.Router();
const {
  getCities,
  getCity,
  getExternalCities,
  getActivities,
  getActivity,
} = require("../controllers/cityActivityController");
const { protect } = require("../middleware/auth");

// External city search via Ninja API
router.get("/external/cities", getExternalCities);

// Cities — read-only, public for frontend
router.get("/cities", getCities);
router.get("/cities/:id", getCity);

// Activities — read-only, protected
router.get("/activities", protect, getActivities);
router.get("/activities/:id", protect, getActivity);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getSharedTrip } = require("../controllers/tripController");

// Public — no auth
router.get("/:slug", getSharedTrip);

module.exports = router;

const express = require("express");
const router  = express.Router();
const Hotel   = require("../models/Hotel");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/hotels?city=Bali&search=ritz&limit=20
router.get("/", async (req, res, next) => {
  try {
    const { city, search, limit = 20, page = 1 } = req.query;
    const query = {};
    if (city)   query.city = new RegExp(city, "i");
    if (search) query.$text = { $search: search };
    const hotels = await Hotel.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ rating: -1 });
    res.json(hotels);
  } catch (err) {
    next(err);
  }
});

// GET /api/hotels/:id
router.get("/:id", async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    next(err);
  }
});

// POST /api/hotels (admin only — seed)
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

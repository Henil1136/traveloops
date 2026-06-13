const express    = require("express");
const router     = express.Router();
const Restaurant = require("../models/Restaurant");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/restaurants?city=Bali&cuisine=Italian&search=
router.get("/", async (req, res, next) => {
  try {
    const { city, cuisine, search, limit = 20, page = 1 } = req.query;
    const query = {};
    if (city)    query.city    = new RegExp(city,    "i");
    if (cuisine) query.cuisine = new RegExp(cuisine, "i");
    if (search)  query.$text   = { $search: search };
    const rests = await Restaurant.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ rating: -1 });
    res.json(rests);
  } catch (err) {
    next(err);
  }
});

// GET /api/restaurants/:id
router.get("/:id", async (req, res, next) => {
  try {
    const rest = await Restaurant.findById(req.params.id);
    if (!rest) return res.status(404).json({ message: "Restaurant not found" });
    res.json(rest);
  } catch (err) {
    next(err);
  }
});

// POST /api/restaurants (admin only)
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const rest = await Restaurant.create(req.body);
    res.status(201).json(rest);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

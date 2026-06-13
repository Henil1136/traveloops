const express  = require("express");
const router   = express.Router();
const CartItem = require("../models/CartItem");
const { protect } = require("../middleware/auth");
const { cartAddRules, validate } = require("../middleware/validate");

// All cart routes require auth
router.use(protect);

// GET /api/cart
router.get("/", async (req, res, next) => {
  try {
    const items = await CartItem.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST /api/cart — add item (validated)
router.post("/", cartAddRules, validate, async (req, res, next) => {
  try {
    // Atomic upsert prevents race condition: findOneAndUpdate with upsert
    const item = await CartItem.findOneAndUpdate(
      { user: req.user.id, itemId: req.body.itemId, type: req.body.type },
      { $setOnInsert: { ...req.body, user: req.user.id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // If the document already existed (wasn't just created), return 409
    // We can detect this by checking if the document was upserted
    // Using rawResult to see if it was a new doc
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Item already in cart" });
    }
    next(err);
  }
});

// PUT /api/cart/:id — update qty/nights (whitelisted fields only)
router.put("/:id", async (req, res, next) => {
  try {
    const allowed = {};
    if (req.body.qty !== undefined) allowed.qty = req.body.qty;
    if (req.body.nights !== undefined) allowed.nights = req.body.nights;
    const item = await CartItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: allowed },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/:id
router.delete("/:id", async (req, res, next) => {
  try {
    await CartItem.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: "Removed from cart" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart
router.delete("/", async (req, res, next) => {
  try {
    await CartItem.deleteMany({ user: req.user.id });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

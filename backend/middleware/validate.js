const { body, validationResult } = require("express-validator");

// ── Reusable validation error responder ───────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map(e => ({ field: e.path, msg: e.msg })),
    });
  }
  next();
};

// ── Auth rules ─────────────────────────────────────────────────
const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// ── Cart rules ──────────────────────────────────────────────────
const cartAddRules = [
  body("type")
    .isIn(["hotel", "restaurant", "activity", "flight"])
    .withMessage("type must be hotel | restaurant | activity | flight"),
  body("itemId").trim().notEmpty().withMessage("itemId is required"),
  body("name").trim().notEmpty().withMessage("name is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("price must be a non-negative number"),
  body("qty")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("qty must be between 1 and 50"),
  body("nights")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("nights must be between 1 and 365"),
];

// ── Trip rules ──────────────────────────────────────────────────
const tripRules = [
  body("name").trim().notEmpty().withMessage("Trip name is required"),
  body("budget")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("budget must be a non-negative number"),
  body("startDate").optional().isISO8601().withMessage("startDate must be a valid date"),
  body("endDate").optional().isISO8601().withMessage("endDate must be a valid date"),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  cartAddRules,
  tripRules,
};

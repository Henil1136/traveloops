const express = require("express");
const router = express.Router();
const {
  register, login, getMe, updateProfile, changePassword, deleteAccount,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { registerRules, loginRules, validate } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login",    authLimiter, loginRules,    validate, login);
router.get("/me",        protect, getMe);
router.put("/profile",   protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/account", protect, deleteAccount);

module.exports = router;

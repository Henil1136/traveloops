const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper: sign JWT ──────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({ token, user });
};

// ── POST /api/auth/register ───────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/auth/profile ─────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, photo, language, savedDestinations } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, photo, language, savedDestinations },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/auth/change-password ─────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/auth/account ──────────────────────────────────
exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
};

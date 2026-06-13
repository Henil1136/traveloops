require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// ── Route imports ──────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const catalogRoutes = require("./routes/catalog");
const adminRoutes = require("./routes/admin");
const sharedRoutes      = require("./routes/shared");
const hotelRoutes      = require("./routes/hotels");
const restaurantRoutes = require("./routes/restaurants");
const cartRoutes       = require("./routes/cart");
const bookingRoutes    = require("./routes/bookings");
const aiRoutes         = require("./routes/ai");

// ── Connect to MongoDB ─────────────────────────────────────────
connectDB();

const app = express();

// ── CORS ───────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers ───────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check (used by frontend api._check()) ───────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ── API Routes ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api", catalogRoutes);         // /api/cities  /api/activities
app.use("/api/admin", adminRoutes);
app.use("/api/shared",      sharedRoutes);
app.use("/api/hotels",      hotelRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/cart",        cartRoutes);
app.use("/api/bookings",   bookingRoutes);
app.use("/api/ai",         aiRoutes);

// ── 404 catch-all ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Central error handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  Traveloop backend running on http://localhost:${PORT}`);
  console.log(`📋  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗  API base: http://localhost:${PORT}/api\n`);
});

module.exports = app;

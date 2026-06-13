const rateLimit = require("express-rate-limit");

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many login/register attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

exports.aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { message: "AI planning quota exceeded. Wait 1 minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Too many requests. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

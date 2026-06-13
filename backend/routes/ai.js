const express = require("express");
const router = express.Router();
const { aiLimiter } = require("../middleware/rateLimiter");

// POST /api/ai/plan — proxy to Anthropic API (keeps API key server-side)
router.post("/plan", aiLimiter, async (req, res, next) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "ANTHROPIC_API_KEY is not configured on the server" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ message: err.error?.message || "Anthropic API error" });
    }

    // For SSE streaming, pipe the response body directly
    if (req.body.stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      const reader = response.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { res.end(); break; }
          res.write(value);
        }
      };
      pump().catch(next);
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;

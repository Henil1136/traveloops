const City = require("../models/City");
const Activity = require("../models/Activity");

// ═══════════════════════════════════════════════════════════════
//  CITIES
// ═══════════════════════════════════════════════════════════════

// GET /api/cities?search=paris&country=France&pop=high
exports.getCities = async (req, res, next) => {
  try {
    const { search, country, pop, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }
    if (country) filter.country = { $regex: country, $options: "i" };
    if (pop) filter.pop = pop;

    const cities = await City.find(filter)
      .limit(Number(limit))
      .sort({ name: 1 });
    // Sort by pop manually: high > medium > low
    const popOrder = { high: 0, medium: 1, low: 2 };
    cities.sort((a, b) => (popOrder[a.pop] ?? 1) - (popOrder[b.pop] ?? 1));

    res.json(cities);
  } catch (err) {
    next(err);
  }
};

// GET /api/cities/:id
exports.getCity = async (req, res, next) => {
  try {
    const city = await City.findOne({ cityId: req.params.id });
    if (!city) return res.status(404).json({ message: "City not found" });
    res.json(city);
  } catch (err) {
    next(err);
  }
};

const cityNinjaEmojis = ["🌆", "🏙️", "🌃", "🗼", "🌉", "🏰", "🌴", "⛲", "🕌", "🗽"];
const getCityEmoji = (name = "", country = "") => {
  let hash = 0;
  const str = `${name}${country}`.toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return cityNinjaEmojis[Math.abs(hash) % cityNinjaEmojis.length];
};

exports.getExternalCities = async (req, res, next) => {
  try {
    const { search } = req.query;
    if (!search || !search.trim()) return res.status(400).json({ message: "Missing search parameter" });

    const apiKey = process.env.NINJA_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "NINJA_API_KEY is not configured" });

    const url = `https://api.api-ninjas.com/v1/city?name=${encodeURIComponent(search.trim())}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
      headers: { "X-Api-Key": apiKey },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const message = await response.text();
      return res.status(response.status).json({ message: message || "Ninja API error" });
    }

    const cities = await response.json();
    const formatted = cities.map(city => ({
      id: `${city.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${city.country.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: city.name,
      country: city.country,
      population: city.population,
      latitude: city.latitude,
      longitude: city.longitude,
      costIndex: 120,
      emoji: getCityEmoji(city.name, city.country),
      pop: city.population > 5000000 ? "high" : city.population > 1000000 ? "medium" : "low",
      img: `https://source.unsplash.com/featured/?${encodeURIComponent(city.name)}`,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

// GET /api/activities?type=food&minCost=0&maxCost=100&duration=3
exports.getActivities = async (req, res, next) => {
  try {
    const { type, minCost, maxCost, duration, search, limit = 50 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (minCost !== undefined || maxCost !== undefined) {
      filter.cost = {};
      if (minCost !== undefined) filter.cost.$gte = Number(minCost);
      if (maxCost !== undefined) filter.cost.$lte = Number(maxCost);
    }
    if (duration) filter.duration = { $lte: Number(duration) };
    if (search) filter.name = { $regex: search, $options: "i" };

    const activities = await Activity.find(filter).limit(Number(limit));
    res.json(activities);
  } catch (err) {
    next(err);
  }
};

// GET /api/activities/:id
exports.getActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOne({ activityId: req.params.id });
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json(activity);
  } catch (err) {
    next(err);
  }
};

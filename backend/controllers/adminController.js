const User = require("../models/User");
const Trip = require("../models/Trip");

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTrips, trips] = await Promise.all([
      User.countDocuments(),
      Trip.countDocuments(),
      Trip.find().select("name startDate stops budget createdAt"),
    ]);

    // Aggregate city visits
    const cityCount = {};
    trips.forEach((t) => {
      t.stops.forEach((s) => {
        const key = s.cityName;
        cityCount[key] = (cityCount[key] || 0) + 1;
      });
    });
    const topCities = Object.entries(cityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const totalCityVisits = trips.reduce((acc, t) => acc + t.stops.length, 0);
    const avgBudget =
      trips.length
        ? Math.round(trips.reduce((a, t) => a + (t.budget || 0), 0) / trips.length)
        : 0;

    res.json({
      totalUsers,
      totalTrips,
      totalCityVisits,
      avgBudget,
      topCities,
      recentTrips: trips
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users?page=1&limit=50
exports.getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own admin account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Also delete their trips
    await Trip.deleteMany({ user: req.params.id });
    res.json({ message: "User and all their trips deleted" });
  } catch (err) {
    next(err);
  }
};

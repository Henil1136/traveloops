require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const City = require("./models/City");
const Activity = require("./models/Activity");
const User = require("./models/User");

const cities = [
  { cityId: 1, name: "Paris", country: "France", costIndex: 180, emoji: "🗼", pop: "high", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80", region: "Europe" },
  { cityId: 2, name: "Tokyo", country: "Japan", costIndex: 160, emoji: "🗾", pop: "high", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80", region: "Asia" },
  { cityId: 3, name: "Bali", country: "Indonesia", costIndex: 70, emoji: "🌴", pop: "high", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80", region: "Asia" },
  { cityId: 4, name: "New York", country: "USA", costIndex: 200, emoji: "🗽", pop: "high", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80", region: "Americas" },
  { cityId: 5, name: "Barcelona", country: "Spain", costIndex: 130, emoji: "🏖️", pop: "medium", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=80", region: "Europe" },
  { cityId: 6, name: "Istanbul", country: "Turkey", costIndex: 90, emoji: "🕌", pop: "medium", img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&q=80", region: "Europe" },
  { cityId: 7, name: "Kyoto", country: "Japan", costIndex: 140, emoji: "⛩️", pop: "medium", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80", region: "Asia" },
  { cityId: 8, name: "Amsterdam", country: "Netherlands", costIndex: 170, emoji: "🚲", pop: "medium", img: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&q=80", region: "Europe" },
  { cityId: 9, name: "Dubai", country: "UAE", costIndex: 210, emoji: "🏙️", pop: "high", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80", region: "Middle East" },
  { cityId: 10, name: "Prague", country: "Czech Republic", costIndex: 100, emoji: "🏰", pop: "medium", img: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&q=80", region: "Europe" },
  { cityId: 11, name: "Santorini", country: "Greece", costIndex: 150, emoji: "🌅", pop: "high", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80", region: "Europe" },
  { cityId: 12, name: "Machu Picchu", country: "Peru", costIndex: 120, emoji: "🏔️", pop: "medium", img: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&q=80", region: "Americas" },
  { cityId: 13, name: "Rome", country: "Italy", costIndex: 145, emoji: "🏛️", pop: "high", img: "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400&q=80", region: "Europe" },
  { cityId: 14, name: "Bangkok", country: "Thailand", costIndex: 80, emoji: "🛕", pop: "high", img: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&q=80", region: "Asia" },
  { cityId: 15, name: "Cape Town", country: "South Africa", costIndex: 95, emoji: "🏔️", pop: "medium", img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&q=80", region: "Africa" },
];

const activities = [
  { activityId: 1, name: "City Walking Tour", type: "sightseeing", cost: 25, duration: 3, icon: "🗺️", description: "Explore the city on foot with a knowledgeable guide" },
  { activityId: 2, name: "Local Food Tour", type: "food", cost: 65, duration: 3, icon: "🍜", description: "Taste the best local dishes across multiple stops" },
  { activityId: 3, name: "Museum Visit", type: "culture", cost: 20, duration: 2, icon: "🏛️", description: "Discover art, history, and culture at world-class museums" },
  { activityId: 4, name: "Cooking Class", type: "food", cost: 80, duration: 4, icon: "👨‍🍳", description: "Learn to cook traditional local dishes" },
  { activityId: 5, name: "Bike Rental Day", type: "adventure", cost: 30, duration: 8, icon: "🚲", description: "Cycle through the city at your own pace" },
  { activityId: 6, name: "Sunset Cruise", type: "sightseeing", cost: 55, duration: 2, icon: "⛵", description: "Watch the sunset from the water" },
  { activityId: 7, name: "Hiking Trail", type: "adventure", cost: 10, duration: 5, icon: "🥾", description: "Scenic trails for all fitness levels" },
  { activityId: 8, name: "Shopping District", type: "leisure", cost: 0, duration: 3, icon: "🛍️", description: "Browse markets, boutiques and malls" },
  { activityId: 9, name: "Night Market", type: "food", cost: 30, duration: 2, icon: "🌙", description: "Sample street food under the stars" },
  { activityId: 10, name: "Spa Day", type: "leisure", cost: 90, duration: 4, icon: "💆", description: "Relax and rejuvenate with traditional treatments" },
  { activityId: 11, name: "Kayaking", type: "adventure", cost: 45, duration: 3, icon: "🚣", description: "Paddle through scenic waterways" },
  { activityId: 12, name: "Photography Tour", type: "culture", cost: 40, duration: 3, icon: "📸", description: "Capture the city's best shots with a photography expert" },
  { activityId: 13, name: "Wine Tasting", type: "food", cost: 70, duration: 2, icon: "🍷", description: "Sample local and international wines" },
  { activityId: 14, name: "Temple/Church Visit", type: "culture", cost: 5, duration: 1, icon: "⛪", description: "Visit iconic religious and historical sites" },
  { activityId: 15, name: "Snorkeling / Diving", type: "adventure", cost: 60, duration: 4, icon: "🤿", description: "Explore underwater worlds" },
];

const seed = async () => {
  await connectDB();

  console.log("🌱  Seeding database...");

  await City.deleteMany({});
  await Activity.deleteMany({});
  await City.insertMany(cities);
  await Activity.insertMany(activities);

  // Create a default admin user (only if not exists)
  // WARNING: Change admin password in production!
  const adminExists = await User.findOne({ email: "admin@traveloop.com" });
  if (!adminExists) {
    await User.create({
      name: "Admin",
      email: "admin@traveloop.com",
      password: "admin123",
      role: "admin",
    });
    console.log("👤  Admin user created: admin@traveloop.com / admin123");
    console.log("⚠️  WARNING: Change admin password in production!");
  }

  console.log(`✅  Seeded ${cities.length} cities, ${activities.length} activities`);
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

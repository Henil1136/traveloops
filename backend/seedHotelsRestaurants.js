require("dotenv").config();
const mongoose   = require("mongoose");
const connectDB  = require("./config/db");
const Hotel      = require("./models/Hotel");
const Restaurant = require("./models/Restaurant");

const HOTELS = [
  { name:"The Ritz Bali",          city:"Bali",      country:"Indonesia", img:"https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80", stars:5, pricePerNight:220, rating:4.9, amenities:["Pool","Spa","Beach","Restaurant"], lat:-8.68, lng:115.17 },
  { name:"Ubud Jungle Retreat",    city:"Bali",      country:"Indonesia", img:"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80", stars:4, pricePerNight:145, rating:4.7, amenities:["Pool","Yoga","Jungle View"],        lat:-8.50, lng:115.26 },
  { name:"Kuta Beach Resort",      city:"Bali",      country:"Indonesia", img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80", stars:4, pricePerNight:89,  rating:4.5, amenities:["Beach","Pool","Bar"],                lat:-8.72, lng:115.17 },
  { name:"Le Meurice Paris",       city:"Paris",     country:"France",    img:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80", stars:5, pricePerNight:520, rating:4.8, amenities:["Fine Dining","Spa","Concierge"],        lat:48.86, lng:2.33  },
  { name:"Hotel Fabric Paris",     city:"Paris",     country:"France",    img:"https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80", stars:4, pricePerNight:195, rating:4.6, amenities:["Bar","Design","Central"],              lat:48.86, lng:2.37  },
  { name:"Generator Paris",        city:"Paris",     country:"France",    img:"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80", stars:3, pricePerNight:75,  rating:4.3, amenities:["Cafe","Social","Budget"],               lat:48.87, lng:2.35  },
  { name:"Oia Suites Santorini",   city:"Santorini", country:"Greece",    img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80", stars:5, pricePerNight:380, rating:4.9, amenities:["Infinity Pool","Sea View","Breakfast"], lat:36.46, lng:25.37 },
  { name:"Kyoto Machiya Inn",      city:"Kyoto",     country:"Japan",     img:"https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&q=80", stars:4, pricePerNight:160, rating:4.6, amenities:["Onsen","Garden","Tea Ceremony"],        lat:35.01, lng:135.77},
  { name:"Dubai Sky Tower",        city:"Dubai",     country:"UAE",       img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", stars:5, pricePerNight:450, rating:4.8, amenities:["Pool","Gym","Sky Bar"],                 lat:25.20, lng:55.27 },
  { name:"Maldives Water Villa",   city:"Maldives",  country:"Maldives",  img:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80", stars:5, pricePerNight:950, rating:5.0, amenities:["Overwater","Private Beach","Snorkeling"],lat:3.20, lng:73.22},
  { name:"NYC Times Sq Hotel",     city:"New York",  country:"USA",       img:"https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80", stars:4, pricePerNight:280, rating:4.5, amenities:["Rooftop Bar","Gym","Concierge"],         lat:40.75, lng:-73.98},
  { name:"Amalfi Cliffside Hotel", city:"Amalfi",    country:"Italy",     img:"https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=600&q=80", stars:5, pricePerNight:340, rating:4.8, amenities:["Sea View","Pool","Terrace"],             lat:40.63, lng:14.60 },
  { name:"Park Hyatt Tokyo",       city:"Tokyo",     country:"Japan",     img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80", stars:5, pricePerNight:480, rating:4.9, amenities:["Pool","Gym","Fine Dining","Spa"],        lat:35.68, lng:139.70},
  { name:"W Barcelona",            city:"Barcelona", country:"Spain",     img:"https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80", stars:5, pricePerNight:310, rating:4.7, amenities:["Rooftop Pool","Beach","Bar"],             lat:41.37, lng:2.19  },
];

const RESTAURANTS = [
  { name:"Locavore",             city:"Bali",     country:"Indonesia",   img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", cuisine:"Modern Indonesian",  priceRange:"$$$",  rating:4.8, specialty:"Farm-to-table tasting menu" },
  { name:"Merah Putih",          city:"Bali",     country:"Indonesia",   img:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", cuisine:"Traditional Balinese", priceRange:"$$",   rating:4.6, specialty:"Authentic Balinese cuisine" },
  { name:"Naughty Nuri's",       city:"Bali",     country:"Indonesia",   img:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", cuisine:"BBQ & Ribs",          priceRange:"$$",   rating:4.5, specialty:"Famous pork ribs & cocktails" },
  { name:"Le Jules Verne",       city:"Paris",    country:"France",      img:"https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=80", cuisine:"French Fine Dining",  priceRange:"$$$$", rating:4.7, specialty:"Eiffel Tower views & classic French" },
  { name:"Septime",              city:"Paris",    country:"France",      img:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80", cuisine:"Neo-Bistro",           priceRange:"$$$",  rating:4.9, specialty:"Seasonal French gastronomy" },
  { name:"L'As du Fallafel",     city:"Paris",    country:"France",      img:"https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80", cuisine:"Middle Eastern",       priceRange:"$",    rating:4.6, specialty:"Best falafel in Paris" },
  { name:"Narisawa",             city:"Tokyo",    country:"Japan",       img:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80", cuisine:"Innovative Japanese",  priceRange:"$$$$", rating:4.9, specialty:"Nature-inspired cuisine" },
  { name:"Ichiran Ramen",        city:"Tokyo",    country:"Japan",       img:"https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80", cuisine:"Japanese Ramen",       priceRange:"$",    rating:4.7, specialty:"Solo ramen booths" },
  { name:"Osteria Francescana",  city:"Modena",   country:"Italy",       img:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", cuisine:"Italian Fine Dining",  priceRange:"$$$$", rating:5.0, specialty:"World's #1 restaurant" },
  { name:"Santorini Sunset Grill",city:"Santorini",country:"Greece",     img:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", cuisine:"Mediterranean",       priceRange:"$$$",  rating:4.8, specialty:"Grilled seafood with caldera views" },
  { name:"Nobu Dubai",           city:"Dubai",    country:"UAE",         img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", cuisine:"Japanese-Peruvian",   priceRange:"$$$$", rating:4.7, specialty:"Black cod miso" },
  { name:"Eleven Madison Park",  city:"New York", country:"USA",         img:"https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=80", cuisine:"American Fine Dining", priceRange:"$$$$", rating:4.9, specialty:"Plant-based tasting menu" },
  { name:"Tickets Barcelona",    city:"Barcelona",country:"Spain",       img:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80", cuisine:"Creative Tapas",       priceRange:"$$$",  rating:4.8, specialty:"Albert Adrià's avant-garde tapas" },
];

async function seed() {
  await connectDB();
  console.log("🌱 Seeding hotels and restaurants…");

  await Hotel.deleteMany({});
  await Restaurant.deleteMany({});

  const hotels = await Hotel.insertMany(HOTELS);
  const rests  = await Restaurant.insertMany(RESTAURANTS);

  console.log(`✅  Inserted ${hotels.length} hotels`);
  console.log(`✅  Inserted ${rests.length} restaurants`);
  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch(err => { console.error(err); process.exit(1); });

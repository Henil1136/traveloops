// Centralized API service — all fetch calls go through here
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("traveloops_token");

const headers = (extra = {}) => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

async function request(method, path, body, signal) {
  const opts = { method, headers: headers(), signal };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Auth ────────────────────────────────────────────────────────
export const authAPI = {
  register: (b) => request("POST", "/auth/register", b),
  login:    (b) => request("POST", "/auth/login", b),
  me:       ()  => request("GET",  "/auth/me"),
  update:   (b) => request("PUT",  "/auth/profile", b),
};

// ── Trips ───────────────────────────────────────────────────────
export const tripsAPI = {
  list:    ()    => request("GET",    "/trips"),
  get:     (id)  => request("GET",    `/trips/${id}`),
  create:  (b)   => request("POST",   "/trips", b),
  update:  (id,b)=> request("PUT",    `/trips/${id}`, b),
  delete:  (id)  => request("DELETE", `/trips/${id}`),
  share:   (id)  => request("POST",   `/trips/${id}/share`),
  unshare: (id)  => request("POST",   `/trips/${id}/unshare`),
  // checklist
  addItem: (id,b)=> request("POST",   `/trips/${id}/checklist`, b),
  toggleItem:(id,iid,b)=>request("PUT",`/trips/${id}/checklist/${iid}`,b),
  resetChecklist:(id)=>request("PUT",  `/trips/${id}/checklist/reset`,{}),
};

// ── Catalog ─────────────────────────────────────────────────────
export const catalogAPI = {
  cities:   (q="") => request("GET", `/cities?search=${encodeURIComponent(q)}&limit=30`),
  city:     (id)   => request("GET", `/cities/${id}`),
  activities:(q="")=> request("GET", `/activities?search=${encodeURIComponent(q)}&limit=50`),
};

// ── Bookings ─────────────────────────────────────────────────────
export const bookingsAPI = {
  create: (payload) => request("POST", "/bookings", payload),
  mine:   ()        => request("GET",  "/bookings/me"),
  get:    (id)      => request("GET",  `/bookings/${id}`),
  cancel: (id)      => request("PUT",  `/bookings/${id}/cancel`),
};

// ── Hotels ──────────────────────────────────────────────────────
export const hotelsAPI = {
  list: ({ city = "", search = "", limit = 20, page = 1 } = {}, signal) => {
    const params = new URLSearchParams();
    if (city)   params.set("city",   city);
    if (search) params.set("search", search);
    params.set("limit", limit);
    params.set("page",  page);
    return request("GET", `/hotels?${params}`, null, signal);
  },
  get: (id) => request("GET", `/hotels/${id}`),
};

// ── Restaurants ─────────────────────────────────────────────────
export const restaurantsAPI = {
  list: ({ city = "", search = "", limit = 20, page = 1 } = {}, signal) => {
    const params = new URLSearchParams();
    if (city)   params.set("city",   city);
    if (search) params.set("search", search);
    params.set("limit", limit);
    params.set("page",  page);
    return request("GET", `/restaurants?${params}`, null, signal);
  },
  get: (id) => request("GET", `/restaurants/${id}`),
};

// ── OpenTripMap — free, no key required for basic use ───────────
// We proxy through our backend or call directly for hotels/restaurants
// Using Overpass API for POI data (truly free, no key)
export const poiAPI = {
  // search hotels via Nominatim (OSM) — free, no key
  searchHotels: async (city) => {
    const url = `https://nominatim.openstreetmap.org/search?q=hotel+${encodeURIComponent(city)}&format=json&limit=12&addressdetails=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    return res.json();
  },
  // search restaurants via Nominatim
  searchRestaurants: async (city) => {
    const url = `https://nominatim.openstreetmap.org/search?q=restaurant+${encodeURIComponent(city)}&format=json&limit=12&addressdetails=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    return res.json();
  },
  // search attractions
  searchAttractions: async (city) => {
    const url = `https://nominatim.openstreetmap.org/search?q=attraction+${encodeURIComponent(city)}&format=json&limit=12&addressdetails=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    return res.json();
  },
  // Global search — search anything across all types
  globalSearch: async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    return res.json();
  },
};

// ── Static curated data (fallback + enrichment) ─────────────────
export const CURATED_HOTELS = [
  { id:"h1", name:"The Ritz Bali",         city:"Bali",      country:"Indonesia", img:"https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80", stars:5, pricePerNight:220, rating:4.9, amenities:["Pool","Spa","Beach","Restaurant"], lat:-8.68, lng:115.17 },
  { id:"h2", name:"Ubud Jungle Retreat",   city:"Bali",      country:"Indonesia", img:"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80", stars:4, pricePerNight:145, rating:4.7, amenities:["Pool","Yoga","Jungle View"],        lat:-8.50, lng:115.26 },
  { id:"h3", name:"Kuta Beach Resort",     city:"Bali",      country:"Indonesia", img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80", stars:4, pricePerNight:89,  rating:4.5, amenities:["Beach","Pool","Bar"],                lat:-8.72, lng:115.17 },
  { id:"h4", name:"Le Meurice Paris",      city:"Paris",     country:"France",    img:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80", stars:5, pricePerNight:520, rating:4.8, amenities:["Fine Dining","Spa","Concierge"],        lat:48.86, lng:2.33  },
  { id:"h5", name:"Hotel Fabric Paris",    city:"Paris",     country:"France",    img:"https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80", stars:4, pricePerNight:195, rating:4.6, amenities:["Bar","Design","Central"],              lat:48.86, lng:2.37  },
  { id:"h6", name:"Generator Paris",       city:"Paris",     country:"France",    img:"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80", stars:3, pricePerNight:75,  rating:4.3, amenities:["Cafe","Social","Budget"],               lat:48.87, lng:2.35  },
  { id:"h7", name:"Oia Suites Santorini",  city:"Santorini", country:"Greece",    img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80", stars:5, pricePerNight:380, rating:4.9, amenities:["Infinity Pool","Sea View","Breakfast"], lat:36.46, lng:25.37 },
  { id:"h8", name:"Kyoto Machiya Inn",     city:"Kyoto",     country:"Japan",     img:"https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&q=80", stars:4, pricePerNight:160, rating:4.6, amenities:["Onsen","Garden","Tea Ceremony"],        lat:35.01, lng:135.77},
  { id:"h9", name:"Dubai Sky Tower",       city:"Dubai",     country:"UAE",       img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", stars:5, pricePerNight:450, rating:4.8, amenities:["Pool","Gym","Sky Bar"],                 lat:25.20, lng:55.27 },
  { id:"h10",name:"Maldives Water Villa",  city:"Maldives",  country:"Maldives",  img:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80", stars:5, pricePerNight:950, rating:5.0, amenities:["Overwater","Private Beach","Snorkeling"],lat:3.20, lng:73.22},
  { id:"h11",name:"NYC Times Sq Hotel",    city:"New York",  country:"USA",       img:"https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80", stars:4, pricePerNight:280, rating:4.5, amenities:["Rooftop Bar","Gym","Concierge"],         lat:40.75, lng:-73.98},
  { id:"h12",name:"Amalfi Cliffside Hotel",city:"Amalfi",    country:"Italy",     img:"https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=600&q=80", stars:5, pricePerNight:340, rating:4.8, amenities:["Sea View","Pool","Terrace"],             lat:40.63, lng:14.60 },
];

export const CURATED_RESTAURANTS = [
  { id:"r1", name:"Locavore",              city:"Bali",      country:"Indonesia", img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", cuisine:"Modern Indonesian", priceRange:"$$$", rating:4.8, specialty:"Farm-to-table tasting menu" },
  { id:"r2", name:"Merah Putih",           city:"Bali",      country:"Indonesia", img:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", cuisine:"Traditional Balinese",priceRange:"$$",  rating:4.6, specialty:"Authentic Balinese cuisine" },
  { id:"r3", name:"Naughty Nuri's",        city:"Bali",      country:"Indonesia", img:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", cuisine:"BBQ & Ribs",        priceRange:"$$",  rating:4.5, specialty:"Famous pork ribs & cocktails" },
  { id:"r4", name:"Le Jules Verne",        city:"Paris",     country:"France",    img:"https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=80", cuisine:"French Fine Dining", priceRange:"$$$$",rating:4.7, specialty:"Eiffel Tower views" },
  { id:"r5", name:"Septime",               city:"Paris",     country:"France",    img:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80", cuisine:"Neo-Bistro",         priceRange:"$$$", rating:4.9, specialty:"Seasonal French gastronomy" },
  { id:"r6", name:"L'As du Fallafel",      city:"Paris",     country:"France",    img:"https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80", cuisine:"Middle Eastern",     priceRange:"$",   rating:4.6, specialty:"Best falafel in Paris" },
  { id:"r7", name:"Narisawa",              city:"Tokyo",     country:"Japan",     img:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80", cuisine:"Innovative Japanese", priceRange:"$$$$",rating:4.9, specialty:"Nature-inspired cuisine" },
  { id:"r8", name:"Osteria Francescana",   city:"Modena",    country:"Italy",     img:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", cuisine:"Italian Fine Dining", priceRange:"$$$$",rating:5.0, specialty:"World's #1 restaurant" },
  { id:"r9", name:"Nobu Dubai",            city:"Dubai",     country:"UAE",       img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", cuisine:"Japanese-Peruvian",  priceRange:"$$$$",rating:4.7, specialty:"Black cod miso" },
  { id:"r10",name:"Santorini Sunset Grill",city:"Santorini", country:"Greece",    img:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", cuisine:"Mediterranean",      priceRange:"$$$", rating:4.8, specialty:"Grilled seafood with caldera views" },
  { id:"r11",name:"Ichiran Ramen",         city:"Tokyo",     country:"Japan",     img:"https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80", cuisine:"Japanese Ramen",     priceRange:"$",   rating:4.7, specialty:"Solo ramen booths" },
  { id:"r12",name:"Eleven Madison Park",   city:"New York",  country:"USA",       img:"https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=80", cuisine:"American Fine Dining",priceRange:"$$$$",rating:4.9, specialty:"Plant-based tasting menu" },
];

export const CURATED_CITIES = [
  { id:"c1",  name:"Bali",       country:"Indonesia", region:"Asia",        img:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", tag:"Popular",  costIndex:90,  hotels:412, spots:890, desc:"Tropical paradise with temples, rice terraces & world-class beaches" },
  { id:"c2",  name:"Paris",      country:"France",    region:"Europe",      img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80", tag:"Classic",  costIndex:180, hotels:980, spots:1200,desc:"The city of love, art, fashion and unforgettable cuisine" },
  { id:"c3",  name:"Santorini",  country:"Greece",    region:"Europe",      img:"https://images.unsplash.com/photo-1549693578-d683be217e58?w=600&q=80", tag:"Trending", costIndex:200, hotels:198, spots:340, desc:"Iconic white-washed cliffs, blue domes and stunning sunsets" },
  { id:"c4",  name:"Kyoto",      country:"Japan",     region:"Asia",        img:"https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&q=80", tag:"Cultural", costIndex:120, hotels:320, spots:660, desc:"Ancient temples, traditional geishas and serene bamboo forests" },
  { id:"c5",  name:"Dubai",      country:"UAE",       region:"Middle East", img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", tag:"Luxury",   costIndex:200, hotels:980, spots:1200,desc:"Futuristic skyline, luxury shopping and desert adventures" },
  { id:"c6",  name:"Maldives",   country:"Maldives",  region:"Asia",        img:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80", tag:"Beach",    costIndex:450, hotels:150, spots:210, desc:"Crystal clear waters, overwater bungalows and coral reefs" },
  { id:"c7",  name:"New York",   country:"USA",       region:"Americas",    img:"https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80", tag:"City",     costIndex:220, hotels:1500,spots:2000,desc:"The city that never sleeps — culture, food and endless energy" },
  { id:"c8",  name:"Amalfi",     country:"Italy",     region:"Europe",      img:"https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=600&q=80", tag:"Scenic",   costIndex:170, hotels:280, spots:420, desc:"Dramatic coastal cliffs, colourful villages and authentic Italian life" },
  { id:"c9",  name:"Tokyo",      country:"Japan",     region:"Asia",        img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80", tag:"Trending", costIndex:160, hotels:900, spots:1800,desc:"Neon streets, ancient shrines, ramen and cherry blossoms" },
  { id:"c10", name:"Barcelona",  country:"Spain",     region:"Europe",      img:"https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80", tag:"Vibrant",  costIndex:130, hotels:620, spots:980, desc:"Gaudí's masterpieces, vibrant nightlife and Mediterranean beaches" },
  { id:"c11", name:"Prague",     country:"Czechia",   region:"Europe",      img:"https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&q=80", tag:"Historic", costIndex:100, hotels:380, spots:560, desc:"Fairy-tale castles, cobblestone streets and cheap, great beer" },
  { id:"c12", name:"Cape Town",  country:"South Africa",region:"Africa",    img:"https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80", tag:"Adventure",costIndex:95,  hotels:290, spots:440, desc:"Table Mountain, penguins, wine estates and beach culture" },
];

export const ACTIVITIES_LIST = [
  { id:"a1", name:"City Walking Tour",  type:"sightseeing", cost:25,  duration:3, icon:"🗺️", desc:"Explore on foot with a knowledgeable guide" },
  { id:"a2", name:"Local Food Tour",    type:"food",        cost:65,  duration:3, icon:"🍜", desc:"Taste the best local dishes across multiple stops" },
  { id:"a3", name:"Museum Visit",       type:"culture",     cost:20,  duration:2, icon:"🏛️", desc:"Discover art, history and culture" },
  { id:"a4", name:"Cooking Class",      type:"food",        cost:80,  duration:4, icon:"👨‍🍳", desc:"Learn to cook traditional local dishes" },
  { id:"a5", name:"Bike Rental Day",    type:"adventure",   cost:30,  duration:8, icon:"🚲", desc:"Cycle through the city at your own pace" },
  { id:"a6", name:"Sunset Cruise",      type:"sightseeing", cost:55,  duration:2, icon:"⛵", desc:"Watch the sunset from the water" },
  { id:"a7", name:"Hiking Trail",       type:"adventure",   cost:10,  duration:5, icon:"🥾", desc:"Scenic trails for all fitness levels" },
  { id:"a8", name:"Night Market",       type:"food",        cost:30,  duration:2, icon:"🌙", desc:"Sample street food under the stars" },
  { id:"a9", name:"Spa Day",            type:"leisure",     cost:90,  duration:4, icon:"💆", desc:"Relax with traditional treatments" },
  { id:"a10",name:"Kayaking",           type:"adventure",   cost:45,  duration:3, icon:"🚣", desc:"Paddle through scenic waterways" },
  { id:"a11",name:"Photography Tour",   type:"culture",     cost:40,  duration:3, icon:"📸", desc:"Capture the city's best shots" },
  { id:"a12",name:"Wine Tasting",       type:"food",        cost:70,  duration:2, icon:"🍷", desc:"Sample local and international wines" },
  { id:"a13",name:"Snorkeling",         type:"adventure",   cost:60,  duration:4, icon:"🤿", desc:"Explore underwater worlds" },
  { id:"a14",name:"Temple Visit",       type:"culture",     cost:5,   duration:2, icon:"⛪", desc:"Visit iconic religious and historical sites" },
  { id:"a15",name:"Shopping Tour",      type:"leisure",     cost:0,   duration:3, icon:"🛍️", desc:"Browse markets, boutiques and malls" },
];

// ── AI Planner (proxied through backend) ─────────────────────────
export const AI_PLANNER_API = {
  stream: async (prompt, signal) => {
    const res = await fetch(`${BASE}/ai/plan`, {
      method: "POST",
      headers: headers(),
      signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `API error ${res.status}`);
    }
    return res;
  },
};

export const PACKING_DEFAULTS = [
  { id:"p1",  item:"Passport",             cat:"documents",   packed:false },
  { id:"p2",  item:"Travel insurance",     cat:"documents",   packed:false },
  { id:"p3",  item:"Flight tickets",       cat:"documents",   packed:false },
  { id:"p4",  item:"Hotel confirmations",  cat:"documents",   packed:false },
  { id:"p5",  item:"T-shirts (5)",         cat:"clothing",    packed:false },
  { id:"p6",  item:"Pants (3)",            cat:"clothing",    packed:false },
  { id:"p7",  item:"Comfortable shoes",    cat:"clothing",    packed:false },
  { id:"p8",  item:"Rain jacket",          cat:"clothing",    packed:false },
  { id:"p9",  item:"Phone charger",        cat:"electronics", packed:false },
  { id:"p10", item:"Power adapter",        cat:"electronics", packed:false },
  { id:"p11", item:"Earbuds",              cat:"electronics", packed:false },
  { id:"p12", item:"Sunscreen",            cat:"toiletries",  packed:false },
  { id:"p13", item:"Toothbrush",           cat:"toiletries",  packed:false },
  { id:"p14", item:"First aid kit",        cat:"toiletries",  packed:false },
  { id:"p15", item:"Travel pillow",        cat:"misc",        packed:false },
  { id:"p16", item:"Reusable water bottle",cat:"misc",        packed:false },
];

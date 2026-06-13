# ✈️ Traveloops — Full-Stack Travel Planning Platform

> Hotels, restaurants, experiences & day plans — add to cart, book together, track your budget.

---

## 📁 Folder Structure

```
traveloops/
├── frontend/                   # React + Vite
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── common/         # Reusable UI: Toast, SearchBar, CartButton, FilterPills
│       │   └── layout/         # Navbar
│       ├── constants/
│       │   └── theme.js        # Design tokens, shared styles
│       ├── context/
│       │   ├── AppContext.jsx   # Screen/navigation state
│       │   ├── AuthContext.jsx  # JWT auth state
│       │   └── CartContext.jsx  # Cart state (localStorage)
│       ├── hooks/              # Custom hooks (extendable)
│       ├── pages/
│       │   ├── HomePage.jsx    # Hero, global search, destinations, hotels, restaurants
│       │   ├── ExplorePage.jsx # City grid → city detail (hotels/restaurants/activities/spots)
│       │   ├── HotelsPage.jsx  # Full hotels listing with filters
│       │   ├── RestaurantsPage.jsx # Full restaurants listing with filters
│       │   ├── TripsPage.jsx   # My trips + itinerary builder + budget + packing + notes
│       │   ├── CartPage.jsx    # Flipkart-style cart with order summary + booking
│       │   ├── AuthPage.jsx    # Split-screen login/signup
│       │   ├── ProfilePage.jsx # User profile & settings
│       │   └── AdminPage.jsx   # Admin dashboard
│       ├── services/
│       │   └── api.js          # All API calls + curated static data
│       ├── utils/
│       │   └── helpers.js      # fmt, fmtD, days, makeCartId, debounce
│       ├── App.jsx             # Root — providers + router
│       ├── main.jsx
│       └── index.css
│
└── backend/                    # Node.js + Express + MongoDB
    ├── config/
    │   └── db.js               # Mongoose connection
    ├── controllers/
    │   ├── authController.js
    │   ├── tripController.js
    │   ├── cityActivityController.js
    │   └── adminController.js
    ├── middleware/
    │   ├── auth.js             # JWT verify middleware
    │   └── errorHandler.js
    ├── models/
    │   ├── User.js
    │   ├── Trip.js
    │   ├── City.js
    │   ├── Activity.js
    │   ├── Hotel.js            # ← new
    │   ├── Restaurant.js       # ← new
    │   └── CartItem.js         # ← new
    ├── routes/
    │   ├── auth.js             # POST /register /login GET /me
    │   ├── trips.js            # CRUD /trips
    │   ├── catalog.js          # GET /cities /activities
    │   ├── hotels.js           # GET/POST /hotels
    │   ├── restaurants.js      # GET/POST /restaurants
    │   ├── cart.js             # CRUD /cart (auth required)
    │   ├── admin.js
    │   └── shared.js
    ├── seed.js                 # Seed cities + activities
    ├── seedHotelsRestaurants.js # Seed hotels + restaurants ← new
    ├── server.js
    └── .env.example
```

---

## 🚀 Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI (or local MongoDB)

### Backend

```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env

npm install
npm run seed          # seed cities + activities
node seedHotelsRestaurants.js   # seed hotels + restaurants
npm run dev           # runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev           # runs on http://localhost:5173
```

---

## 🔑 Key Features

| Feature | Description |
|---|---|
| **Global Search** | Search hotels, restaurants, cities & activities from the homepage |
| **Explore** | Browse 12+ cities, dive into hotels/restaurants/activities per city |
| **Trip Builder** | Create trips, add cities, set days, add activities with cost tracking |
| **Trip Cart** | Flipkart-style cart — add hotels, restaurants, activities, see live total |
| **Budget Calculator** | Accurate breakdown: activities, transport, stay, meals — vs your budget |
| **Packing Checklist** | Category-based checklist with progress bar |
| **Trip Notes** | Per-city journal entries |
| **Real Data** | Nominatim/OpenStreetMap for live POI search, curated 14-hotel/13-restaurant dataset |
| **Auth** | JWT-based login/signup, works offline in demo mode |

---

## 🔌 APIs Used

- **Nominatim (OpenStreetMap)** — free, no key — global POI search in Explore spots tab
- **Unsplash** — destination photography (CDN URLs, no key needed)
- **Own backend** — MongoDB Atlas for trips, auth, cart, hotels, restaurants

---

## 🎨 Design System

- **Primary:** `#1a9bb5` (sky blue) — Song-Kol / Travely inspired
- **Font Headings:** Cormorant Garamond (editorial serif)
- **Font Body:** Inter
- **Style:** Full-bleed photography heroes, white cards, teal accents, Song-Kol reference UI

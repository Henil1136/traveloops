# ✈️ Traveloops — Full-Stack Travel Planning App

A full-stack travel planning experience built with React, Vite, Node.js, Express, and MongoDB.

Users can browse cities, hotels, restaurants, and activities, build trips, manage budgets and cart items, and authenticate with JWT.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Notes](#notes)

---

## Features

- User registration and login with JWT authentication
- Browse destinations, hotels, restaurants, and activities
- Add items to a cart and view live order totals
- Build trips with itinerary days, budget tracking, packing checklist, and notes
- Search and filter travel recommendations
- Admin catalog routes for managing hotels, restaurants, and trips
- Backend data seeding for cities, activities, hotels, and restaurants
- Reusable frontend components and global state with Context API

---

## Tech Stack

- Frontend: React 18, Vite, Context API, custom hooks
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT middleware
- Testing: Vitest (frontend)

---

## Project Structure

```
traveloops-upgraded/
├── backend/                    # API server and database models
│   ├── config/                 # MongoDB connection
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Auth, validation, and error handling
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API routes
│   ├── seed.js                 # Seed cities and activities
│   ├── seedHotelsRestaurants.js# Seed hotels and restaurants
│   ├── server.js               # API entrypoint
│   └── .env.example            # Example environment variables
├── frontend/                   # React app and UI
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # App/Auth/Cart state
│   │   ├── pages/              # Route views
│   │   ├── services/           # API client
│   │   └── utils/              # Helper functions
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json                # Root scripts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB Atlas URI or local MongoDB instance

---

## Backend Setup

1. Open a terminal and go to the backend folder:

```powershell
cd "C:\Users\DELL\Downloads\traveloops-upgraded-again (2)\traveloops-upgraded\backend"
```

2. Install dependencies:

```powershell
npm install
```

3. Create environment variables:

```powershell
copy .env.example .env
```

4. Open `.env` and set your MongoDB URI and JWT secret.

5. Seed the database:

```powershell
npm run seed
node seedHotelsRestaurants.js
```

6. Start the backend server:

```powershell
npm run dev
```

The backend runs at `http://localhost:5000`.

---

## Frontend Setup

1. Open a new terminal and go to the frontend folder:

```powershell
cd "C:\Users\DELL\Downloads\traveloops-upgraded-again (2)\traveloops-upgraded\frontend"
```

2. Install dependencies:

```powershell
npm install
```

3. Start the frontend app:

```powershell
npm run dev
```

The frontend runs at `http://localhost:5173`.

---

## Available Scripts

### Root

- `npm run install:all` — install dependencies in root, backend, and frontend
- `npm run dev` — start backend and frontend together with `concurrently`
- `npm run build` — build the frontend production bundle
- `npm run seed` — run the backend seed script
- `npm start` — start the backend server

### Frontend

- `npm run dev` — start Vite dev server
- `npm run build` — create a production build
- `npm run preview` — preview the production build
- `npm run test` — run frontend tests with Vitest

---

## API Overview

Key backend routes include:

- `POST /api/auth/register` — register a user
- `POST /api/auth/login` — authenticate and receive JWT
- `GET /api/auth/me` — get current user profile
- `GET /api/catalog/cities` — list city destinations
- `GET /api/catalog/activities` — list activities
- `GET /api/hotels` — fetch hotels
- `GET /api/restaurants` — fetch restaurants
- `GET /api/trips` — list user trips
- `POST /api/cart` — add or update cart items

---

## Notes

- Be sure to fill in `backend/.env` with your MongoDB credentials and JWT secret.
- Run backend and frontend servers separately for full local development.
- If you want to keep the old GitHub history, the `backup-origin-main` branch was created during the push.

---

## Author

Built by Henil with a full-stack travel planning experience using React, Node.js, Express, and MongoDB.

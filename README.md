# TravelBuddy

TravelBuddy is a MERN travel companion matching app for students and public travelers. A user creates a trip with an arrival location, date, and approximate arrival time. The app finds other people reaching the same place around the same time, then hides phone numbers until both sides explicitly choose to connect.

## Problem Statement

People often post messages like "Anyone reaching the station around 8 PM?" in WhatsApp or college groups. That is clumsy, noisy, and exposes contact details too early. TravelBuddy turns that into a safer, cleaner flow:

- Create a trip once.
- Share a single link.
- Let matching happen automatically.
- Reveal contact details only after mutual interest.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: Google sign-in verified on the backend + JWT httpOnly cookie
- Locations: Leaflet + OpenStreetMap map pins on the frontend, with local suggestion fallback for saved trip names
- Images: Google profile photo by default, optional Cloudinary upload for profile images
- AI: OpenAI Responses API with a fallback helper if the API is unavailable

## Features

- Google sign-in
- Profile completion with required mobile number
- Trip creation with arrival location, destination, date, time, and matching window
- Automatic trip matching by date, arrival area, and time closeness
- Mutual connect system that gates phone-number reveal
- Shareable trip links
- Empty-state prompting to share the trip link when no matches exist
- Manual trip status: `waiting`, `matched`, `done`
- Report-user flow
- Trip creation rate limit: max 5 trips per user per day
- AI Travel Assistant for meeting point, fare estimate, and delay advice

## Project Structure

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/

frontend/
  src/
    components/
    context/
    hooks/
    pages/
    utils/
```

## Environment Variables

### Backend: [backend/.env.example](/C:/Users/Vaibhav%20Dhanraj/Desktop/GoGather/backend/.env.example)

```env
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travelbuddy
JWT_SECRET=replace-with-a-long-random-secret
JWT_TIMEOUT=7d
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
OPENAI_API_KEY=<SECRET>
OPENAI_MODEL=gpt-5.4-mini
```

### Frontend: [frontend/.env.example](/C:/Users/Vaibhav%20Dhanraj/Desktop/GoGather/frontend/.env.example)

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-upload-preset
```

## Local Setup

1. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Add environment files:

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`

3. Start the backend:

```bash
cd backend
npm run dev
```

4. Start the frontend:

```bash
cd frontend
npm run dev
```

5. Open `http://localhost:5173`

## API Overview

- `POST /api/auth/google`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `POST /api/auth/logout`
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:tripId`
- `GET /api/trips/:tripId/matches`
- `PATCH /api/trips/:tripId/status`
- `GET /api/trips/share/:shareCode`
- `POST /api/connections`
- `GET /api/connections/notifications`
- `POST /api/reports`
- `GET /api/locations/suggestions`
- `POST /api/ai-assist`

## How The Matching Algorithm Works

Plain-language version for interviews:

1. When a user opens a trip, the backend first fetches other trips on the same date.
2. It removes the current user's own trips.
3. It compares arrival locations.
   If both trips have coordinates, it treats them as a match when they are within a small radius of about 3 km.
   If coordinates are missing, it falls back to a normalized text comparison of the arrival location name.
4. It compares arrival times in minutes.
5. Two trips match only if the time gap is inside the stricter of the two users' match windows.
6. The results are sorted by smallest time difference first, so the closest arrival times show up at the top.

## How The Mutual-Connect Safety System Works

1. A match card shows traveler identity basics like name, photo, and arrival timing.
2. Phone numbers are hidden by default.
3. When User A taps Connect on User B, the backend creates or updates a connection record for that pair of trips.
4. The connection stores which users have requested contact.
5. When User B also taps Connect back, the connection status becomes `mutual`.
6. Only in the `mutual` state does the frontend receive the other user's phone number.

This is a deliberate safety choice: it reduces random scraping of personal numbers by people who merely browse match lists.

## AI Assistant Design

The AI endpoint is `POST /api/ai-assist`. It is server-side only and never exposes the OpenAI key to the frontend.

The backend sends:

- `instructions`: a system prompt telling the model to act as the TravelBuddy AI Travel Assistant, stay practical, keep answers concise, avoid inventing exact station infrastructure, and include a meeting-point suggestion, fare note, and safety advice.
- `input`: a structured text block containing:
  - Arrival location
  - Destination
  - Travel date
  - Arrival time
  - Matching window
  - Estimated distance if coordinates are available
  - The user's question
  - A final instruction to answer with sections titled `Meeting point`, `Fare`, and `Advice`

Current model default:

- `gpt-5.4-mini`

Reason for that choice:

- OpenAI's current model docs recommend `GPT-5.5` as the flagship starting point, and `GPT-5.4 mini` for lower-latency, lower-cost workloads. TravelBuddy's assistant is short-form, fast, and cost-sensitive, so `gpt-5.4-mini` is the better default for this project. Sources: https://developers.openai.com/api/docs/models and https://developers.openai.com/api/docs/guides/text

If the OpenAI call fails, the backend returns a graceful fallback answer built from simple heuristics so the UI never goes blank.

## Design Decisions

- Phone numbers are gated behind mutual connect because that is the main trust and safety control in the product. It gives users a way to express interest without exposing their number to every viewer.
- The shareable trip link exists because it is the strongest growth loop. A user can drop a link into a WhatsApp or college group instead of repeatedly typing the same travel request.

## Notes On Link Previews

The app sets basic Open Graph tags and updates page metadata on the public share page. For truly dynamic per-trip preview cards on platforms like WhatsApp, you would usually add SSR, prerendering, or a server-rendered share endpoint in deployment.

## Verification Done

- Backend JavaScript syntax checked with `node --check`
- Frontend production build passed with `npm run build`
- Frontend lint passed with `npm run lint`

## Assumptions To Double-Check Before Demoing

- Google Cloud OAuth is configured with the same client ID used by both frontend and backend.
- Leaflet maps use OpenStreetMap tiles, so trip coordinates appear only when users pin them during trip creation.
- Cloudinary unsigned upload preset is configured if you want profile image uploads in the demo.
- MongoDB Atlas network access and connection string are valid.
- Public share-link previews are basic metadata only, not full server-rendered dynamic cards.
- Fare estimates are rough and should be presented as guidance, not exact pricing.

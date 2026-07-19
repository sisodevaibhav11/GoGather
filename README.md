# GoGather

GoGather is a MERN trip-matching app for students and public travelers. A user creates an arrival plan, shares one link, and gets matched with people reaching the same place around the same time. Contact details stay hidden until both sides choose to connect.

## What It Does

- Google sign-in with backend verification
- Profile completion with mobile number gating
- Trip creation with arrival location, destination, date, time, and matching window
- Automatic matching based on date, arrival area, and time closeness
- Mutual connect flow before phone numbers are revealed
- Shareable public trip links
- Reporting flow for safety
- AI travel assistant for coordination, delays, and fare guidance

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: Google OAuth + JWT cookie
- Maps and location lookup: OpenStreetMap
- AI: OpenAI Responses API with a fallback helper

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
  public/
  src/
    components/
    context/
    hooks/
    pages/
    utils/
```

## Environment Variables

### Backend

```env
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gogather
JWT_SECRET=replace-with-a-long-random-secret
JWT_TIMEOUT=7d
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5.4-mini
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-upload-preset
```

## Local Setup

1. Install dependencies in `backend/` and `frontend/`.
2. Copy each `.env.example` file to `.env`.
3. Run `npm run dev` in `backend/`.
4. Run `npm run dev` in `frontend/`.
5. Open `http://localhost:5173`.

## Main API Routes

- `POST /api/auth/google`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `POST /api/auth/logout`
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:tripId`
- `GET /api/trips/:tripId/matches`
- `PATCH /api/trips/:tripId`
- `PATCH /api/trips/:tripId/status`
- `DELETE /api/trips/:tripId`
- `GET /api/trips/share/:shareCode`
- `POST /api/connections`
- `GET /api/connections/notifications`
- `POST /api/reports`
- `GET /api/locations/geocode`
- `POST /api/ai-assist`

## Notes

- The repo was cleaned to use a single active `frontend/` and `backend/` source tree.
- Trip matching is based on date, arrival location proximity or normalized text, and the stricter of two matching windows.
- Phone numbers are revealed only after a mutual connection.

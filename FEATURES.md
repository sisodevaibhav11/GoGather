# GoGather - Complete Feature Documentation

## 🎯 Project Overview

GoGather is a **MERN travel-matching application** designed to connect students and travelers heading to the same destinations. The platform uses intelligent matching algorithms and safety-first design principles to facilitate safe, affordable shared journeys.

**Live Demo:** Jun 2026 – Jul 2026  
**Status:** Production-Ready (Resume Version)

---

## ✨ Core Features

### 1. **User Authentication & Profiles**

#### Google OAuth Integration
- Secure Google sign-in via `@react-oauth/google`
- Backend JWT verification using `google-auth-library`
- Automatic profile creation with name, email, and photo

#### Profile Management
- Mobile number requirement (WhatsApp-verified)
- Profile photo upload to Cloudinary CDN
- Edit name, mobile number, and photo anytime
- Profile completion banner on trip creation

**Files:**
- Backend: [authController.js](backend/controllers/authController.js)
- Frontend: [AuthContext.jsx](frontend/src/context/AuthContext.jsx), [LoginPage.jsx](frontend/src/pages/LoginPage.jsx), [ProfilePage.jsx](frontend/src/pages/ProfilePage.jsx)

---

### 2. **Trip Creation & Management**

#### Trip Creation Form
- **Arrival Location:** City/station search with Nominatim geocoding
- **Destination:** Optional final destination
- **Travel Details:**
  - Date picker (future dates only)
  - Time input (HH:MM format)
  - Matching window (+/- 30/45/60 minutes)
- **Transport Type:** Airport, Railway, Bus Stand
- **Direction:** Leaving campus or Coming to campus
- **Partners Needed:** 1, 2, 3, or 4 travelers
- **Notes:** Optional coordination message (max 300 chars)

#### Trip Sharing
- **Unique Share Code:** `tb-[timestamp]-[random]` format
- **Public Link:** `/trip/:shareCode` accessible without login
- **Copy-to-Clipboard:** One-click link sharing
- **Pre-Fill:** Shared link pre-populates creation form for matched users

#### Trip Editing & Deletion
- Edit location, date, time, destination, matching window
- Delete trips with confirmation
- Trip status management (waiting → matched → done)

**Matching Algorithm:**
```javascript
const isValidMatch = (tripA, tripB) => {
  // 1. Same travel date (mandatory)
  if (tripA.travelDate !== tripB.travelDate) return false;

  // 2. Same or nearby arrival location (≤3km or text match)
  if (!locationsMatch(tripA.arrivalLocation, tripB.arrivalLocation)) return false;

  // 3. Arrival time within matching window
  const window = Math.min(tripA.matchingWindowMinutes, tripB.matchingWindowMinutes);
  if (Math.abs(tripA.arrivalTimeMinutes - tripB.arrivalTimeMinutes) > window) return false;

  // 4. Optional: Same destination (adds quality)
  if (tripA.destination && tripB.destination && locationsMatch(...)) return true;

  return true;
};
```

**Files:**
- Backend: [tripController.js](backend/controllers/tripController.js), [tripMatching.js](backend/utils/tripMatching.js)
- Frontend: [CreateTripPage.jsx](frontend/src/pages/CreateTripPage.jsx), [TripDetailsPage.jsx](frontend/src/pages/TripDetailsPage.jsx)

---

### 3. **Smart Matching Engine**

#### Automatic Matching
- **Trigger:** When viewing trip details (`/trips/:tripId`)
- **Polling:** Re-calculates matches every 7 seconds
- **Ranking:** Sorted by closest arrival time first
- **Reason Labels:** Shows why travelers match ("same location", "within window", "same destination")

#### Match Card Display
- Traveler profile photo and name
- Arrival time difference label
- Contact info (hidden/revealed based on connection status)
- Match reasons as badges
- Connection status indicator

#### Real-time Notifications
- **Polling-based:** 7-second intervals check for new matches
- **Toast Alerts:** "Connection confirmed. Phone number revealed."
- **Persistent State:** Tracks previous connection states

**Files:**
- Backend: [tripMatching.js](backend/utils/tripMatching.js)
- Frontend: [TripDetailsPage.jsx](frontend/src/pages/TripDetailsPage.jsx)

---

### 4. **Safe Connection Workflow**

#### Mutual Opt-in System
```
User A → Send Request → Pending
User B → Send Request → Mutual (Auto-unlock)
```

**States:**
- **None:** No connection request
- **Pending:** One user requested connection (contact hidden)
- **Mutual:** Both users requested (contact revealed)

#### Contact Protection
- Phone numbers stored in MongoDB encrypted
- **Before mutual:** Contact shows "Hidden until both sides connect"
- **After mutual:** Real phone numbers revealed
- **Backend logic:** [connectionController.js](backend/controllers/connectionController.js)

#### Notification System
- **Filter:** Only show pending requests TO current user (not FROM)
- **Skip Sent Requests:** Hide if current user already sent request
- **Skip Completed Trips:** Filter out done trips
- **Display:** Show requester profile, trip details, action buttons

**Files:**
- Backend: [connectionController.js](backend/controllers/connectionController.js), [connectionModel.js](backend/models/connectionModel.js)
- Frontend: [MatchCard.jsx](frontend/src/components/MatchCard.jsx), [NotificationCard.jsx](frontend/src/components/NotificationCard.jsx)

---

### 5. **AI Travel Assistant**

#### Contextual Travel Advice

Uses OpenAI API to provide:
- **Meeting Point Suggestions:** Safe, visible public zones
- **Fare Estimation:** Based on distance (18-28 ₹/km formula)
- **Safety Tips:** Always meet in busy areas
- **Delay Handling:** Advice for postponements

#### Fallback System
```javascript
// If OpenAI unavailable or times out → Graceful fallback response
const buildFallbackAdvice = ({ trip, question, distanceKm }) => {
  // Returns best-effort suggestion with estimated fare
  return `Best-effort meeting point: ...`;
};
```

#### Starter Questions
- "Suggest a safe meeting point"
- "What should I do if my train is delayed?"
- "Estimate a shared cab fare for this trip"

**Files:**
- Backend: [aiController.js](backend/controllers/aiController.js), [openai.js](backend/config/openai.js)
- Frontend: [AITravelAssistant.jsx](frontend/src/components/AITravelAssistant.jsx)

---

### 6. **User Safety & Reporting**

#### Report System
- Report suspicious users with reason
- Reports include: reporter ID, reported user ID, trip ID, reason
- Stored for admin review and community safety

#### Group Trips (Bonus)
- Create groups for multi-person trips
- Accept/approve group members
- Group member visibility in match cards

**Files:**
- Backend: [reportController.js](backend/controllers/reportController.js), [reportModel.js](backend/models/reportModel.js)
- Frontend: [MatchCard.jsx](frontend/src/components/MatchCard.jsx) (report button)

---

### 7. **Information Pages** ✨ NEW

#### How It Works
- 6-step process explanation
- Key features overview
- Smart matching, privacy, AI, group trips

#### About GoGather
- Mission, vision, values
- Tech stack breakdown
- Contact information

#### Privacy Policy
- Data collection methods
- Phone number privacy guarantees
- Data security measures
- User rights and data retention

#### Terms of Service
- User responsibilities
- Account termination policy
- Prohibited activities
- Dispute resolution

#### Raise an Issue
- Bug reports, feature requests, safety concerns
- Issue type categorization
- Email submission
- FAQ section with common questions

**Files:**
- [HowItWorksPage.jsx](frontend/src/pages/HowItWorksPage.jsx)
- [AboutPage.jsx](frontend/src/pages/AboutPage.jsx)
- [PrivacyPage.jsx](frontend/src/pages/PrivacyPage.jsx)
- [TermsPage.jsx](frontend/src/pages/TermsPage.jsx)
- [RaiseIssuePage.jsx](frontend/src/pages/RaiseIssuePage.jsx)

---

### 8. **Image Management with Cloudinary**

#### Profile Photo Upload
- Direct upload to Cloudinary via unsigned preset
- Returns optimized CDN URL
- No backend file processing needed
- Images stored permanently in Cloudinary

**Flow:**
```
User picks file → Cloudinary upload → Returns secure_url → Saved to DB
```

**Files:**
- Frontend: [ProfilePage.jsx](frontend/src/pages/ProfilePage.jsx)

---

## 📡 API Architecture

### Request Flow
```
Frontend (Axios) 
  ↓
Express Server 
  ↓
Middleware (Auth, Rate Limit, Error Handling)
  ↓
Controllers (Business Logic)
  ↓
MongoDB (Data Persistence)
  ↓
External APIs (OpenAI, Nominatim, Cloudinary)
```

### Key Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/google` | Google sign-in |
| GET | `/api/auth/me` | Current user profile |
| PATCH | `/api/auth/profile` | Update profile |
| POST | `/api/trips` | Create trip |
| GET | `/api/trips` | My trips |
| GET | `/api/trips/:tripId/matches` | Get matches (with polling) |
| POST | `/api/connections` | Request connection |
| GET | `/api/connections/notifications` | Get pending requests |
| POST | `/api/reports` | Report user |
| GET | `/api/locations/geocode?query=...` | Search locations |
| POST | `/api/ai-assist` | Ask AI assistant |

---

## 🛠️ Technology Decisions

### Why Polling Over WebSockets?
- **Simplicity:** Easier to deploy and scale for MVP
- **Sufficient:** 7-second delay acceptable for non-real-time app
- **Cost-effective:** No persistent connections needed
- **Scalability:** Can upgrade to Socket.io later

### Location Matching Strategy
```javascript
// Distance-based (GPS)
distanceKm <= 3km → Match

// Text-based (fallback)
normalizedName(location1) === normalizedName(location2) → Match
```

### Time Matching Algorithm
```javascript
// Arrival time must be within MINIMUM of both travelers' windows
const window = Math.min(tripA.window, tripB.window);
const valid = Math.abs(timeA - timeB) <= window;
```

---

## 📊 Data Models

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  photoUrl: String (Cloudinary CDN),
  mobileNumber: String,
  profileCompleted: Boolean,
  createdAt: Date
}
```

### Trip Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref User),
  arrivalLocation: {
    name: String,
    normalizedName: String,
    coordinates: { lat, lng }
  },
  destination: { ... },
  travelDate: String (YYYY-MM-DD),
  arrivalTime: String (HH:MM),
  arrivalTimeMinutes: Number,
  matchingWindowMinutes: Number (30/45/60),
  transportType: String (airport/railway/bus-stand),
  direction: String (leaving-campus/coming-campus),
  partnersNeeded: Number (1-4),
  note: String (≤300 chars),
  shareCode: String (unique),
  status: String (waiting/matched/done),
  createdAt: Date
}
```

### Connection Model
```javascript
{
  _id: ObjectId,
  pairKey: String (unique, tripA_id:tripB_id),
  tripA: ObjectId (ref Trip),
  tripB: ObjectId (ref Trip),
  userA: ObjectId (ref User),
  userB: ObjectId (ref User),
  requestedBy: [ObjectId], // Users who requested
  status: String (pending/mutual),
  revealedAt: Date,
  createdAt: Date
}
```

---

## 🔐 Security Features

- ✅ **JWT Authentication:** Secure token-based auth
- ✅ **Google OAuth:** Third-party identity verification
- ✅ **Password Hashing:** bcryptjs for any password fields
- ✅ **CORS Protection:** Strict origin validation
- ✅ **Rate Limiting:** Request throttling on sensitive endpoints
- ✅ **Contact Privacy:** Phone numbers hidden by default
- ✅ **User Reporting:** Community safety mechanism
- ✅ **Data Validation:** Sanitization and type checking

---

## 🚀 Deployment

### Frontend (Vercel)
```
yarn run build
Deploy dist/ to Vercel
```

### Backend (Vercel Serverless)
```
Deploy index.js with serverless functions
MongoDB connection string in .env
```

### Environment Validation
- ✅ Production JWT_SECRET
- ✅ MongoDB URI
- ✅ Google OAuth credentials
- ✅ OpenAI API key
- ✅ FRONTEND_URL for CORS

---

## 📱 User Journeys

### Journey 1: New User Posts a Ride
```
1. Visit HomePage → Click "Login with Google"
2. Approve Google sign-in → Redirect to ProfilePage
3. Enter mobile number (required) → Save profile
4. Click "Post a ride" → CreateTripPage
5. Select transport type (Railway/Airport/Bus)
6. Enter locations, date, time
7. Select direction (Leaving/Coming campus)
8. Choose matching window ± 45 min
9. Post ride → Redirected to TripDetailsPage
10. Copy shareable link → Share on social media
```

### Journey 2: Traveler Finds a Match
```
1. Click shared trip link → ShareTripPage (public)
2. See trip details → Click "Create my matching trip"
3. Pre-filled form with same location/date/time
4. Adjust partners needed, transport type → Create
5. Redirected to TripDetailsPage
6. Automatic matching algorithm finds original poster
7. 7-second polling shows new match (MatchCard)
8. Click "Connect" → Connection request sent
9. Wait for mutual connection → Phone revealed
10. Call/message to coordinate meeting point
```

### Journey 3: AI Travel Assistance
```
1. User on TripDetailsPage
2. Scroll to "AI travel assistant" section
3. Click "Suggest a safe meeting point"
4. Backend: Calls OpenAI with trip context
5. Returns: Meeting point, fare estimate, safety tip
6. If OpenAI unavailable → Fallback helper
7. Display contextual advice to user
```

---

## 🎓 Resume Highlights

### Technical Skills Demonstrated
- **MERN Stack:** Full-stack web development
- **Real-time Systems:** Polling-based updates, state management
- **API Design:** RESTful endpoints with proper status codes
- **Database Design:** MongoDB schema modeling, Mongoose ORM
- **Authentication:** Google OAuth, JWT, secure session handling
- **Matching Algorithms:** Location proximity, time-based matching
- **Error Handling:** Graceful fallbacks, user-friendly messages
- **UI/UX:** Responsive design, accessibility, loading states
- **DevOps:** Environment management, deployment to Vercel

### Problem-Solving Examples
1. **Privacy Implementation:** Dual-sided connection opt-in
2. **Fallback System:** AI assistant with graceful degradation
3. **Matching Intelligence:** Multi-criteria ranking algorithm
4. **Performance:** 7-second polling vs. real-time WebSockets

---

## 📝 Resume Line

> **GoGather** | MERN Travel-Matching App | Jun 2026 – Jul 2026
>
> **Trip Creation & Matching Engine:** Built end-to-end trip creation flow with shareable links and intelligent matching algorithm ranking users by location proximity, travel date, and arrival-time tolerance.
>
> **Safe Connection Workflow:** Designed mutual opt-in connection system that hides phone numbers until both users consent, with real-time notifications, trip-status tracking, and user-reporting for community safety.
>
> **AI Travel Assistant:** Integrated OpenAI API for contextual travel advice, meeting-point suggestions, and fare guidance, including graceful fallback response for API downtime.

---

## 🔗 Quick Links

- [Project Repository](#)
- [Live Demo](#)
- [Backend API Docs](#)
- [Frontend Component Guide](#)

---

**Created with ❤️ for safe, affordable, connected travel.**

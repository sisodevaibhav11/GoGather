# GoGather - Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account or local MongoDB
- Google OAuth credentials
- Cloudinary account (optional, for image uploads)
- OpenAI API key (optional, for AI features)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Update .env with your credentials:
# MONGODB_URI=mongodb+srv://...
# JWT_SECRET=your-secret-key
# GOOGLE_CLIENT_ID=your-client-id
# OPENAI_API_KEY=your-key
# FRONTEND_URL=http://localhost:5173

# Start development server
npm run dev
# Backend running at http://localhost:8080
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Update .env:
# VITE_API_BASE_URL=http://localhost:8080/api
# VITE_GOOGLE_CLIENT_ID=your-client-id
# VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
# VITE_CLOUDINARY_UPLOAD_PRESET=your-preset

# Start development server
npm run dev
# Frontend running at http://localhost:5173
```

### Test Locally
1. Visit `http://localhost:5173`
2. Click "Login with Google"
3. Complete profile with mobile number
4. Create a trip
5. Open another browser/tab as different user
6. Create matching trip → See matches

---

## Production Deployment (Vercel)

### Backend Deployment

1. **Create Vercel Project**
   ```bash
   npm i -g vercel
   cd backend
   vercel
   ```

2. **Set Environment Variables**
   ```
   MONGODB_URI: mongodb+srv://...
   JWT_SECRET: [random-secure-key]
   JWT_TIMEOUT: 7d
   GOOGLE_CLIENT_ID: [from Google Console]
   OPENAI_API_KEY: [from OpenAI]
   OPENAI_MODEL: gpt-5.4-mini
   NODE_ENV: production
   PORT: (auto-set by Vercel)
   ```

3. **Update vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "index.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "index.js" }
     ]
   }
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Frontend Deployment

1. **Create Vercel Project**
   ```bash
   cd frontend
   vercel
   ```

2. **Set Environment Variables**
   ```
   VITE_API_BASE_URL: https://your-backend.vercel.app/api
   VITE_GOOGLE_CLIENT_ID: [same as backend]
   VITE_CLOUDINARY_CLOUD_NAME: [your-cloud-name]
   VITE_CLOUDINARY_UPLOAD_PRESET: [your-preset]
   ```

3. **Build Settings**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Post-Deployment Checklist

- [ ] Backend health check: `https://your-backend.vercel.app/` (should return 404)
- [ ] Frontend loads: `https://your-frontend.vercel.app/`
- [ ] Google OAuth works
- [ ] MongoDB connection successful (check logs)
- [ ] Trip creation works end-to-end
- [ ] Matching algorithm finds matches
- [ ] Cloudinary image upload works (if configured)
- [ ] AI assistant responds (or falls back gracefully)

---

## MongoDB Setup

### Atlas (Cloud - Recommended for Resume)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free tier cluster
3. Get connection string
4. Update `.env`: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gogather?retryWrites=true`

### Local MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
mongod.exe
```

Connection string: `mongodb://localhost:27017/gogather`

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "GoGather"
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web application)
5. Authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://localhost:3000`
   - `https://your-frontend.vercel.app`
6. Authorized redirect URIs:
   - `http://localhost:5173`
   - `https://your-frontend.vercel.app`
7. Copy Client ID → Add to backend and frontend `.env`

---

## Cloudinary Setup (For Profile Images)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Settings
3. Get your Cloud Name
4. Go to Upload → Upload presets → Create unsigned preset
5. Name: `gogather-unsigned`
6. Add to `.env`:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=gogather-unsigned
   ```

---

## OpenAI Setup (For AI Travel Assistant)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Set up usage limits and alerts
4. Add to backend `.env`:
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-5.4-mini
   ```

**Note:** Graceful fallback included if API is unavailable

---

## Troubleshooting

### Frontend Can't Connect to Backend
- Check `VITE_API_BASE_URL` is correct
- Verify backend CORS settings
- Check `FRONTEND_URL` in backend `.env`
- Backend logs should show CORS configuration

### Google OAuth Fails
- Verify `GOOGLE_CLIENT_ID` matches between frontend and backend
- Check authorized origins/redirects in Google Console
- Clear browser cache and cookies

### Matching Algorithm Not Working
- Check MongoDB is running and has data
- Verify trips have same `travelDate`
- Check locations are within 3km or have same normalized name
- Verify arrival times are within matching window

### Images Not Uploading
- Verify Cloudinary credentials are correct
- Check unsigned preset is public
- Verify browser allows file upload
- Check network tab for 413 (payload too large) errors

### AI Assistant Times Out
- Check OpenAI API key is valid
- Check internet connection
- Verify `OPENAI_MODEL` is correct (gpt-5.4-mini for cost)
- Fallback response should still display

---

## Performance Optimization

### Frontend
- ✅ Vite for fast builds
- ✅ Code splitting via React Router
- ✅ Image optimization via Cloudinary CDN
- ✅ Lazy loading components

### Backend
- ✅ Mongoose indexes on `travelDate`, `user`, `shareCode`
- ✅ Caching for geocode results (10 min TTL)
- ✅ Rate limiting on sensitive endpoints
- ✅ Connection pooling for MongoDB

### API Calls
- ✅ 7-second polling (not real-time for cost efficiency)
- ✅ Batch queries where possible
- ✅ Selective field projection in MongoDB

---

## Monitoring & Logging

### Vercel Dashboard
- Deployment history
- Function logs
- Environment variables
- Analytics and performance

### MongoDB Atlas
- Connection stats
- Query performance
- Storage usage
- Alerts for issues

### Google Cloud Console
- OAuth usage and quota
- API errors
- Authentication metrics

---

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Use strong `JWT_SECRET` (40+ characters)
- [ ] Enable MongoDB IP whitelist
- [ ] Use HTTPS everywhere (auto-enabled on Vercel)
- [ ] Validate all user inputs
- [ ] Keep dependencies updated
- [ ] Monitor error logs for vulnerabilities
- [ ] Rate limit authentication endpoints

---

## Scaling Notes

### If Traffic Increases
1. **Database:** Add read replicas in MongoDB Atlas
2. **Backend:** Auto-scaling on Vercel (included)
3. **WebSockets:** Upgrade from polling to Socket.io
4. **Cache:** Add Redis for session/geocode caching
5. **CDN:** Leverage Vercel's global edge network

### Cost Optimization
- Free tier: OpenAI fallback, Vercel free tier, MongoDB Atlas free
- Estimated monthly: $0-20 (minimal usage)
- Paid scale: $50-500/month depending on users

---

## Git Workflow

```bash
# Clone
git clone <repo>

# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request
# After review, merge to main
```

---

## Useful Commands

```bash
# Backend
npm run dev                    # Development
npm start                      # Production
npm test                       # Tests (if available)

# Frontend
npm run dev                    # Development
npm run build                  # Production build
npm run preview               # Preview build
npm run lint                  # ESLint check
```

---

## Support & Documentation

- **Frontend Issues:** Check console errors (F12)
- **Backend Issues:** Check Vercel function logs
- **API Issues:** Use Postman to test endpoints
- **Database Issues:** Check MongoDB Atlas metrics

---

**Ready to deploy? You're 5 minutes away!**

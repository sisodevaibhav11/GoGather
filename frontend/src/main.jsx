import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  // This only prints if VITE_GOOGLE_CLIENT_ID was missing at BUILD time.
  // Setting it in Vercel afterwards requires a fresh deployment to take effect.
  console.error(
    '[main] VITE_GOOGLE_CLIENT_ID is not set. Google sign-in will fail until this is ' +
    "added to the frontend project's Environment Variables in Vercel and the site is redeployed."
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || 'missing-client-id'}>
      <AuthProvider>
        <App />
        <Toaster position="top-center" />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)

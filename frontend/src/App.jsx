import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import BottomNav from './components/BottomNav.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PageLoader from './components/PageLoader.jsx';
import { useAuth } from './hooks/useAuth.js';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CreateTripPage from './pages/CreateTripPage.jsx';
import TripsPage from './pages/TripsPage.jsx';
import TripDetailsPage from './pages/TripDetailsPage.jsx';
import ShareTripPage from './pages/ShareTripPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import HowItWorksPage from './pages/HowItWorksPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import RaiseIssuePage from './pages/RaiseIssuePage.jsx';

function App() {
  const { authLoading } = useAuth();

  if (authLoading) {
    return <PageLoader label="Checking your GoGather session..." />;
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="mobile-shell mx-auto flex min-h-[calc(100vh-120px)] w-full flex-col px-4 py-5 sm:px-6 lg:max-w-6xl lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/create-trip"
              element={(
                <ProtectedRoute>
                  <CreateTripPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/trips"
              element={(
                <ProtectedRoute>
                  <TripsPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/trips/:tripId"
              element={(
                <ProtectedRoute>
                  <TripDetailsPage />
                </ProtectedRoute>
              )}
            />
            <Route path="/trip/:shareCode" element={<ShareTripPage />} />
            <Route
              path="/profile"
              element={(
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              )}
            />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/raise-issue" element={<RaiseIssuePage />} />
            <Route path="/dashboard" element={<Navigate to="/trips" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <div className="bottom-nav-spacer" />
        </main>
        <BottomNav />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

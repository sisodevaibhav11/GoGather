import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const initialForm = {
  name: '',
  email: '',
  password: '',
};

export default function LoginPage() {
  const { loginWithGoogle, loginWithPassword, signupWithPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/trips" replace />;
  }

  const redirectTo = location.state?.from || '/trips';

  async function handleGoogleSuccess(credentialResponse) {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed.');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);

      if (mode === 'signup') {
        await signupWithPassword(form);
      } else {
        await loginWithPassword({
          email: form.email,
          password: form.password,
        });
      }

      navigate(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not continue with email and password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex w-full flex-1 items-center">
      <div className="auth-layout w-full">
        <div className="surface-card p-8 sm:p-10">
          <p className="section-kicker">GoGather auth</p>
          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            Sign in or create an account to start matching rides.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#888888]">
            Use email and password or continue with Google. Your trip history, profile, and ride matches stay in one place.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="surface-soft p-4">
              <p className="text-sm font-semibold text-white">Post quickly</p>
              <p className="mt-1 text-xs text-[#888888]">Create a ride in minutes with the same backend flow.</p>
            </div>
            <div className="surface-soft p-4">
              <p className="text-sm font-semibold text-white">Match safely</p>
              <p className="mt-1 text-xs text-[#888888]">Phone numbers stay hidden until both sides connect.</p>
            </div>
            <div className="surface-soft p-4">
              <p className="text-sm font-semibold text-white">Use anywhere</p>
              <p className="mt-1 text-xs text-[#888888]">Designed for mobile first and wider desktop windows too.</p>
            </div>
          </div>
        </div>

        <div className="surface-card p-8 sm:p-10">
          <div className="flex gap-3 rounded-2xl border border-[#333333] bg-[#181818] p-2">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                mode === 'login' ? 'bg-white text-black' : 'text-[#888888]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                mode === 'signup' ? 'bg-white text-black' : 'text-[#888888]'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            {mode === 'signup' ? (
              <label className="field-label">
                <span>Username</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="field-input"
                  placeholder="Enter your full name"
                  required
                />
              </label>
            ) : null}

            <label className="field-label">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="field-input"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="field-label">
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="field-input"
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                minLength={8}
                required
              />
            </label>

            <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full">
              {submitting
                ? mode === 'signup' ? 'Creating account...' : 'Signing in...'
                : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#333333]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#888888]">or</span>
            <div className="h-px flex-1 bg-[#333333]" />
          </div>

          <div className="surface-soft p-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed. Please try the button again.')}
              text={mode === 'signup' ? 'signup_with' : 'signin_with'}
              theme="outline"
              size="large"
              shape="pill"
            />
          </div>

          <p className="mt-4 text-xs leading-6 text-[#888888]">
            By continuing, you agree to use GoGather for safe ride coordination. If your Google button is blocked, verify the deployed origin is added in Google Cloud Console.
          </p>
        </div>
      </div>
    </section>
  );
}

import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function LoginPage() {
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/trips" replace />;
  }

  async function handleSuccess(credentialResponse) {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate(location.state?.from || '/trips');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed.');
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 items-center">
      <div className="surface-card w-full p-8 sm:p-10">
        <p className="section-kicker">GoGather login</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
          Sign in with Google and start matching safer arrivals.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          After your first login, add a mobile number to complete your profile. It will never be shown publicly until a mutual connection happens.
        </p>
        <div className="surface-soft mt-8 p-6">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error('Google login failed. Please try the button again.')}
            text="signin_with"
            theme="outline"
            size="large"
            shape="pill"
          />
        </div>
      </div>
    </section>
  );
}

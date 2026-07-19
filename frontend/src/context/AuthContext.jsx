import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  fetchCurrentUser,
  googleAuth,
  loginWithPassword as loginWithPasswordRequest,
  logoutUser,
  signupWithPassword as signupWithPasswordRequest,
  updateProfile as updateProfileRequest,
} from '../api.js';
import { AuthContext } from './AuthContextObject.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      try {
        const { data } = await fetchCurrentUser();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    bootstrap();
  }, []);

  const loginWithGoogle = async (credential) => {
    const { data } = await googleAuth(credential);
    setUser(data.user);
    toast.success('Welcome to GoGather');
    return data.user;
  };

  const loginWithPassword = async (payload) => {
    const { data } = await loginWithPasswordRequest(payload);
    setUser(data.user);
    toast.success('Welcome back');
    return data.user;
  };

  const signupWithPassword = async (payload) => {
    const { data } = await signupWithPasswordRequest(payload);
    setUser(data.user);
    toast.success('Account created');
    return data.user;
  };

  const refreshUser = async () => {
    const { data } = await fetchCurrentUser();
    setUser(data.user);
    return data.user;
  };

  const updateProfile = async (payload) => {
    const { data } = await updateProfileRequest(payload);
    setUser(data.user);
    toast.success('Profile updated');
    return data.user;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        authLoading,
        isAuthenticated: Boolean(user),
        loginWithGoogle,
        loginWithPassword,
        signupWithPassword,
        refreshUser,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

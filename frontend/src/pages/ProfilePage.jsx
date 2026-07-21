import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { HiChevronRight, HiHomeModern, HiPhone } from 'react-icons/hi2';
import { fetchTrips } from '../api.js';
import { useAuth } from '../hooks/useAuth.js';

async function uploadImageToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary environment variables are missing.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Cloudinary upload failed.');
  }

  const data = await response.json();
  return data.secure_url;
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    mobileNumber: user?.mobileNumber || '',
    hostel: user?.hostel || '',
    photoUrl: user?.photoUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ridesCount, setRidesCount] = useState(0);
  const [partnersCount, setPartnersCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await fetchTrips();
        const trips = data.trips || [];
        setRidesCount(trips.length);
        const matchedOrDone = trips.filter((t) => t.status === 'matched' || t.status === 'done');
        setPartnersCount(matchedOrDone.length);
      } catch {
        // silent fallback
      }
    }
    loadStats();
  }, []);

  const stats = [
    { label: 'Rides Posted', value: String(ridesCount) },
    { label: 'Partners Matched', value: String(partnersCount) },
  ];

  const aboutItems = [
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Raise an Issue', path: '/raise-issue' },
    { label: 'About GoGather', path: '/about' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
  ];

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      await updateProfile(form);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const photoUrl = await uploadImageToCloudinary(file);
      setForm((current) => ({ ...current, photoUrl }));
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error(error.message || 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  }

  const avatarSrc = form.photoUrl || user?.photoUrl;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="surface-card p-6 sm:p-8">
        <p className="section-kicker">Profile</p>

        <div className="mt-5 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="flex flex-col items-center text-center">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={form.name || 'Profile'}
                className="h-28 w-28 rounded-full border-2 border-[#00d084] object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#00d084] bg-[#2a2a2a] text-3xl font-extrabold text-[#00d084]">
                {(form.name || 'G')[0]}
              </div>
            )}
            <h1 className="mt-4 text-2xl font-bold text-white">{form.name || 'GoGather User'}</h1>
            <p className="mt-1 text-xs text-[#888888]">{user?.email || 'Add your email'}</p>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {['Verified Traveler', 'Active'].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-[#00d084]/40 bg-[#163628] px-3 py-1 text-[11px] font-semibold text-[#d7ffed]"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-5 grid w-full gap-3 text-left">
              <div className="surface-soft flex items-center gap-3 p-3.5 text-sm text-white">
                <HiHomeModern className="text-[18px] text-[#00d084]" />
                <span>{form.hostel || 'Campus / Hostel not added yet'}</span>
              </div>
              <div className="surface-soft flex items-center gap-3 p-3.5 text-sm text-white">
                <HiPhone className="text-[18px] text-[#00d084]" />
                <span>{form.mobileNumber || 'Add your WhatsApp number'}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-xl border border-[#333333] bg-[#1a1a1a] p-4">
                  <div className="mb-3 h-1 w-10 rounded-full bg-[#00d084]" />
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-[#888888]">{item.label}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">Edit Profile Information</p>

              <label className="field-label">
                <span>Name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="field-input"
                  placeholder="Your full name"
                />
              </label>

              <label className="field-label">
                <span>WhatsApp / Mobile number *</span>
                <input
                  value={form.mobileNumber}
                  onChange={(event) => setForm((current) => ({ ...current, mobileNumber: event.target.value }))}
                  placeholder="+91 9876543210"
                  className="field-input"
                  required
                />
              </label>

              <label className="field-label">
                <span>Hostel / Campus Residence</span>
                <input
                  value={form.hostel}
                  onChange={(event) => setForm((current) => ({ ...current, hostel: event.target.value }))}
                  placeholder="e.g. Oakwood Hostel - Room 304"
                  className="field-input"
                />
              </label>

              <div className="flex flex-col gap-3">
                <label className="field-label">
                  <span>Profile Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="text-sm text-[#888888] file:mr-4 file:rounded-full file:border-0 file:bg-[#2a2a2a] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                </label>
                <p className="text-xs text-[#888888]">
                  {uploading
                    ? 'Uploading to Cloudinary...'
                    : 'Upload a photo to Cloudinary CDN, or enter a direct image URL below.'}
                </p>
              </div>

              <label className="field-label">
                <span>Photo URL</span>
                <input
                  value={form.photoUrl}
                  onChange={(event) => setForm((current) => ({ ...current, photoUrl: event.target.value }))}
                  placeholder="https://..."
                  className="field-input"
                />
              </label>

              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">About & Support</p>

              <div className="flex flex-col gap-3">
                {aboutItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="surface-soft flex items-center justify-between px-4 py-3 text-left text-sm text-white hover:bg-[#333333] transition"
                  >
                    <span>{item.label}</span>
                    <HiChevronRight className="text-[#888888]" />
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={logout}
                  className="surface-soft px-4 py-3 text-left text-sm font-semibold text-[#ff4444] hover:bg-[#333333] transition"
                >
                  Sign out
                </button>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? 'Saving profile...' : 'Save profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

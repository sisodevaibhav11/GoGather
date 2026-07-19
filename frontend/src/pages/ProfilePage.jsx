import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiChevronRight, HiHomeModern, HiPhone } from 'react-icons/hi2';
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
    photoUrl: user?.photoUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      await updateProfile(form);
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

  const stats = [
    { label: 'Rides Posted', value: '0' },
    { label: 'Partners Found', value: '0' },
  ];

  const accountItems = [
    'Edit Profile',
    'Change WhatsApp Number',
    'Change Hostel',
  ];

  const aboutItems = [
    'How It Works',
    'Raise an Issue',
    'About GoGather',
    'Privacy Policy',
    'Terms of Service',
  ];

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="surface-card p-6 sm:p-8">
        <p className="section-kicker">Profile</p>
        <div className="mt-5 flex flex-col items-center text-center">
          <img
            src={form.photoUrl || 'https://placehold.co/160x160?text=GG'}
            alt={form.name || 'Profile'}
            className="h-28 w-28 rounded-full border-2 border-[#333333] object-cover"
          />
          <h1 className="mt-4 text-2xl font-bold text-white">{form.name || 'GoGather User'}</h1>
          <p className="mt-1 text-xs text-[#888888]">{user?.email || 'Add your email'}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {['Verified', 'Traveler', 'Active'].map((badge) => (
              <span key={badge} className="rounded-full border border-[#333333] bg-[#2a2a2a] px-3 py-1 text-[11px] text-[#cfcfcf]">
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-4 grid w-full gap-3 text-left">
            <div className="surface-soft flex items-center gap-3 p-3 text-sm text-white">
              <HiHomeModern className="text-[#00d084]" />
              <span>Campus / Hostel not added yet</span>
            </div>
            <div className="surface-soft flex items-center gap-3 p-3 text-sm text-white">
              <HiPhone className="text-[#00d084]" />
              <span>{form.mobileNumber || 'Add your WhatsApp number'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl border border-[#333333] bg-[#1a1a1a] p-4">
              <div className="mb-3 h-1 w-10 rounded-full bg-[#00d084]" />
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="mt-1 text-xs text-[#888888]">{item.label}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">Account</p>

          <label className="field-label">
            <span>Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="field-input"
            />
          </label>

          <div className="flex flex-col gap-3">
            {accountItems.map((item) => (
              <button
                key={item}
                type="button"
                className="surface-soft flex items-center justify-between px-4 py-3 text-left text-sm text-white"
              >
                <span>{item}</span>
                <HiChevronRight className="text-[#888888]" />
              </button>
            ))}
          </div>

          <label className="field-label">
            <span>Mobile number *</span>
            <input
              value={form.mobileNumber}
              onChange={(event) => setForm((current) => ({ ...current, mobileNumber: event.target.value }))}
              placeholder="+91 9876543210"
              className="field-input"
              required
            />
          </label>

          <div className="flex flex-col gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="text-sm text-[#888888] file:mr-4 file:rounded-full file:border-0 file:bg-[#2a2a2a] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            <p className="text-xs text-[#888888]">
              {uploading
                ? 'Uploading to Cloudinary...'
                : 'Optional: upload a better profile photo with Cloudinary, or keep your Google photo.'}
            </p>
          </div>

          <label className="field-label">
            <span>Photo URL</span>
            <input
              value={form.photoUrl}
              onChange={(event) => setForm((current) => ({ ...current, photoUrl: event.target.value }))}
              className="field-input"
            />
          </label>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">About</p>

          <div className="flex flex-col gap-3">
            {aboutItems.map((item) => (
              <button
                key={item}
                type="button"
                className="surface-soft flex items-center justify-between px-4 py-3 text-left text-sm text-white"
              >
                <span>{item}</span>
                <HiChevronRight className="text-[#888888]" />
              </button>
            ))}
            <button
              type="button"
              onClick={logout}
              className="surface-soft px-4 py-3 text-left text-sm font-semibold text-[#ff4444]"
            >
              Sign out
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

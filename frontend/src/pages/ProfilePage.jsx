import { useState } from 'react';
import toast from 'react-hot-toast';
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
  const { user, updateProfile } = useAuth();
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

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="rounded-[2rem] border border-stone-800 bg-stone-900/85 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Complete the details other travelers may rely on</h1>
        <p className="mt-3 text-sm leading-7 text-stone-300">
          Your mobile number stays hidden until a mutual connection is confirmed.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <div className="flex items-center gap-4">
            <img
              src={form.photoUrl || 'https://placehold.co/128x128?text=TB'}
              alt={form.name || 'Profile'}
              className="h-20 w-20 rounded-3xl object-cover"
            />
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="text-sm text-stone-300 file:mr-4 file:rounded-full file:border-0 file:bg-stone-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              <p className="text-xs text-stone-500">
                {uploading
                  ? 'Uploading to Cloudinary...'
                  : 'Optional: upload a better profile photo with Cloudinary, or keep your Google photo.'}
              </p>
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm text-stone-300">
            <span className="font-medium text-stone-200">Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-stone-300">
            <span className="font-medium text-stone-200">Mobile number *</span>
            <input
              value={form.mobileNumber}
              onChange={(event) => setForm((current) => ({ ...current, mobileNumber: event.target.value }))}
              placeholder="+91 9876543210"
              className="rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-stone-300">
            <span className="font-medium text-stone-200">Photo URL</span>
            <input
              value={form.photoUrl}
              onChange={(event) => setForm((current) => ({ ...current, photoUrl: event.target.value }))}
              className="rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-amber-400 px-5 py-3 font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { US_CITIES_EA_DIASPORA } from "@/types";
import { Loader2, CheckCircle2, AlertCircle, Camera } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState({ full_name: "", city: "", phone: "", bio: "", avatar_url: "" });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (profile) {
        setForm({
          full_name: profile.full_name ?? "",
          city: profile.city ?? "",
          phone: profile.phone ?? "",
          bio: profile.bio ?? "",
          avatar_url: profile.avatar_url ?? "",
        });
      }
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError(null);

    let avatar_url = form.avatar_url;
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
      if (!uploadErr) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = `${data.publicUrl}?t=${Date.now()}`;
      }
    }

    const { error: dbError } = await supabase.from("profiles").upsert({
      user_id: userId,
      full_name: form.full_name,
      city: form.city,
      phone: form.phone || null,
      bio: form.bio || null,
      avatar_url: avatar_url || null,
      updated_at: new Date().toISOString(),
    });

    if (dbError) setError(dbError.message);
    else { setSuccess(true); setTimeout(() => setSuccess(false), 3500); }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={24} className="animate-spin text-axum-300" /></div>;
  }

  const displayAvatar = avatarPreview ?? form.avatar_url;

  return (
    <div className="page-container py-10 min-h-screen">
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-4xl text-axum-950 mb-2">Edit Profile</h1>
        <p className="text-axum-500 mb-8">Your profile is visible to clients browsing your services.</p>

        <div className="card p-6 md:p-8">
          {error && (
            <div className="flex items-start gap-2 bg-harar-50 border border-harar-200 text-harar-700 px-4 py-3 rounded-xl text-sm mb-5">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-walia-50 border border-walia-200 text-walia-700 px-4 py-3 rounded-xl text-sm mb-5">
              <CheckCircle2 size={15} /> Profile saved successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 rounded-2xl bg-teff-100 overflow-hidden flex-shrink-0">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt="Avatar preview"
                    width={64}
                    height={64}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teff-600 text-2xl font-bold font-display">
                    {form.full_name[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                  <Camera size={18} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div>
                <p className="text-sm font-semibold text-axum-700 mb-1">Profile Photo</p>
                <label className="btn btn-secondary btn-sm cursor-pointer">
                  <Camera size={13} /> Change Photo
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} className="hidden" />
                </label>
                <p className="field-hint mt-1">JPG, PNG or WebP, max 2 MB</p>
              </div>
            </div>

            <div>
              <label className="field-label">Full Name *</label>
              <input type="text" required value={form.full_name} onChange={set("full_name")} className="field" />
            </div>
            <div>
              <label className="field-label">City</label>
              <select value={form.city} onChange={set("city")} className="field">
                <option value="">Select a city</option>
                {US_CITIES_EA_DIASPORA.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" className="field" />
            </div>
            <div>
              <label className="field-label">Bio</label>
              <textarea value={form.bio} onChange={set("bio")}
                placeholder="Tell clients about yourself, your experience, and why they should hire you..."
                className="field min-h-[100px] resize-y" maxLength={400} />
              <p className="field-hint">{form.bio.length}/400</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => router.back()} className="btn btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

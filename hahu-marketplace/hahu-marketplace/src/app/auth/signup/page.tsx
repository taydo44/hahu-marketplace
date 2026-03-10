"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { US_CITIES_EA_DIASPORA } from "@/types";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const supabase = createClient();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", city: "", phone: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, city: form.city, phone: form.phone },
      },
    });

    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from("profiles").upsert({
        user_id: data.user.id,
        full_name: form.fullName,
        city: form.city,
        phone: form.phone || null,
        is_provider: false,
      });
    }

    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md card p-10 text-center">
          <CheckCircle2 size={48} className="text-walia-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-axum-950 mb-2">Check your email</h2>
          <p className="text-axum-500 mb-6 leading-relaxed">
            We sent a confirmation link to <strong className="text-axum-700">{form.email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/auth/login" className="btn btn-primary w-full">Back to Sign In</Link>
          <p className="text-xs text-axum-400 mt-4">
            Didn&apos;t get an email? Check spam, or{" "}
            <button onClick={() => setDone(false)} className="text-teff-600 hover:underline">try again</button>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-teff-gradient flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-display text-2xl">ሐ</span>
            </div>
            <h1 className="font-display text-3xl text-axum-950">Join the Community</h1>
            <p className="text-axum-500 text-sm mt-2">Create your free Hahu Marketplace account</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-harar-50 border border-harar-200 text-harar-700 px-4 py-3 rounded-xl text-sm mb-5">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Full Name *</label>
              <input type="text" required value={form.fullName} onChange={set("fullName")}
                placeholder="Abebe Bekele" className="field" />
            </div>
            <div>
              <label className="field-label">Email *</label>
              <input type="email" required value={form.email} onChange={set("email")}
                placeholder="you@example.com" className="field" />
            </div>
            <div>
              <label className="field-label">City *</label>
              <select required value={form.city} onChange={set("city")} className="field">
                <option value="">Select your city</option>
                {US_CITIES_EA_DIASPORA.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Phone <span className="text-axum-400 font-normal">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={set("phone")}
                placeholder="+1 (555) 000-0000" className="field" />
            </div>
            <div>
              <label className="field-label">Password *</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 8 characters"
                  className="field pr-11"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-axum-400 hover:text-axum-600">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="text-center text-axum-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-teff-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

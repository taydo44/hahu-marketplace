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
      options: { data: { full_name: form.fullName, city: form.city, phone: form.phone } },
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
      <div className="auth-page">
        <div className="auth-box">
          <div className="auth-success card">
            <CheckCircle2 size={48} className="auth-success__icon" />
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--axum-950)", marginBottom: ".5rem" }}>
              Check your email
            </h2>
            <p style={{ color: "var(--axum-500)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              We sent a confirmation link to <strong style={{ color: "var(--axum-700)" }}>{form.email}</strong>.
              Click it to activate your account.
            </p>
            <Link href="/auth/login" className="btn btn-primary btn-full">Back to Sign In</Link>
            <p className="auth-resend">
              Didn&apos;t get an email? Check spam, or{" "}
              <button onClick={() => setDone(false)}>try again</button>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-card card">
          <div className="auth-logo-area">
            <div className="auth-icon">
              <span style={{ color: "#fff", fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>ሐ</span>
            </div>
            <h1 className="auth-title">Join the Community</h1>
            <p className="auth-sub">Create your free Hahu Marketplace account</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: "1.25rem" }}>
              <AlertCircle size={15} className="alert-icon" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
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
              <label className="field-label">Phone <span style={{ color: "var(--axum-400)", fontWeight: 400 }}>(optional)</span></label>
              <input type="tel" value={form.phone} onChange={set("phone")}
                placeholder="+1 (555) 000-0000" className="field" />
            </div>
            <div>
              <label className="field-label">Password *</label>
              <div className="pw-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 8 characters"
                  className="field field-pw"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="pw-toggle">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full auth-submit">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <Link href="/auth/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

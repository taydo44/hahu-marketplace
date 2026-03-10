"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 bg-harar-50 border border-harar-200 text-harar-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      <div>
        <label className="field-label">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" className="field" autoComplete="email" />
      </div>
      <div>
        <label className="field-label">Password</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="field pr-11"
            autoComplete="current-password"
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-axum-400 hover:text-axum-600">
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
        {loading && <Loader2 size={16} className="animate-spin" />}
        Sign In
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-teff-gradient flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-display text-2xl">ሐ</span>
            </div>
            <h1 className="font-display text-3xl text-axum-950">Welcome back</h1>
            <p className="text-axum-500 text-sm mt-2">Sign in to your Hahu Marketplace account</p>
          </div>

          <Suspense fallback={<div className="skeleton h-48 w-full" />}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-axum-500 text-sm mt-6">
            New to Hahu Marketplace?{" "}
            <Link href="/auth/signup" className="text-teff-600 font-semibold hover:underline">
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

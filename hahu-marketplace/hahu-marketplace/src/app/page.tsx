import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ServiceCard } from "@/components/services/ServiceCard";
import { SearchBar } from "@/components/services/SearchBar";
import { CATEGORIES } from "@/types";
import { ArrowRight, Shield, Users, Zap, Star } from "lucide-react";

async function FeaturedServices() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select(`*, profiles(*), reviews(rating)`)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (!data?.length) return null;

  const services = data.map((s) => ({
    ...s,
    avg_rating: s.reviews?.length
      ? s.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / s.reviews.length
      : 0,
    review_count: s.reviews?.length ?? 0,
  }));

  return (
    <section className="py-16 bg-[#faf8f4]">
      <div className="page-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title mb-2">Latest Listings</h2>
            <p className="text-axum-500 text-sm">Fresh from your community</p>
          </div>
          <Link href="/browse" className="btn btn-ghost text-teff-600 hover:text-teff-700 hidden sm:flex items-center gap-1 text-sm">
            See all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        <div className="text-center mt-6 sm:hidden">
          <Link href="/browse" className="btn btn-primary">
            Browse All Services <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-teff-gradient" />
        <div className="pattern-teff absolute inset-0 opacity-100" />
        <div className="absolute inset-0 bg-hero-texture" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teff-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-[300px] h-[300px] rounded-full bg-walia-500/10 blur-3xl pointer-events-none" />

        <div className="relative page-container py-24 md:py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-teff-100 px-4 py-1.5 rounded-full text-sm font-medium mb-7">
              <span className="w-2 h-2 bg-walia-400 rounded-full animate-pulse" />
              Ethiopian &amp; East African Diaspora Community
            </div>

            <h1 className="font-display text-5xl md:text-6xl xl:text-7xl text-white leading-[1.08] mb-6">
              Hahu Marketplace<br />
              <span className="text-teff-200 italic">Services</span> You<br />
              Can Trust
            </h1>

            <p className="text-teff-100/80 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              Connect with skilled Habesha professionals for cleaning, tutoring, translation, cooking, and more — across the United States.
            </p>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
              <Suspense fallback={<div className="h-12 rounded-xl bg-white/20 animate-pulse" />}>
                <SearchBar variant="hero" />
              </Suspense>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <div className="flex -space-x-1.5">
                {["A", "M", "T", "H", "B"].map((l, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-teff-400 border-2 border-teff-800 flex items-center justify-center text-white text-[10px] font-bold">
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-teff-200 text-sm">
                Join <strong className="text-white">hundreds</strong> of community members
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 64L1440 64L1440 32C1200 64 960 8 720 24C480 40 240 64 0 32L0 64Z" fill="#faf8f4" />
          </svg>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="py-16 page-container">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">Browse by Category</h2>
          <p className="text-axum-500">Find the service you need in your community</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5 stagger-children">
          {CATEGORIES.map(({ value, label, emoji }) => (
            <Link
              key={value}
              href={`/browse?category=${value}`}
              className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-injera-100 hover:border-teff-200 hover:bg-teff-50/50 transition-all duration-200 hover:-translate-y-0.5"
              style={{ boxShadow: "0 1px 3px rgba(176,125,62,0.06)" }}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{emoji}</span>
              <span className="text-[11px] font-medium text-axum-600 group-hover:text-teff-700 text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Featured Services ─── */}
      <Suspense
        fallback={
          <section className="py-16 bg-[#faf8f4]">
            <div className="page-container">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton h-60" />
                ))}
              </div>
            </div>
          </section>
        }
      >
        <FeaturedServices />
      </Suspense>

      {/* ─── Trust section ─── */}
      <section className="py-16 page-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Users className="text-teff-500" size={24} />,
              bg: "bg-teff-50",
              title: "Community Verified",
              desc: "Every provider is a member of the East African diaspora community — trusted by neighbors, for neighbors.",
            },
            {
              icon: <Shield className="text-walia-600" size={24} />,
              bg: "bg-walia-50",
              title: "Safe & Reliable",
              desc: "Real ratings and reviews from real community members help you choose with confidence.",
            },
            {
              icon: <Zap className="text-injera-600" size={24} />,
              bg: "bg-injera-100",
              title: "Easy & Free",
              desc: "Post your service in 2 minutes or find help instantly — completely free to join.",
            },
          ].map(({ icon, bg, title, desc }) => (
            <div key={title} className="flex gap-4 p-6 card">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                {icon}
              </div>
              <div>
                <h3 className="font-semibold text-axum-900 mb-1.5">{title}</h3>
                <p className="text-sm text-axum-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-16 bg-teff-gradient relative overflow-hidden">
        <div className="pattern-teff absolute inset-0 opacity-80" />
        <div className="relative page-container text-center">
          <div className="inline-flex items-center gap-1 bg-white/15 text-teff-100 px-3 py-1 rounded-full text-xs font-medium mb-5">
            <Star size={12} className="fill-teff-200 text-teff-200" />
            Join the community
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            Share Your Skills.<br />Grow Your Income.
          </h2>
          <p className="text-teff-100/80 text-lg max-w-lg mx-auto mb-8">
            Hundreds of community members are already earning by sharing their skills on Hahu Marketplace. Your next client is waiting.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup" className="btn bg-white text-teff-700 hover:bg-teff-50 btn-lg shadow-lg font-semibold">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link href="/browse" className="btn bg-white/10 hover:bg-white/20 border border-white/25 text-white btn-lg backdrop-blur-sm">
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

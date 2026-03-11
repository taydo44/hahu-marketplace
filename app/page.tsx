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
    <section className="section section-bg">
      <div className="page-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Latest Listings</h2>
            <p className="section-sub">Fresh from your community</p>
          </div>
          <Link href="/browse" className="btn btn-ghost" style={{ color: "var(--teff-600)", fontSize: ".875rem", display: "none" }}
            aria-hidden="true">
            See all <ArrowRight size={15} />
          </Link>
          <Link href="/browse" className="btn btn-ghost hide-mobile" style={{ color: "var(--teff-600)", fontSize: ".875rem" }}>
            See all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid-services stagger">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
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
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__pattern" />
        <div className="hero__texture" />
        <div className="hero__blob-tr" />
        <div className="hero__blob-bl" />

        <div className="hero__content page-container">
          <div className="hero__inner">
            <div className="hero__eyebrow">
              <span className="animate-pulse-dot" />
              Ethiopian &amp; East African Diaspora Community
            </div>

            <h1 className="hero__title">
              Hahu Marketplace<br />
              <em className="hero__title-em">Services</em> You<br />
              Can Trust
            </h1>

            <p className="hero__subtitle">
              Connect with skilled Habesha professionals for cleaning, tutoring, translation, cooking, and more — across the United States.
            </p>

            <div className="hero__search-wrap">
              <Suspense fallback={<div className="hero__skel" />}>
                <SearchBar variant="hero" />
              </Suspense>
            </div>

            <div className="hero__proof">
              <div className="hero__avatars">
                {["A", "M", "T", "H", "B"].map((l, i) => (
                  <div key={i} className="hero__avatar">{l}</div>
                ))}
              </div>
              <p className="hero__proof-text">
                Join <strong style={{ color: "#fff" }}>hundreds</strong> of community members
              </p>
            </div>
          </div>
        </div>

        <div className="hero__wave">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 64L1440 64L1440 32C1200 64 960 8 720 24C480 40 240 64 0 32L0 64Z" fill="#faf8f4" />
          </svg>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="section">
        <div className="page-container">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-sub" style={{ marginTop: ".75rem" }}>Find the service you need in your community</p>
          </div>
          <div className="grid-cats stagger">
            {CATEGORIES.map(({ value, label, emoji }) => (
              <Link key={value} href={`/browse?category=${value}`} className="cat-item">
                <span className="cat-item__emoji">{emoji}</span>
                <span className="cat-item__label">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Services ─── */}
      <Suspense
        fallback={
          <section className="section section-bg">
            <div className="page-container">
              <div className="grid-services">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: "15rem" }} />
                ))}
              </div>
            </div>
          </section>
        }
      >
        <FeaturedServices />
      </Suspense>

      {/* ─── Trust ─── */}
      <section className="section">
        <div className="page-container">
          <div className="grid-trust">
            {[
              {
                icon: <Users size={24} style={{ color: "var(--teff-500)" }} />,
                cls: "trust-icon--teff",
                title: "Community Verified",
                desc: "Every provider is a member of the East African diaspora community — trusted by neighbors, for neighbors.",
              },
              {
                icon: <Shield size={24} style={{ color: "var(--walia-600)" }} />,
                cls: "trust-icon--walia",
                title: "Safe & Reliable",
                desc: "Real ratings and reviews from real community members help you choose with confidence.",
              },
              {
                icon: <Zap size={24} style={{ color: "var(--injera-600)" }} />,
                cls: "trust-icon--injera",
                title: "Easy & Free",
                desc: "Post your service in 2 minutes or find help instantly — completely free to join.",
              },
            ].map(({ icon, cls, title, desc }) => (
              <div key={title} className="trust-card card">
                <div className={`trust-icon ${cls}`}>{icon}</div>
                <div>
                  <h3 className="trust-title">{title}</h3>
                  <p className="trust-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="cta-banner">
        <div className="cta-banner__pattern" />
        <div className="cta-banner__inner page-container">
          <div className="cta-eyebrow">
            <Star size={12} style={{ fill: "var(--teff-200)", color: "var(--teff-200)" }} />
            Join the community
          </div>
          <h2 className="cta-title">Share Your Skills.<br />Grow Your Income.</h2>
          <p className="cta-sub">
            Hundreds of community members are already earning by sharing their skills on Hahu Marketplace. Your next client is waiting.
          </p>
          <div className="cta-btns">
            <Link href="/auth/signup" className="btn btn-white btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link href="/browse" className="btn btn-outline-white btn-lg">
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

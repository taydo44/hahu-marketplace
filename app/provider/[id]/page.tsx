import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ServiceCard } from "@/components/services/ServiceCard";
import { MapPin, Phone, Star, Calendar, Package } from "lucide-react";

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: services }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", id).single(),
    supabase.from("services").select(`*, profiles(*), reviews(rating)`)
      .eq("provider_id", id).eq("is_active", true).order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  const enriched = (services ?? []).map((s) => ({
    ...s,
    avg_rating: s.reviews?.length
      ? s.reviews.reduce((a: number, r: { rating: number }) => a + r.rating, 0) / s.reviews.length
      : 0,
    review_count: s.reviews?.length ?? 0,
  }));

  const allReviews = (services ?? []).flatMap((s) => s.reviews ?? []);
  const overallRating = allReviews.length
    ? allReviews.reduce((sum, r: { rating: number }) => sum + r.rating, 0) / allReviews.length
    : 0;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <div className="prov-hero">
        <div className="prov-hero__pattern" />
        <div className="prov-hero__inner page-container">
          <div className="prov-hero__row">
            <div className="prov-hero__avatar">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.full_name} width={80} height={80}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                profile.full_name[0]?.toUpperCase()
              )}
            </div>
            <div className="prov-hero__info">
              <h1 className="prov-hero__name">{profile.full_name}</h1>
              <div className="prov-hero__meta">
                {profile.city && (
                  <span className="prov-hero__meta-item"><MapPin size={14} /> {profile.city}</span>
                )}
                {profile.phone && (
                  <a href={`tel:${profile.phone}`}>
                    <Phone size={14} /> {profile.phone}
                  </a>
                )}
                <span className="prov-hero__meta-item">
                  <Calendar size={14} />
                  Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
              {allReviews.length > 0 && (
                <div className="prov-hero__stars-row">
                  <div className="prov-hero__stars">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={14}
                        style={s <= Math.round(overallRating)
                          ? { fill: "var(--teff-200)", color: "var(--teff-200)" }
                          : { fill: "rgba(255,255,255,.2)", color: "rgba(255,255,255,.2)" }} />
                    ))}
                  </div>
                  <span className="prov-hero__rating-text">
                    {overallRating.toFixed(1)} overall · {allReviews.length} review{allReviews.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
            <div className="prov-hero__stats">
              <div>
                <p className="prov-hero__stat-num">{enriched.length}</p>
                <p className="prov-hero__stat-label">Services</p>
              </div>
              {allReviews.length > 0 && (
                <div>
                  <p className="prov-hero__stat-num">{allReviews.length}</p>
                  <p className="prov-hero__stat-label">Reviews</p>
                </div>
              )}
            </div>
          </div>
          {profile.bio && (
            <div className="prov-hero__bio">
              <p>{profile.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Services */}
      <div className="prov-services page-container">
        <h2 className="prov-services__title">
          Services by {profile.full_name.split(" ")[0]}
        </h2>
        {enriched.length === 0 ? (
          <div className="prov-empty card">
            <Package size={36} className="prov-empty__icon" />
            <p style={{ color: "var(--axum-400)" }}>No active services at this time.</p>
          </div>
        ) : (
          <div className="grid-services stagger">
            {enriched.map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>
        )}
      </div>
    </div>
  );
}

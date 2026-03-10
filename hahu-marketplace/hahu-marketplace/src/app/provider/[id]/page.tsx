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
    <div className="min-h-screen">
      <div className="bg-teff-gradient relative overflow-hidden">
        <div className="pattern-teff absolute inset-0 opacity-70" />
        <div className="relative page-container py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 overflow-hidden flex-shrink-0 shadow-xl">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.full_name} width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold font-display">
                  {profile.full_name[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-4xl text-white mb-2">{profile.full_name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-teff-100/80 text-sm">
                {profile.city && <span className="flex items-center gap-1.5"><MapPin size={14} /> {profile.city}</span>}
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Phone size={14} /> {profile.phone}
                  </a>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
              {allReviews.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={14} className={s <= Math.round(overallRating) ? "fill-teff-200 text-teff-200" : "fill-white/20 text-white/20"} />
                    ))}
                  </div>
                  <span className="text-teff-100 text-sm">
                    {overallRating.toFixed(1)} overall · {allReviews.length} review{allReviews.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-4 sm:gap-6 sm:text-right">
              <div>
                <p className="font-display text-3xl text-white">{enriched.length}</p>
                <p className="text-teff-200 text-xs">Services</p>
              </div>
              {allReviews.length > 0 && (
                <div>
                  <p className="font-display text-3xl text-white">{allReviews.length}</p>
                  <p className="text-teff-200 text-xs">Reviews</p>
                </div>
              )}
            </div>
          </div>
          {profile.bio && (
            <div className="mt-6 max-w-2xl bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4">
              <p className="text-teff-100 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>

      <div className="page-container py-10">
        <h2 className="font-display text-2xl text-axum-950 mb-6">
          Services by {profile.full_name.split(" ")[0]}
        </h2>
        {enriched.length === 0 ? (
          <div className="card text-center py-14">
            <Package size={36} className="mx-auto text-axum-200 mb-3" />
            <p className="text-axum-400">No active services at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {enriched.map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>
        )}
      </div>
    </div>
  );
}

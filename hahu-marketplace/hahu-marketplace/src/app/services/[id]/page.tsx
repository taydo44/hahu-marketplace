import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { getCategoryByValue, formatPrice } from "@/types";
import { MapPin, Phone, Mail, Star, ArrowLeft, ExternalLink, Calendar } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("title, description").eq("id", id).single();
  return data
    ? { title: data.title, description: data.description.slice(0, 155) }
    : { title: "Service Not Found" };
}

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select(`*, profiles(*), reviews(*, profiles(*))`)
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!service) notFound();

  const cat = getCategoryByValue(service.category);
  const priceStr = formatPrice(service.price, service.price_type);
  const avgRating = service.reviews?.length
    ? service.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / service.reviews.length
    : 0;

  const { data: moreServices } = await supabase
    .from("services")
    .select("id, title, category, price, price_type")
    .eq("provider_id", service.provider_id)
    .eq("is_active", true)
    .neq("id", id)
    .limit(3);

  return (
    <div className="page-container py-8 min-h-screen">
      <Link href="/browse" className="inline-flex items-center gap-1.5 text-axum-400 hover:text-axum-700 text-sm mb-6 transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="badge badge-teff">{cat?.emoji} {cat?.label}</span>
              <span className="text-axum-300">·</span>
              <span className="text-xs text-axum-400 flex items-center gap-1">
                <Calendar size={11} />
                Posted {new Date(service.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-axum-950 leading-tight mb-4">{service.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-axum-500"><MapPin size={14} /> {service.city}</span>
              {service.reviews?.length > 0 && (
                <span className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={12} className={s <= Math.round(avgRating) ? "star-filled" : "star-empty"} />
                    ))}
                  </div>
                  <span className="text-axum-500">
                    {avgRating.toFixed(1)} ({service.reviews.length} review{service.reviews.length !== 1 ? "s" : ""})
                  </span>
                </span>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl text-axum-800 mb-3">About This Service</h2>
            <p className="text-axum-600 leading-relaxed whitespace-pre-wrap">{service.description}</p>
          </div>

          {moreServices?.length ? (
            <div>
              <h2 className="font-display text-xl text-axum-800 mb-3">
                More from {service.profiles?.full_name?.split(" ")[0]}
              </h2>
              <div className="space-y-2">
                {moreServices.map((s) => {
                  const c = getCategoryByValue(s.category);
                  return (
                    <Link key={s.id} href={`/services/${s.id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-injera-50 hover:bg-teff-50 border border-injera-100 hover:border-teff-100 transition-colors group">
                      <div className="flex items-center gap-2 text-sm">
                        <span>{c?.emoji}</span>
                        <span className="text-axum-700 group-hover:text-teff-700 font-medium">{s.title}</span>
                      </div>
                      <span className="text-xs font-semibold text-teff-600">{formatPrice(s.price, s.price_type)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div>
            <h2 className="font-display text-xl text-axum-800 mb-5">
              Reviews {service.reviews?.length > 0 && `(${service.reviews.length})`}
            </h2>
            <ReviewSection serviceId={service.id} providerId={service.provider_id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-6 border-2 border-teff-100">
            <div className="mb-5">
              <p className="font-display text-3xl text-teff-600 leading-none">{priceStr}</p>
              <p className="text-axum-400 text-sm mt-1">
                {service.price_type === "hourly" && "Per hour"}
                {service.price_type === "fixed" && "One-time payment"}
                {service.price_type === "negotiable" && "Price is negotiable — contact provider"}
              </p>
            </div>
            <div className="space-y-2.5">
              {service.contact_email && (
                <a href={`mailto:${service.contact_email}?subject=Inquiry about: ${service.title}`} className="btn btn-primary w-full">
                  <Mail size={15} /> Send Email
                </a>
              )}
              {service.contact_phone && (
                <a href={`tel:${service.contact_phone}`} className="btn btn-secondary w-full">
                  <Phone size={15} /> Call {service.contact_phone}
                </a>
              )}
              {!service.contact_email && !service.contact_phone && (
                <p className="text-center text-axum-400 text-sm py-2">Contact provider via their profile</p>
              )}
            </div>
          </div>

          {service.profiles && (
            <div className="card p-5">
              <p className="text-xs font-semibold text-axum-400 uppercase tracking-wider mb-4">Provider</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-teff-100 overflow-hidden flex-shrink-0">
                  {service.profiles.avatar_url ? (
                    <Image src={service.profiles.avatar_url} alt={service.profiles.full_name}
                      width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-teff-600 text-lg font-bold font-display">
                      {service.profiles.full_name[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-axum-900">{service.profiles.full_name}</p>
                  <p className="text-xs text-axum-400 flex items-center gap-1"><MapPin size={10} /> {service.profiles.city}</p>
                </div>
              </div>
              {service.profiles.bio && (
                <p className="text-sm text-axum-500 leading-relaxed mb-4 line-clamp-3">{service.profiles.bio}</p>
              )}
              <Link href={`/provider/${service.provider_id}`} className="btn btn-secondary w-full btn-sm">
                <ExternalLink size={13} /> View Full Profile
              </Link>
            </div>
          )}

          <div className="bg-injera-50 border border-injera-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-injera-700 mb-1.5">💡 Safety Tip</p>
            <p className="text-xs text-axum-500 leading-relaxed">
              Always meet in a safe public place first. Verify the provider&apos;s identity before sharing personal information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

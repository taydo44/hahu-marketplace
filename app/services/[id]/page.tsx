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
    <div className="svc-detail page-container">
      <Link href="/browse" className="svc-back">
        <ArrowLeft size={15} />
        Back to Browse
      </Link>

      <div className="grid-detail">
        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div className="svc-meta">
            <div className="svc-meta__tags">
              <span className="badge badge-teff">{cat?.emoji} {cat?.label}</span>
              <span className="svc-meta__dot">·</span>
              <span className="svc-meta__date">
                <Calendar size={11} />
                Posted {new Date(service.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <h1 className="svc-meta__title">{service.title}</h1>
            <div className="svc-meta__stats">
              <span className="svc-meta__city"><MapPin size={14} /> {service.city}</span>
              {service.reviews?.length > 0 && (
                <span className="svc-meta__ratings">
                  <div className="svc-meta__stars">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={12} className={s <= Math.round(avgRating) ? "star-filled" : "star-empty"} />
                    ))}
                  </div>
                  <span style={{ color: "var(--axum-500)" }}>
                    {avgRating.toFixed(1)} ({service.reviews.length} review{service.reviews.length !== 1 ? "s" : ""})
                  </span>
                </span>
              )}
            </div>
          </div>

          <div>
            <h2 className="svc-section-h">About This Service</h2>
            <p className="svc-desc">{service.description}</p>
          </div>

          {moreServices?.length ? (
            <div>
              <h2 className="svc-section-h">
                More from {service.profiles?.full_name?.split(" ")[0]}
              </h2>
              <div className="more-list">
                {moreServices.map((s) => {
                  const c = getCategoryByValue(s.category);
                  return (
                    <Link key={s.id} href={`/services/${s.id}`} className="more-link">
                      <div className="more-link__left">
                        <span>{c?.emoji}</span>
                        <span className="more-link__name">{s.title}</span>
                      </div>
                      <span className="more-link__price">{formatPrice(s.price, s.price_type)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div>
            <h2 className="svc-section-h">
              Reviews {service.reviews?.length > 0 && `(${service.reviews.length})`}
            </h2>
            <ReviewSection serviceId={service.id} providerId={service.provider_id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-stack">
          <div className="price-card card">
            <div>
              <p className="price-card__amount">{priceStr}</p>
              <p className="price-card__type">
                {service.price_type === "hourly" && "Per hour"}
                {service.price_type === "fixed" && "One-time payment"}
                {service.price_type === "negotiable" && "Price is negotiable — contact provider"}
              </p>
            </div>
            <div className="price-card__btns">
              {service.contact_email && (
                <a href={`mailto:${service.contact_email}?subject=Inquiry about: ${service.title}`} className="btn btn-primary btn-full">
                  <Mail size={15} /> Send Email
                </a>
              )}
              {service.contact_phone && (
                <a href={`tel:${service.contact_phone}`} className="btn btn-secondary btn-full">
                  <Phone size={15} /> Call {service.contact_phone}
                </a>
              )}
              {!service.contact_email && !service.contact_phone && (
                <p className="price-card__none">Contact provider via their profile</p>
              )}
            </div>
          </div>

          {service.profiles && (
            <div className="provider-sidebar card">
              <p className="provider-sidebar__label">Provider</p>
              <div className="provider-sidebar__row">
                <div className="provider-sidebar__avatar">
                  {service.profiles.avatar_url ? (
                    <Image src={service.profiles.avatar_url} alt={service.profiles.full_name}
                      width={48} height={48} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    service.profiles.full_name[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <p className="provider-sidebar__name">{service.profiles.full_name}</p>
                  <p className="provider-sidebar__city"><MapPin size={10} /> {service.profiles.city}</p>
                </div>
              </div>
              {service.profiles.bio && (
                <p className="provider-sidebar__bio">{service.profiles.bio}</p>
              )}
              <Link href={`/provider/${service.provider_id}`} className="btn btn-secondary btn-full btn-sm">
                <ExternalLink size={13} /> View Full Profile
              </Link>
            </div>
          )}

          <div className="safety-tip">
            <p className="safety-tip__title">💡 Safety Tip</p>
            <p className="safety-tip__body">
              Always meet in a safe public place first. Verify the provider&apos;s identity before sharing personal information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

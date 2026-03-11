import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardServiceActions } from "@/components/services/DashboardServiceActions";
import { getCategoryByValue, formatPrice } from "@/types";
import { Plus, Settings, MapPin, TrendingUp, Star, Package } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/dashboard");

  const [{ data: profile }, { data: services }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("services").select("*, reviews(rating)").eq("provider_id", user.id).order("created_at", { ascending: false }),
  ]);

  const activeServices = (services ?? []).filter((s) => s.is_active);
  const totalReviews = (services ?? []).reduce((sum, s) => sum + (s.reviews?.length ?? 0), 0);
  const avgRatingAll =
    totalReviews > 0
      ? (services ?? []).flatMap((s) => s.reviews ?? []).reduce((sum, r: { rating: number }) => sum + r.rating, 0) / totalReviews
      : 0;

  const stats = [
    { label: "Total Listings", value: services?.length ?? 0, icon: Package, cls: "teff" },
    { label: "Active",         value: activeServices.length, icon: TrendingUp, cls: "walia" },
    { label: "Reviews",        value: totalReviews, icon: Star, cls: "injera" },
    { label: "Avg Rating",     value: totalReviews > 0 ? `${avgRatingAll.toFixed(1)} ★` : "—", icon: Star, cls: "axum" },
  ];

  return (
    <div className="dash page-container">
      <div className="dash__header">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-sub">
            Welcome back, <strong style={{ color: "var(--axum-700)" }}>{profile?.full_name ?? user.email}</strong>
          </p>
        </div>
        <div className="dash__actions">
          <Link href="/profile" className="btn btn-secondary btn-sm"><Settings size={14} />Edit Profile</Link>
          <Link href="/services/new" className="btn btn-primary btn-sm"><Plus size={14} />New Service</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-stats" style={{ marginBottom: "2.5rem" }}>
        {stats.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="dash__stat card">
            <div className="dash__stat-top">
              <span className="dash__stat-label">{label}</span>
              <div className={`dash__stat-icon dash__stat-icon--${cls}`}>
                <Icon size={14} />
              </div>
            </div>
            <p className={`dash__stat-val dash__stat-val--${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Services list */}
      <div>
        <h2 className="dash__services-title">My Services</h2>
        {!services?.length ? (
          <div className="dash__empty card">
            <Package size={40} className="dash__empty-icon" />
            <h3 className="dash__empty-title">No services yet</h3>
            <p className="dash__empty-sub">
              Start posting your services to connect with clients in your community.
            </p>
            <Link href="/services/new" className="btn btn-primary"><Plus size={16} />Post Your First Service</Link>
          </div>
        ) : (
          <div className="dash__list">
            {services.map((service) => {
              const cat = getCategoryByValue(service.category);
              const avgR = service.reviews?.length
                ? service.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / service.reviews.length
                : 0;
              return (
                <div key={service.id} className="dash__item card">
                  <div className="dash__item-icon">{cat?.emoji}</div>
                  <div className="dash__item-info">
                    <div className="dash__item-title-row">
                      <span className="dash__item-title">{service.title}</span>
                      <span className={`badge ${service.is_active ? "badge-walia" : "badge-axum"}`}
                        style={{ fontSize: ".625rem" }}>
                        {service.is_active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <div className="dash__item-meta">
                      <span>{cat?.label}</span>
                      <span className="dash__item-loc"><MapPin size={10} />{service.city}</span>
                      <span className="dash__item-price">{formatPrice(service.price, service.price_type)}</span>
                      {service.reviews?.length > 0 && (
                        <span className="dash__item-rating">
                          <Star size={10} className="star-filled" />
                          {avgR.toFixed(1)} ({service.reviews.length})
                        </span>
                      )}
                    </div>
                  </div>
                  <DashboardServiceActions serviceId={service.id} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

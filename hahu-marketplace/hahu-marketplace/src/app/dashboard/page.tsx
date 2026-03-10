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

  return (
    <div className="page-container py-10 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-4xl text-axum-950 mb-1">My Dashboard</h1>
          <p className="text-axum-500">
            Welcome back, <span className="font-medium text-axum-700">{profile?.full_name ?? user.email}</span>
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/profile" className="btn btn-secondary btn-sm"><Settings size={14} />Edit Profile</Link>
          <Link href="/services/new" className="btn btn-primary btn-sm"><Plus size={14} />New Service</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Listings", value: services?.length ?? 0, icon: Package, color: "text-teff-600", bg: "bg-teff-50" },
          { label: "Active", value: activeServices.length, icon: TrendingUp, color: "text-walia-600", bg: "bg-walia-50" },
          { label: "Reviews", value: totalReviews, icon: Star, color: "text-injera-600", bg: "bg-injera-100" },
          { label: "Avg Rating", value: totalReviews > 0 ? `${avgRatingAll.toFixed(1)} ★` : "—", icon: Star, color: "text-axum-600", bg: "bg-axum-100" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-axum-400 uppercase tracking-wide">{label}</span>
              <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={14} className={color} />
              </div>
            </div>
            <p className={`font-display text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Services list */}
      <div>
        <h2 className="font-display text-2xl text-axum-950 mb-5">My Services</h2>
        {!services?.length ? (
          <div className="card text-center py-16">
            <Package size={40} className="mx-auto text-axum-200 mb-4" />
            <h3 className="font-display text-xl text-axum-700 mb-2">No services yet</h3>
            <p className="text-axum-400 text-sm mb-6 max-w-xs mx-auto">
              Start posting your services to connect with clients in your community.
            </p>
            <Link href="/services/new" className="btn btn-primary"><Plus size={16} />Post Your First Service</Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {services.map((service) => {
              const cat = getCategoryByValue(service.category);
              const avgR = service.reviews?.length
                ? service.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / service.reviews.length
                : 0;
              return (
                <div key={service.id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-teff-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {cat?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-axum-900 truncate">{service.title}</span>
                      <span className={`badge text-[10px] ${service.is_active ? "badge-walia" : "badge-axum"}`}>
                        {service.is_active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-axum-400 flex-wrap">
                      <span>{cat?.label}</span>
                      <span className="flex items-center gap-0.5"><MapPin size={10} />{service.city}</span>
                      <span className="font-semibold text-teff-600">{formatPrice(service.price, service.price_type)}</span>
                      {service.reviews?.length > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star size={10} className="fill-teff-400 text-teff-400" />
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

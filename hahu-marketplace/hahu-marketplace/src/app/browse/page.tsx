import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ServiceCard } from "@/components/services/ServiceCard";
import { SearchBar } from "@/components/services/SearchBar";
import { SearchX } from "lucide-react";

interface BrowsePageProps {
  searchParams: Promise<{ q?: string; category?: string; city?: string }>;
}

async function Results({ q, category, city }: { q?: string; category?: string; city?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("services")
    .select(`*, profiles(*), reviews(rating)`)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (q)        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (category) query = query.eq("category", category);
  if (city)     query = query.eq("city", city);

  const { data, error } = await query.limit(48);

  if (error) {
    return <div className="text-center py-16 text-harar-600 text-sm">Error loading services: {error.message}</div>;
  }

  const services = (data ?? []).map((s) => ({
    ...s,
    avg_rating: s.reviews?.length
      ? s.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / s.reviews.length
      : 0,
    review_count: s.reviews?.length ?? 0,
  }));

  if (services.length === 0) {
    return (
      <div className="text-center py-20">
        <SearchX size={40} className="mx-auto text-axum-200 mb-4" />
        <h3 className="font-display text-xl text-axum-700 mb-2">No services found</h3>
        <p className="text-axum-400 text-sm">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-axum-400 mb-5 font-medium">
        {services.length} service{services.length !== 1 ? "s" : ""} found
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </>
  );
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { q, category, city } = await searchParams;
  const hasFilters = !!(q || category || city);

  return (
    <div className="page-container py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-axum-950 mb-2">Browse Services</h1>
        <p className="text-axum-500">Discover skilled professionals from the East African community near you</p>
      </div>

      <div className="mb-8">
        <Suspense fallback={<div className="skeleton h-12 w-full" />}>
          <SearchBar />
        </Suspense>
      </div>

      {hasFilters && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-axum-400">
            Search results for{q ? ` "${q}"` : ""}
            {category ? ` · ${category}` : ""}
            {city ? ` · ${city}` : ""}
          </p>
        </div>
      )}

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-60" />)}
          </div>
        }
      >
        <Results q={q} category={category} city={city} />
      </Suspense>
    </div>
  );
}

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
    return <div className="browse__error">Error loading services: {error.message}</div>;
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
      <div className="browse__empty">
        <SearchX size={40} className="browse__empty-icon" />
        <h3 className="browse__empty-title">No services found</h3>
        <p className="browse__empty-sub">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <>
      <p className="browse__count">{services.length} service{services.length !== 1 ? "s" : ""} found</p>
      <div className="grid-services stagger">
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
    <div className="browse page-container">
      <div className="page-header">
        <h1 className="page-title">Browse Services</h1>
        <p className="page-sub">Discover skilled professionals from the East African community near you</p>
      </div>

      <div className="browse__search">
        <Suspense fallback={<div className="skeleton" style={{ height: "3rem", width: "100%" }} />}>
          <SearchBar />
        </Suspense>
      </div>

      {hasFilters && (
        <p className="browse__filter-info">
          Search results for{q ? ` "${q}"` : ""}
          {category ? ` · ${category}` : ""}
          {city ? ` · ${city}` : ""}
        </p>
      )}

      <Suspense
        fallback={
          <div className="grid-services">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: "15rem" }} />)}
          </div>
        }
      >
        <Results q={q} category={category} city={city} />
      </Suspense>
    </div>
  );
}

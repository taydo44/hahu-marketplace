"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { CATEGORIES, US_CITIES_EA_DIASPORA } from "@/types";

interface SearchBarProps {
  className?: string;
  variant?: "hero" | "page";
}

export function SearchBar({ className = "", variant = "page" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [showFilters, setShowFilters] = useState(!!(searchParams.get("category") || searchParams.get("city")));

  const activeFilterCount = [category, city].filter(Boolean).length;
  const isHero = variant === "hero";

  const doSearch = (q = query, cat = category, c = city) => {
    const params = new URLSearchParams();
    if (q.trim())  params.set("q", q.trim());
    if (cat)       params.set("category", cat);
    if (c)         params.set("city", c);
    startTransition(() => router.push(`/browse?${params.toString()}`));
  };

  const clearAll = () => {
    setQuery(""); setCategory(""); setCity("");
    startTransition(() => router.push("/browse"));
  };

  return (
    <div className={`sb${className ? ` ${className}` : ""}`}>
      <div className={`sb__row${isHero ? "" : ""}`}>
        <div className="sb__input-wrap">
          <span className={`sb__icon${isPending ? " sb__icon--spin" : ""}`}>
            {isPending ? <Loader2 size={16} /> : <Search size={16} />}
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder={isHero ? "e.g. Amharic tutor, house cleaning, moving help..." : "Search services..."}
            className={`field sb__input${isHero ? " sb__input--hero" : ""}`}
          />
        </div>
        <div className="sb__filter-wrap" style={{ position: "relative" }}>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-secondary${isHero ? "" : ""}${showFilters ? " sb__filter-active" : ""}${isHero ? " sb__btn--hero" : ""}`}>
            <SlidersHorizontal size={15} />
            <span className="hide-mobile">Filters</span>
            {activeFilterCount > 0 && (
              <span className="sb__badge">{activeFilterCount}</span>
            )}
          </button>
        </div>
        <button onClick={() => doSearch()} className={`btn btn-primary${isHero ? " sb__btn--hero" : ""}`}>
          Search
        </button>
      </div>

      {showFilters && (
        <div className="sb__filters card">
          <div>
            <label className="field-label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="field">
              <option value="">All Categories</option>
              {CATEGORIES.map(({ value, label, emoji }) => (
                <option key={value} value={value}>{emoji} {label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="field">
              <option value="">All Cities</option>
              {US_CITIES_EA_DIASPORA.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="sb__filter-actions">
            <button onClick={() => { setCategory(""); setCity(""); }} className="btn btn-ghost btn-sm" style={{ color: "var(--axum-500)" }}>
              Clear filters
            </button>
            <button onClick={() => doSearch()} className="btn btn-primary btn-sm">Apply</button>
          </div>
        </div>
      )}

      {(query || category || city) && (
        <div className="sb__tags">
          <span className="sb__tags-label">Active:</span>
          {query && (
            <span className="badge badge-axum" style={{ gap: ".375rem" }}>
              &ldquo;{query}&rdquo;
              <button className="sb__tag-x" onClick={() => { setQuery(""); doSearch("", category, city); }}><X size={10} /></button>
            </span>
          )}
          {category && (
            <span className="badge badge-teff" style={{ gap: ".375rem" }}>
              {CATEGORIES.find(c => c.value === category)?.emoji}{" "}
              {CATEGORIES.find(c => c.value === category)?.label}
              <button className="sb__tag-x" onClick={() => { setCategory(""); doSearch(query, "", city); }}><X size={10} /></button>
            </span>
          )}
          {city && (
            <span className="badge badge-walia" style={{ gap: ".375rem" }}>
              📍 {city}
              <button className="sb__tag-x" onClick={() => { setCity(""); doSearch(query, category, ""); }}><X size={10} /></button>
            </span>
          )}
          <button onClick={clearAll} className="sb__clear">Clear all</button>
        </div>
      )}
    </div>
  );
}

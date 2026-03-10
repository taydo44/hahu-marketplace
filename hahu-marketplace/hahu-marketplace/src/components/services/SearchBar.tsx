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

  const isHero = variant === "hero";

  return (
    <div className={`w-full ${className}`}>
      <div className={`flex gap-2 ${isHero ? "max-w-2xl" : ""}`}>
        <div className="flex-1 relative">
          {isPending ? (
            <Loader2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teff-400 animate-spin" />
          ) : (
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-axum-400" />
          )}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder={isHero ? "e.g. Amharic tutor, house cleaning, moving help..." : "Search services..."}
            className={`field pl-10 pr-4 ${isHero ? "h-12 text-base" : ""}`}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-secondary relative ${isHero ? "h-12" : ""} ${showFilters ? "bg-teff-50 border-teff-200 text-teff-700" : ""}`}>
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-teff-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        <button onClick={() => doSearch()} className={`btn btn-primary ${isHero ? "h-12 px-6" : ""}`}>
          Search
        </button>
      </div>

      {showFilters && (
        <div className="mt-3 p-4 card grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
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
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button onClick={() => { setCategory(""); setCity(""); }} className="btn btn-ghost btn-sm text-axum-500">Clear filters</button>
            <button onClick={() => doSearch()} className="btn btn-primary btn-sm">Apply</button>
          </div>
        </div>
      )}

      {(query || category || city) && (
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          <span className="text-xs text-axum-400 font-medium">Active:</span>
          {query && (
            <span className="badge badge-axum gap-1.5">
              &ldquo;{query}&rdquo;
              <button onClick={() => { setQuery(""); doSearch("", category, city); }} className="hover:text-harar-500"><X size={10} /></button>
            </span>
          )}
          {category && (
            <span className="badge badge-teff gap-1.5">
              {CATEGORIES.find(c => c.value === category)?.emoji}{" "}
              {CATEGORIES.find(c => c.value === category)?.label}
              <button onClick={() => { setCategory(""); doSearch(query, "", city); }} className="hover:text-harar-500"><X size={10} /></button>
            </span>
          )}
          {city && (
            <span className="badge badge-walia gap-1.5">
              📍 {city}
              <button onClick={() => { setCity(""); doSearch(query, category, ""); }} className="hover:text-harar-500"><X size={10} /></button>
            </span>
          )}
          <button onClick={clearAll} className="text-xs text-harar-500 hover:text-harar-700 ml-1 font-medium">Clear all</button>
        </div>
      )}
    </div>
  );
}

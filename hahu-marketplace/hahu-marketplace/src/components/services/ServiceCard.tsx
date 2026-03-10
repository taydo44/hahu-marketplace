import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { Service, getCategoryByValue, formatPrice } from "@/types";

interface ServiceCardProps {
  service: Service;
  variant?: "default" | "compact";
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={11} className={s <= Math.round(rating) ? "star-filled" : "star-empty"} />
        ))}
      </div>
      {count > 0 ? (
        <span className="text-xs text-axum-400">{rating.toFixed(1)} ({count})</span>
      ) : (
        <span className="text-xs text-axum-300">New</span>
      )}
    </div>
  );
}

export function ServiceCard({ service, variant = "default" }: ServiceCardProps) {
  const category = getCategoryByValue(service.category);
  const priceStr = formatPrice(service.price, service.price_type);
  const avgRating = service.avg_rating ?? 0;
  const reviewCount = service.review_count ?? 0;

  if (variant === "compact") {
    return (
      <Link href={`/services/${service.id}`} className="card card-hover group flex items-center gap-3 p-3.5">
        <div className="w-10 h-10 rounded-lg bg-teff-50 flex items-center justify-center flex-shrink-0 text-xl">
          {category?.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-axum-900 text-sm truncate group-hover:text-teff-700 transition-colors">
            {service.title}
          </p>
          <span className="text-xs text-axum-400">{service.city}</span>
        </div>
        <span className="text-sm font-semibold text-teff-600 whitespace-nowrap">{priceStr}</span>
      </Link>
    );
  }

  return (
    <Link href={`/services/${service.id}`} className="card card-hover group flex flex-col">
      <div className="h-1 bg-gradient-to-r from-teff-400 to-teff-600" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="badge badge-teff">
            <span>{category?.emoji}</span>
            {category?.label}
          </span>
          <span className="font-display text-lg text-teff-600">{priceStr}</span>
        </div>

        <h3 className="font-display text-lg text-axum-950 leading-snug mb-2 group-hover:text-teff-800 transition-colors line-clamp-2">
          {service.title}
        </h3>
        <p className="text-sm text-axum-500 leading-relaxed line-clamp-2 flex-1 mb-4">
          {service.description}
        </p>

        {service.profiles && (
          <div className="pt-3.5 border-t border-injera-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-teff-100 flex-shrink-0 overflow-hidden">
                  {service.profiles.avatar_url ? (
                    <Image src={service.profiles.avatar_url} alt={service.profiles.full_name}
                      width={24} height={24} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-teff-600 text-[10px] font-bold">
                      {service.profiles.full_name[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-axum-600 truncate">{service.profiles.full_name}</span>
              </div>
              <div className="flex items-center gap-0.5 text-axum-400 text-xs flex-shrink-0">
                <MapPin size={10} />
                <span className="truncate max-w-[80px]">{service.city.split(",")[0]}</span>
              </div>
            </div>
            <div className="mt-2">
              <StarRating rating={avgRating} count={reviewCount} />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

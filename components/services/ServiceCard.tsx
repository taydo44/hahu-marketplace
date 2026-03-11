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
    <div className="sc__stars">
      <div className="sc__stars-row">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={11} className={s <= Math.round(rating) ? "star-filled" : "star-empty"} />
        ))}
      </div>
      {count > 0 ? (
        <span className="sc__rating-text">{rating.toFixed(1)} ({count})</span>
      ) : (
        <span className="sc__new">New</span>
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
      <Link href={`/services/${service.id}`} className="sc-compact card card-hover">
        <div className="sc-compact__icon">{category?.emoji}</div>
        <div className="sc-compact__info">
          <p className="sc-compact__title">{service.title}</p>
          <span className="sc-compact__city">{service.city}</span>
        </div>
        <span className="sc-compact__price">{priceStr}</span>
      </Link>
    );
  }

  return (
    <Link href={`/services/${service.id}`} className="sc card card-hover">
      <div className="sc__stripe" />
      <div className="sc__body">
        <div className="sc__top">
          <span className="badge badge-teff">
            <span>{category?.emoji}</span>
            {category?.label}
          </span>
          <span className="sc__price">{priceStr}</span>
        </div>

        <h3 className="sc__title">{service.title}</h3>
        <p className="sc__desc">{service.description}</p>

        {service.profiles && (
          <div className="sc__footer">
            <div className="sc__prov-row">
              <div className="sc__prov-left">
                <div className="sc__avatar">
                  {service.profiles.avatar_url ? (
                    <Image src={service.profiles.avatar_url} alt={service.profiles.full_name}
                      width={24} height={24} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    service.profiles.full_name[0]?.toUpperCase()
                  )}
                </div>
                <span className="sc__prov-name">{service.profiles.full_name}</span>
              </div>
              <div className="sc__loc">
                <MapPin size={10} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: "5rem", whiteSpace: "nowrap" }}>
                  {service.city.split(",")[0]}
                </span>
              </div>
            </div>
            <StarRating rating={avgRating} count={reviewCount} />
          </div>
        )}
      </div>
    </Link>
  );
}

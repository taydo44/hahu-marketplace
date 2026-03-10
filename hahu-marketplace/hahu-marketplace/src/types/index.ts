// ============================================================
// Hahu Marketplace — Core TypeScript Types
// ============================================================

export type PriceType = "hourly" | "fixed" | "negotiable";

export type Category =
  | "cleaning"
  | "moving"
  | "babysitting"
  | "translation"
  | "tutoring"
  | "cooking"
  | "handyman"
  | "driving"
  | "other";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  city: string;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_provider: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  price: number;
  price_type: PriceType;
  category: Category;
  city: string;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  profiles?: Profile;
  reviews?: Review[];
  avg_rating?: number;
  review_count?: number;
}

export interface Review {
  id: string;
  service_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Joined
  profiles?: Profile;
}

export interface SearchFilters {
  query: string;
  category: Category | "";
  city: string;
}

// ============================================================
// Constants
// ============================================================

export const CATEGORIES: {
  value: Category;
  label: string;
  emoji: string;
  description: string;
}[] = [
  { value: "cleaning",    label: "Cleaning",     emoji: "🧹", description: "Home & office cleaning" },
  { value: "moving",      label: "Moving Help",  emoji: "📦", description: "Packing, moving & hauling" },
  { value: "babysitting", label: "Babysitting",  emoji: "👶", description: "Childcare & babysitting" },
  { value: "translation", label: "Translation",  emoji: "🌍", description: "Amharic, Somali, Tigrinya & more" },
  { value: "tutoring",    label: "Tutoring",     emoji: "📚", description: "Academic & language tutoring" },
  { value: "cooking",     label: "Cooking",      emoji: "🍽️", description: "Home cooking & catering" },
  { value: "handyman",    label: "Handyman",     emoji: "🔧", description: "Home repairs & installations" },
  { value: "driving",     label: "Driving",      emoji: "🚗", description: "Rides, errands & delivery" },
  { value: "other",       label: "Other",        emoji: "✨", description: "Other community services" },
];

export const US_CITIES_EA_DIASPORA = [
  "Atlanta, GA",
  "Boston, MA",
  "Charlotte, NC",
  "Chicago, IL",
  "Columbus, OH",
  "Dallas, TX",
  "Denver, CO",
  "Houston, TX",
  "Kansas City, MO",
  "Los Angeles, CA",
  "Miami, FL",
  "Minneapolis, MN",
  "Nashville, TN",
  "New York, NY",
  "Philadelphia, PA",
  "San Jose, CA",
  "Seattle, WA",
  "Washington, DC",
  "Other",
];

export const getCategoryByValue = (value: Category | string) =>
  CATEGORIES.find((c) => c.value === value);

export const formatPrice = (price: number, priceType: PriceType): string => {
  if (priceType === "negotiable") return "Negotiable";
  if (priceType === "hourly")     return `$${price}/hr`;
  return `$${price}`;
};

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Star, Loader2, AlertCircle, MessageSquare } from "lucide-react";
import type { Review } from "@/types";

interface ReviewSectionProps {
  serviceId: string;
  providerId: string;
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button"
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)}
          className="p-0.5 transition-transform hover:scale-110">
          <Star size={22} className={n <= (hover || value) ? "star-filled" : "text-axum-200 fill-axum-200"} />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ serviceId, providerId }: ReviewSectionProps) {
  // Stable client — created once
  const [supabase] = useState(() => createClient());

  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from("reviews").select("*, profiles(*)")
      .eq("service_id", serviceId).order("created_at", { ascending: false });
    setReviews(data ?? []);
  }, [supabase, serviceId]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
      await fetchReviews();
      if (user) {
        const { data: existing } = await supabase.from("reviews").select("id")
          .eq("service_id", serviceId).eq("reviewer_id", user.id).single();
        setHasReviewed(!!existing);
      }
      setLoading(false);
    };
    init();
  }, [supabase, serviceId, fetchReviews]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (currentUserId === providerId) { setError("You cannot review your own service."); return; }
    setSubmitting(true); setError(null);

    const { error: dbError } = await supabase.from("reviews").insert({
      service_id: serviceId, reviewer_id: currentUserId,
      rating, comment: comment.trim() || null,
    });

    if (dbError) { setError(dbError.message); }
    else { setHasReviewed(true); setRating(0); setComment(""); await fetchReviews(); }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-axum-300" /></div>;

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-display text-3xl text-axum-950">{reviews.length ? avgRating.toFixed(1) : "—"}</span>
            {reviews.length > 0 && (
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => <Star key={s} size={14} className={s <= Math.round(avgRating) ? "star-filled" : "star-empty"} />)}
              </div>
            )}
          </div>
          <p className="text-sm text-axum-400">
            {reviews.length === 0 ? "No reviews yet" : `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {currentUserId && !hasReviewed && currentUserId !== providerId && (
        <div className="card p-5 mb-6 border-teff-100">
          <h3 className="font-semibold text-axum-800 mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-teff-500" /> Leave a Review
          </h3>
          {error && (
            <div className="flex items-center gap-2 bg-harar-50 border border-harar-200 text-harar-700 px-3 py-2.5 rounded-lg text-sm mb-4">
              <AlertCircle size={14} />{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="field-label">Your Rating *</label><StarPicker value={rating} onChange={setRating} /></div>
            <div>
              <label className="field-label">Comment (optional)</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this service..." className="field min-h-[90px] resize-none" maxLength={500} />
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting && <Loader2 size={14} className="animate-spin" />} Submit Review
            </button>
          </form>
        </div>
      )}

      {hasReviewed && (
        <div className="bg-walia-50 border border-walia-200 text-walia-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
          ✓ You&apos;ve already reviewed this service
        </div>
      )}
      {!currentUserId && (
        <div className="bg-injera-50 border border-injera-200 text-axum-600 px-4 py-3 rounded-xl text-sm mb-6">
          <a href="/auth/login" className="text-teff-600 font-medium hover:underline">Sign in</a> to leave a review
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-10 text-axum-400">
          <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teff-100 flex-shrink-0 overflow-hidden">
                  {review.profiles?.avatar_url ? (
                    <Image src={review.profiles.avatar_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-teff-600 text-xs font-bold">
                      {review.profiles?.full_name[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-axum-800">{review.profiles?.full_name ?? "Anonymous"}</span>
                    <time className="text-xs text-axum-400">
                      {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </time>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map((s) => <Star key={s} size={12} className={s <= review.rating ? "star-filled" : "star-empty"} />)}
                  </div>
                  {review.comment && <p className="text-sm text-axum-600 leading-relaxed">{review.comment}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

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
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button"
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)}
          className="star-picker__btn">
          <Star size={22} className={n <= (hover || value) ? "star-filled" : "star-empty"} />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ serviceId, providerId }: ReviewSectionProps) {
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

  if (loading) return (
    <div className="loader-center" style={{ minHeight: "6rem" }}>
      <Loader2 size={20} className="animate-spin spin-icon" />
    </div>
  );

  return (
    <section>
      <div className="reviews__summary">
        <div>
          <div className="reviews__score-stars" style={{ display: "flex", alignItems: "center", gap: ".375rem", marginBottom: ".125rem" }}>
            <span className="reviews__score-num">{reviews.length ? avgRating.toFixed(1) : "—"}</span>
            {reviews.length > 0 && (
              <div style={{ display: "flex", gap: ".125rem" }}>
                {[1,2,3,4,5].map((s) => <Star key={s} size={14} className={s <= Math.round(avgRating) ? "star-filled" : "star-empty"} />)}
              </div>
            )}
          </div>
          <p className="reviews__count">
            {reviews.length === 0 ? "No reviews yet" : `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {currentUserId && !hasReviewed && currentUserId !== providerId && (
        <div className="review-form-card card">
          <h3 className="review-form-title">
            <MessageSquare size={16} /> Leave a Review
          </h3>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
              <AlertCircle size={14} className="alert-icon" />{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="review-form">
            <div>
              <label className="field-label">Your Rating *</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="field-label">Comment (optional)</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this service..." className="field" style={{ minHeight: "90px", resize: "none" }} maxLength={500} />
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting && <Loader2 size={14} className="animate-spin" />} Submit Review
            </button>
          </form>
        </div>
      )}

      {hasReviewed && (
        <div className="review-done">✓ You&apos;ve already reviewed this service</div>
      )}
      {!currentUserId && (
        <div className="review-login">
          <a href="/auth/login">Sign in</a> to leave a review
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="reviews__empty">
          <MessageSquare size={28} />
          <p style={{ fontSize: ".875rem" }}>No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="reviews__list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card card">
              <div className="review-card__inner">
                <div className="review-card__avatar">
                  {review.profiles?.avatar_url ? (
                    <Image src={review.profiles.avatar_url} alt="" width={32} height={32}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    review.profiles?.full_name[0]?.toUpperCase() ?? "?"
                  )}
                </div>
                <div className="review-card__body">
                  <div className="review-card__top">
                    <span className="review-card__name">{review.profiles?.full_name ?? "Anonymous"}</span>
                    <time className="review-card__date">
                      {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </time>
                  </div>
                  <div className="review-card__stars">
                    {[1,2,3,4,5].map((s) => <Star key={s} size={12} className={s <= review.rating ? "star-filled" : "star-empty"} />)}
                  </div>
                  {review.comment && <p className="review-card__comment">{review.comment}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

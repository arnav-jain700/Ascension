"use client";

import { useState } from "react";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/use-auth";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface ProductReviewsProps {
  productSlug: string;
  initialReviews: Review[];
}

export function ProductReviews({ productSlug, initialReviews }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [isWriting, setIsWriting] = useState(false);
  
  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const averageRating = reviews.length ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) : 0;
  
  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: reviews.filter(rev => rev.rating === r).length,
    percentage: reviews.length ? Math.round((reviews.filter(rev => rev.rating === r).length / reviews.length) * 100) : 0
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to review products.");
      return;
    }
    
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("ascension-auth-token");
      const res = await fetch(`/api/v1/products/${productSlug}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rating, title, content })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      // Reload window to fetch updated reviews natively or push to array
      setReviews([{ ...data.data, user: { id: user.id || "0", name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || "You" } }, ...reviews.filter(r => r.user.id !== user.id)]);
      setIsWriting(false);
      setTitle("");
      setContent("");
      setRating(5);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-asc-matte mb-8">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12">
        {/* Breakdown */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl font-bold text-asc-matte">{averageRating}</span>
            <div>
              <div className="flex items-center text-asc-accent mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star}>
                    {Number(averageRating) >= star ? (
                      <StarIconSolid className="w-5 h-5 text-asc-matte" />
                    ) : (
                      <StarIconOutline className="w-5 h-5 text-asc-matte/30" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-asc-charcoal">Based on {reviews.length} reviews</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-8">
            {ratingCounts.map(rc => (
              <div key={rc.stars} className="flex items-center gap-3 text-sm">
                <span className="w-12 text-asc-charcoal">{rc.stars} Stars</span>
                <div className="flex-1 h-2 bg-asc-border rounded-full overflow-hidden">
                  <div className="h-full bg-asc-matte rounded-full" style={{ width: `${rc.percentage}%` }}></div>
                </div>
                <span className="w-8 text-right text-asc-charcoal-muted">{rc.count}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsWriting(!isWriting)}
            className="w-full py-3 border-2 border-asc-matte text-asc-matte font-medium rounded-md hover:bg-asc-matte hover:text-white transition-colors"
          >
            {isWriting ? "Cancel Form" : "Write a Review"}
          </button>
        </div>

        {/* Reviews List & Form */}
        <div>
          {isWriting && (
            <div className="bg-asc-sand-muted rounded-lg p-6 mb-8 slide-down animate-in fade-in">
              <h3 className="text-lg font-semibold text-asc-matte mb-4">Share your thoughts</h3>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              {!user ? (
                <div className="bg-white p-4 rounded border border-asc-border text-center">
                  <p className="text-asc-charcoal mb-3">Please log in to leave a review.</p>
                  <a href="/auth/login" className="px-4 py-2 bg-asc-matte text-white text-sm rounded hover:bg-asc-charcoal">Log In</a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-asc-matte mb-2">Overall Rating *</label>
                    <div className="flex gap-1" onMouseLeave={() => setHoverRating(rating)}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onClick={() => setRating(star)}
                        >
                          {hoverRating >= star ? (
                            <StarIconSolid className="w-8 h-8 text-asc-matte" />
                          ) : (
                            <StarIconOutline className="w-8 h-8 text-asc-border-strong hover:text-asc-matte" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-asc-matte mb-1">Headline</label>
                    <input 
                      type="text" 
                      placeholder="What's most important to know?"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-asc-border rounded-md outline-none focus:border-asc-matte bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-asc-matte mb-1">Written Review</label>
                    <textarea 
                      rows={4}
                      placeholder="What did you like or dislike? How did it fit?"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      className="w-full px-3 py-2 border border-asc-border rounded-md outline-none focus:border-asc-matte bg-white"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-6 py-3 bg-asc-matte text-white font-medium rounded-md hover:bg-black disabled:opacity-70 transition-colors"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="space-y-8 divide-y divide-asc-border">
            {reviews.length === 0 ? (
              <p className="text-asc-charcoal italic pt-4">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="pt-8 first:pt-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-asc-sand-muted rounded-full flex items-center justify-center font-bold text-asc-matte uppercase">
                      {review.user?.name ? review.user.name.charAt(0) : "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-asc-matte text-sm flex items-center gap-2">
                        {review.user?.name || "Anonymous User"}
                        {review.isVerified && (
                          <span className="text-[10px] uppercase font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded flex items-center">
                            Verified Buyer
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-asc-charcoal-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star}>
                        {review.rating >= star ? (
                          <StarIconSolid className="w-4 h-4 text-asc-matte" />
                        ) : (
                          <StarIconSolid className="w-4 h-4 text-asc-border-strong" />
                        )}
                      </div>
                    ))}
                    {review.title && <span className="ml-2 font-medium text-asc-matte text-sm">{review.title}</span>}
                  </div>
                  
                  {review.content && (
                    <p className="text-sm text-asc-charcoal leading-relaxed">{review.content}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

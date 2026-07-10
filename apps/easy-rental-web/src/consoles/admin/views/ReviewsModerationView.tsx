'use client';
import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Star } from 'lucide-react';
import { adminService, type ReviewItem } from '@pwa-easy-rental/shared-services';

export const ReviewsModerationView = ({ onActivityChange }: { onActivityChange?: () => void }) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PUBLISHED'>('ALL');

  const loadReviews = async () => {
    setLoading(true);
    const res = await adminService.getReviews();
    if (res.ok && Array.isArray(res.data)) {
      setReviews(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleTogglePublished = async (review: ReviewItem) => {
    setUpdatingId(review.id);
    const res = await adminService.setReviewPublished(review.id, !review.published);
    if (res.ok) {
      await loadReviews();
      onActivityChange?.();
    }
    setUpdatingId(null);
  };

  const filtered = reviews.filter((review) => {
    if (filter === 'PENDING') return !review.published;
    if (filter === 'PUBLISHED') return review.published;
    return true;
  });

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0528d6] size-8" />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
        Avis landing et notes après location — publiez ceux affichés sur la page d&apos;accueil
      </p>

      <div className="flex flex-wrap gap-2">
        {(['ALL', 'PENDING', 'PUBLISHED'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === value
                ? 'bg-[#0528d6] text-white shadow-lg shadow-blue-600/20'
                : 'bg-white dark:bg-[#1a1d2d] text-slate-500 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {value === 'ALL' ? 'Tous' : value === 'PENDING' ? 'En attente' : 'Publiés'}
          </button>
        ))}
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-[#1a1d2d] shadow-sm">
        {filtered.map((review) => (
          <article
            key={review.id}
            className="p-5 border-b border-slate-100 dark:border-slate-800 last:border-b-0 flex flex-col md:flex-row md:items-start gap-4"
          >
            <div className="flex-1 space-y-2 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white italic">
                  {review.authorName ?? 'Anonyme'}
                </span>
                {review.authorRole && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {review.authorRole}
                  </span>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {review.sourceLabel ?? review.resourceType}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                    review.published
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'
                  }`}
                >
                  {review.published ? 'Publié' : 'En attente'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    size={14}
                    className={value <= (review.rating ?? 0) ? 'fill-orange-500 text-orange-500' : 'text-slate-300'}
                  />
                ))}
              </div>

              {review.comment && (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
              )}

              {review.createdAt && (
                <p className="text-[10px] text-slate-400">
                  {new Date(review.createdAt).toLocaleString('fr-FR')}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleTogglePublished(review)}
              disabled={updatingId === review.id}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
                review.published
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600'
                  : 'bg-[#0528d6] text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700'
              }`}
            >
              {updatingId === review.id ? (
                <Loader2 className="animate-spin size-4" />
              ) : review.published ? (
                <>
                  <EyeOff size={14} />
                  Dépublier
                </>
              ) : (
                <>
                  <Eye size={14} />
                  Publier
                </>
              )}
            </button>
          </article>
        ))}

        {filtered.length === 0 && (
          <p className="p-8 text-sm text-slate-400 italic text-center">Aucun avis pour ce filtre.</p>
        )}
      </div>
    </section>
  );
};

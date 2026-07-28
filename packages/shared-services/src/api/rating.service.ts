import { defaultClient as client } from './api-client';

export type Rating = {
  id: string;
  rentalId: string;
  raterType: string;
  raterId: string;
  targetType: string;
  targetId: string;
  stars: number;
  comment?: string | null;
  createdAt?: string | null;
};

export type RatingStats = {
  average: number;
  count: number;
  distribution: Record<string, number>;
};

export const ratingService = {
  /** Soumettre une note (autorisé uniquement si la location est COMPLETED côté backend). */
  submit: async (payload: {
    rentalId: string;
    raterType: 'CLIENT' | 'AGENCY';
    raterId: string;
    targetType: 'AGENCY' | 'CLIENT';
    targetId: string;
    stars: number;
    comment?: string | null;
  }) => {
    const res = await client.post<any>('/api/ratings', {
      rentalId: payload.rentalId,
      raterType: payload.raterType,
      raterId: payload.raterId,
      targetType: payload.targetType,
      targetId: payload.targetId,
      stars: payload.stars,
      comment: payload.comment ?? null,
    });
    if (!res.ok) {
      const message = (res.data?.message as string | undefined) || 'Impossible d\'envoyer la note.';
      return { ...res, data: { message } };
    }
    return res;
  },

  getAgencyRatings: (agencyId: string, page = 0, size = 20) =>
    client.get<Rating[]>(`/api/ratings/agencies/${agencyId}?page=${page}&size=${size}`),

  getAgencyStats: (agencyId: string) =>
    client.get<RatingStats>(`/api/ratings/agencies/${agencyId}/stats`),
};

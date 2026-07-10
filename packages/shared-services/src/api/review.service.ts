import { defaultClient as client } from './api-client';

export type ReviewPayload = {
  resourceId: string;
  resourceType: 'VEHICLE' | 'DRIVER';
  rating: number;
  comment?: string;
  authorName?: string;
};

export type PlatformFeedbackPayload = {
  authorName: string;
  authorRole: string;
  rating: number;
  comment?: string;
};

export type ReviewItem = {
  id: string;
  resourceId: string;
  resourceType: 'VEHICLE' | 'DRIVER' | 'PLATFORM';
  rating: number;
  comment?: string;
  authorName?: string;
  authorRole?: string;
  published: boolean;
  sourceLabel?: string;
  createdAt?: string;
};

export type ReviewModerationStats = {
  publishedCount: number;
  unpublishedCount: number;
};

function toReviewApiPayload(data: ReviewPayload) {
  return {
    resource_id: data.resourceId,
    resource_type: data.resourceType,
    rating: data.rating,
    comment: data.comment,
    author_name: data.authorName,
  };
}

function toPlatformFeedbackApiPayload(data: PlatformFeedbackPayload) {
  return {
    author_name: data.authorName,
    author_role: data.authorRole,
    rating: data.rating,
    comment: data.comment,
  };
}

export const reviewService = {
  addReview: (data: ReviewPayload) =>
    client.post<ReviewItem>('/api/reviews', toReviewApiPayload(data)),

  submitPlatformFeedback: (data: PlatformFeedbackPayload) =>
    client.post<ReviewItem>('/api/reviews/platform-feedback', toPlatformFeedbackApiPayload(data)),

  getReviews: (type: 'VEHICLE' | 'DRIVER', id: string) =>
    client.get<ReviewItem[]>(`/api/reviews/${type}/${id}`),

  getFeaturedReviews: () => client.get<{
    reviews: ReviewItem[];
    averageRating: number;
    totalCount: number;
  }>('/api/reviews/featured'),

  listAllForAdmin: () => client.get<ReviewItem[]>('/api/reviews/admin/all'),

  getModerationStats: () => client.get<ReviewModerationStats>('/api/reviews/admin/stats'),

  setPublished: (id: string, published: boolean) =>
    client.patch<ReviewItem>(`/api/reviews/admin/${id}/published`, { published }),
};

import { defaultClient as client } from './api-client';
import { extractUploadedMediaUrl, canonicalMediaStoragePath } from './media.mapper';
import { normalizeSubscriptionPlan, toPlanApiPayload } from './subscription.mapper';

export type CreatePlanPayload = {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxVehicles?: number;
  maxDrivers?: number;
  maxAgencies?: number;
  maxUsers?: number;
  hasGeofencing?: boolean;
  hasChat?: boolean;
};

export const extraService = {
  getPlans: async () => {
    const res = await client.get<Record<string, unknown>[]>('/api/subscriptions/plans');
    if (!res.ok || !Array.isArray(res.data)) {
      return res;
    }
    return { ...res, data: res.data.map((plan) => normalizeSubscriptionPlan(plan)) };
  },
  createPlan: async (data: CreatePlanPayload) => {
    const res = await client.post<Record<string, unknown>>('/api/subscriptions/plans', toPlanApiPayload(data));
    if (!res.ok || !res.data) {
      return res;
    }
    return { ...res, data: normalizeSubscriptionPlan(res.data) };
  },
  updatePlanQuotas: (id: string, data: CreatePlanPayload | Record<string, unknown>) =>
    client.put<Record<string, unknown>>(`/api/subscriptions/plans/${id}`, toPlanApiPayload(data as CreatePlanPayload)),
  getPermissions: () => client.get<any[]>('/api/permissions'),
  uploadMedia: async (formData: FormData) => {
    const res = await client.post<Record<string, unknown>>('/api/media/upload', formData);
    const url = extractUploadedMediaUrl(res.data);
    if (!res.ok || !url) {
      const message = (res.data as { message?: string } | null)?.message;
      return {
        ...res,
        ok: false,
        data: { message: message || 'Échec de l\'upload du fichier' },
      };
    }
    return { ...res, data: { url: canonicalMediaStoragePath(url) } };
  },
};
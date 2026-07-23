import { defaultClient as client } from './api-client';
import { extractUploadedMediaUrl, canonicalMediaStoragePath } from './media.mapper';
import { normalizeSubscriptionPlan, toPlanApiPayload, type PlanTargetType } from './subscription.mapper';

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
  targetType?: PlanTargetType;
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
    const token = (await import('../auth/auth-session')).getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token.trim()}`;

    let res: Response;
    try {
      res = await fetch('/api/media-upload', { method: 'POST', headers, body: formData });
    } catch {
      return { ok: false, status: 0, data: { message: 'Erreur réseau lors de l\'upload' } };
    }

    const raw = await res.json().catch(() => null) as Record<string, unknown> | null;
    const url = extractUploadedMediaUrl(raw);
    if (!res.ok || !url) {
      const message = (raw as { message?: string } | null)?.message;
      return { ok: false, status: res.status, data: { message: message || 'Échec de l\'upload du fichier' } };
    }
    return { ok: true, status: res.status, data: { url: canonicalMediaStoragePath(url) } };
  },
};
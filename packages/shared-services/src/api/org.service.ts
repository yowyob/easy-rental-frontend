import { defaultClient as client } from './api-client';
import { normalizeSubscription } from './subscription.mapper';

export type SubscriptionPaymentMethod = 'MOMO' | 'OM' | 'CARD' | 'CASH';

export const orgService = {
  getAllOrgs: () => client.get<Record<string, unknown>[]>('/api/org/all'),
  getOrgDetails: (id: string) => client.get<Record<string, unknown>>(`/api/org/${id}`),
  completeOnboarding: (data: Record<string, unknown>) => client.post<Record<string, unknown>>('/api/org/onboarding', data),
  updateOrg: (id: string, data: Record<string, unknown>) => client.put<Record<string, unknown>>(`/api/org/${id}`, data),
  upgradePlan: (id: string, planName: string, paymentMethod?: SubscriptionPaymentMethod) =>
    client.put<Record<string, unknown>>(`/api/org/${id}/subscription/upgrade`, {
      new_plan: planName,
      ...(paymentMethod ? { payment_method: paymentMethod } : {}),
    }),
  assignPlan: (id: string, planName: string) =>
    client.put<Record<string, unknown>>(`/api/org/${id}/subscription/assign`, { plan_name: planName }),
  toggleAutoRenew: (id: string, enabled: boolean) =>
    client.put<Record<string, unknown>>(`/api/org/${id}/subscription/auto-renew`, { enabled }),
  updateOrgMultipart: (id: string, formData: FormData) => 
    client.put<any>(`/api/org/${id}/multipart`, formData),
  getSubscription: async (id: string) => {
    const res = await client.get<Record<string, unknown>>(`/api/org/${id}/subscription`);
    if (!res.ok) {
      return res;
    }
    return { ...res, data: normalizeSubscription(res.data) };
  },
  getSubscriptionRemaining: (id: string) => client.get<any>(`/api/org/${id}/subscription/remaining`),
  getOrgsByPlan: (planId: string) => client.get<any[]>(`/api/org/plan/${planId}`),
  upgradeToCompany: () => client.put<Record<string, unknown>>('/api/org/upgrade-to-company', {}),
};
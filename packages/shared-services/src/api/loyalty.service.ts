import { defaultClient as client } from './api-client';
import { deepCamelize } from '../utils/camelize';

export type LoyaltyBalance = { balance: number; tier: string; annualPoints: number };
export type LoyaltyEntry = {
  id: string; clientId: string; deltaPoints: number; sourceType: string;
  sourceId?: string | null; balanceAfter: number; createdAt?: string | null;
};

export const loyaltyService = {
  getBalance: async (clientId: string) => {
    const res = await client.get<any>(`/api/loyalty/balance/${clientId}`);
    if (res.ok && res.data) return { ...res, data: deepCamelize(res.data) as LoyaltyBalance };
    return res;
  },
  getHistory: async (clientId: string) => {
    const res = await client.get<any[]>(`/api/loyalty/history/${clientId}`);
    if (res.ok && Array.isArray(res.data)) return { ...res, data: res.data.map(deepCamelize) as LoyaltyEntry[] };
    return res;
  },
};

// FILE: packages/shared-services/src/api/transaction.service.ts
import { defaultClient as client } from './api-client';
import { deepCamelize } from '../utils/camelize';

const camelizeList = (res: any) =>
  res.ok && Array.isArray(res.data) ? { ...res, data: res.data.map(deepCamelize) } : res;

export const transactionService = {
  getOrgTransactions: async (orgId: string) =>
    camelizeList(await client.get<any[]>(`/api/transactions/org/${orgId}`)),
  getAgencyTransactions: async (agencyId: string) =>
    camelizeList(await client.get<any[]>(`/api/transactions/agency/${agencyId}`)),
  getTransactionDetails: (id: string) => client.get<any>(`/api/transactions/${id}/details`),
  getClientTransactions: async () =>
    camelizeList(await client.get<any[]>(`/api/transactions/client/history`)),
};
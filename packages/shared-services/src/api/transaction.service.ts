// FILE: packages/shared-services/src/api/transaction.service.ts
import { defaultClient as client } from './api-client';

export const transactionService = {
  getOrgTransactions: (orgId: string) => client.get<any[]>(`/api/transactions/org/${orgId}`),
  getAgencyTransactions: (agencyId: string) => client.get<any[]>(`/api/transactions/agency/${agencyId}`),
  getTransactionDetails: (id: string) => client.get<any>(`/api/transactions/${id}/details`),
  getClientTransactions: () => client.get<any[]>(`/api/transactions/client/history`),
};
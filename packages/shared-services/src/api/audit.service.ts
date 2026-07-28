// FILE: packages/shared-services/src/api/audit.service.ts
import { defaultClient as client } from './api-client';

export type AuditEvent = {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata: string | null;
  createdAt: string;
};

export type AuditEventFilters = {
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};

function buildAuditQuery(filters: AuditEventFilters): string {
  const params = new URLSearchParams();
  if (filters.userId) params.set('userId', filters.userId);
  if (filters.action) params.set('action', filters.action);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.size !== undefined) params.set('size', String(filters.size));
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const auditService = {
  search: (filters: AuditEventFilters = {}) =>
    client.get<AuditEvent[]>(`/api/admin/audit-events${buildAuditQuery(filters)}`),
};

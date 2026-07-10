import { defaultClient as client } from './api-client';
import { normalizeNotificationList } from './notif.mapper';

export const notifService = {
  getOrgNotifications: async (orgId: string) => {
    const res = await client.get<unknown[]>(`/api/notifications/org/${orgId}`);
    return res.ok ? { ...res, data: normalizeNotificationList(res.data) } : res;
  },

  getAgencyNotifications: async (agencyId: string) => {
    const res = await client.get<unknown[]>(`/api/notifications/agency/${agencyId}`);
    return res.ok ? { ...res, data: normalizeNotificationList(res.data) } : res;
  },

  getClientNotifications: async (clientId: string) => {
    const res = await client.get<unknown[]>(`/api/notifications/client/${clientId}`);
    return res.ok ? { ...res, data: normalizeNotificationList(res.data) } : res;
  },

  countUnreadOrg: (orgId: string) => client.get<number>(`/api/notifications/org/${orgId}/unread/count`),

  countUnreadAgency: (agencyId: string) =>
    client.get<number>(`/api/notifications/agency/${agencyId}/unread/count`),

  countUnreadClient: (clientId: string) =>
    client.get<number>(`/api/notifications/client/${clientId}/unread/count`),

  markAsReadAgency: (id: string) => client.put<void>(`/api/notifications/${id}/read/agency`, {}),

  markAsReadOrganization: (id: string) =>
    client.put<void>(`/api/notifications/${id}/read/organization`, {}),

  markAsReadClient: (id: string) =>
    client.put<void>(`/api/notifications/${id}/read?context=CLIENT`, {}),
};

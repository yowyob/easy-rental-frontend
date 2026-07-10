import { defaultClient as client } from './api-client';
import { normalizePoste, normalizePostePayload } from './poste.mapper';

function normalizeKernelRole(item: Record<string, unknown>) {
  const id = item.id ?? item.role_id;
  const name = item.name ?? item.display_name ?? item.code;
  if (!id) return null;
  return {
    id: String(id),
    name: name != null ? String(name) : String(id),
    code: item.code != null ? String(item.code) : undefined,
  };
}

function normalizeStaffInvitePayload(data: {
  firstname: string;
  lastname: string;
  email: string;
  agencyId: string;
  kernelRoleId: string;
}) {
  return {
    firstname: data.firstname.trim(),
    lastname: data.lastname.trim(),
    email: data.email.trim().toLowerCase(),
    agency_id: data.agencyId,
    kernel_role_id: data.kernelRoleId,
  };
}

export const staffService = {
  // staff
  getStaffByOrg: (orgId: string) => client.get<any[]>(`/api/staff/org/${orgId}`),
  addStaff: (orgId: string, data: any) => client.post<any>(`/api/staff/org/${orgId}`, data),
  inviteStaff: (orgId: string, data: Parameters<typeof normalizeStaffInvitePayload>[0]) =>
    client.post<any>(`/api/staff/org/${orgId}/invite`, normalizeStaffInvitePayload(data)),
  getKernelRoles: async (orgId: string) => {
    const res = await client.get<unknown>(`/api/staff/org/${orgId}/kernel-roles`);
    const rawList = Array.isArray(res.data)
      ? res.data
      : Array.isArray((res.data as { data?: unknown })?.data)
        ? (res.data as { data: Record<string, unknown>[] }).data
        : [];
    if (!res.ok) {
      return { ...res, data: [] as { id: string; name: string; code?: string }[] };
    }
    return {
      ...res,
      data: rawList
        .map((item) => normalizeKernelRole(item as Record<string, unknown>))
        .filter((role): role is NonNullable<typeof role> => role != null),
    };
  },
  getStaffByAgency: (agencyId: string) => client.get<any[]>(`/api/staff/agency/${agencyId}`),
  getStaffDetails: (id: string) => client.get<any>(`/api/staff/${id}`),
  updateStaff: (id: string, data: any) => client.put<any>(`/api/staff/${id}`, data),
  deleteStaff: (id: string) => client.delete(`/api/staff/${id}`),

  // postes
  getPostes: async (orgId: string) => {
    const res = await client.get<unknown>(`/api/postes/org/${orgId}/postes`);
    if (!res.ok || !Array.isArray(res.data)) {
      return { ...res, data: [] as ReturnType<typeof normalizePoste>[] };
    }
    return {
      ...res,
      data: res.data
        .map((item) => normalizePoste(item as Record<string, unknown>))
        .filter(Boolean),
    };
  },
  createPoste: (orgId: string, data: Parameters<typeof normalizePostePayload>[0]) =>
    client.post<any>(`/api/postes/org/${orgId}/poste`, normalizePostePayload(data)),
  updatePoste: (id: string, data: Parameters<typeof normalizePostePayload>[0]) =>
    client.put<any>(`/api/postes/${id}`, normalizePostePayload(data)),
  getPermissions: () => client.get<any>(`/api/users/me/permissions`),
};

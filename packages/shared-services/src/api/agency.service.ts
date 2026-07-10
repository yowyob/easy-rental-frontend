import { defaultClient as client } from './api-client';
import { filterCatalogAgencies } from './catalog.filters';
import { normalizeAgency, normalizeAgencyList, toApiAgencyPayload } from './agency.mapper';
import { resolveMediaDisplayUrl } from './media.mapper';

function mapAgencyForClient(raw: ReturnType<typeof normalizeAgency>) {
  if (!raw) return null;
  const logo = raw.logoUrl ? resolveMediaDisplayUrl(String(raw.logoUrl)) : raw.logoUrl;
  return { ...raw, logoUrl: logo };
}

export const agencyService = {
  getAllAgencies: async () => {
    const res = await client.get<unknown[]>('/api/agencies/all');
    if (!res.ok) return res;
    const normalized = normalizeAgencyList(res.data)
      .map((item) => mapAgencyForClient(item))
      .filter(Boolean);
    return { ...res, data: filterCatalogAgencies(normalized) };
  },

  getAgencies: async (orgId: string) => {
    const res = await client.get<unknown[]>(`/api/agencies/org/${orgId}`);
    return res.ok ? { ...res, data: normalizeAgencyList(res.data) } : res;
  },

  createAgency: (orgId: string, data: Record<string, unknown>) =>
    client.post<Record<string, unknown>>(`/api/agencies/org/${orgId}`, toApiAgencyPayload(data)),

  getAgencyDetails: async (id: string) => {
    const res = await client.get<Record<string, unknown>>(`/api/agencies/${id}/details`);
    if (res.ok && res.data) {
      const mapped = mapAgencyForClient(normalizeAgency(res.data));
      return { ...res, data: mapped };
    }
    return res;
  },

  updateAgency: (id: string, data: Record<string, unknown>) =>
    client.put<Record<string, unknown>>(`/api/agencies/${id}`, toApiAgencyPayload(data)),

  deleteAgency: (id: string) => client.delete(`/api/agencies/${id}`),

  getAgencySearchResults: (query: string, city: string) =>
    client.get<unknown[]>(`/api/agencies/search?keyword=${query}&city=${city}`),
};

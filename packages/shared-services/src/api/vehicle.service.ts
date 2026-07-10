import { defaultClient as client } from './api-client';
import { filterCatalogVehicles } from './catalog.filters';
import {
  extractApiErrorMessage,
  normalizeVehicle,
  normalizeVehicleDetails,
  normalizeVehicleList,
  toApiVehiclePayload,
} from './vehicle.mapper';
import { toApiPricingPayload } from './driver.mapper';

async function mapVehicleListResponse(res: Awaited<ReturnType<typeof client.get<any[]>>>, clientCatalog = false) {
  if (!res.ok || !Array.isArray(res.data)) return res;
  const normalized = normalizeVehicleList(res.data);
  return { ...res, data: clientCatalog ? filterCatalogVehicles(normalized) : normalized };
}

async function mapVehicleResponse(res: Awaited<ReturnType<typeof client.get<any>>>) {
  if (!res.ok || !res.data) return res;
  return { ...res, data: normalizeVehicle(res.data as Record<string, unknown>) };
}

export const vehicleService = {
  getAvailableVehicles: async () =>
    mapVehicleListResponse(await client.get<any[]>('/api/vehicles/available'), true),
  getVehiclesByOrg: async (orgId: string) =>
    mapVehicleListResponse(await client.get<any[]>(`/api/vehicles/org/${orgId}`)),
  getVehiclesByAgency: async (agencyId: string) =>
    mapVehicleListResponse(await client.get<any[]>(`/api/vehicles/agency/${agencyId}`)),
  /** Véhicules réservables (statut AVAILABLE) — endpoint public, adapté aux formulaires réservation. */
  getAvailableVehiclesByAgency: async (agencyId: string) =>
    mapVehicleListResponse(await client.get<any[]>(`/api/vehicles/agency/${agencyId}/available`), true),
  getVehicleDetails: async (id: string) => {
    const res = await client.get<any>(`/api/vehicles/${id}/details`);
    if (!res.ok || !res.data) return res;
    return { ...res, data: normalizeVehicleDetails(res.data as Record<string, unknown>) };
  },
  createVehicle: async (orgId: string, data: Record<string, unknown>) => {
    const res = await client.post<Record<string, unknown>>(
      `/api/vehicles/org/${orgId}`,
      toApiVehiclePayload(data)
    );
    if (!res.ok) {
      return { ...res, data: { message: extractApiErrorMessage(res.data) } };
    }
    return mapVehicleResponse(res);
  },
  updateVehicle: async (id: string, data: Record<string, unknown>) => {
    const res = await client.put<Record<string, unknown>>(`/api/vehicles/${id}`, toApiVehiclePayload(data));
    if (!res.ok) {
      return { ...res, data: { message: extractApiErrorMessage(res.data) } };
    }
    return mapVehicleResponse(res);
  },
  updateVehicleStatus: (id: string, status: string) =>
    client.patch<any>(`/api/vehicles/${id}/status?status=${status}`, {}),
  updateVehiclePricing: async (
    id: string,
    data: { pricePerHour?: number; pricePerDay?: number; pricePerMonth?: number }
  ) => {
    const res = await client.put<any>(`/api/vehicles/${id}/pricing`, toApiPricingPayload(data));
    if (!res.ok) {
      return { ...res, data: { message: extractApiErrorMessage(res.data) } };
    }
    return res;
  },
  updateVehicleSchedule: async (
    id: string,
    data: { schedules: Array<{ startDate: string; endDate: string; status: string; reason?: string }> }
  ) => {
    const payload = {
      schedules: data.schedules.map((s) => ({
        start_date: s.startDate,
        end_date: s.endDate,
        status: s.status,
        reason: s.reason,
      })),
    };
    const res = await client.post<any>(`/api/vehicles/${id}/schedule`, payload);
    if (!res.ok) {
      return { ...res, data: { message: extractApiErrorMessage(res.data) } };
    }
    return res;
  },
  deleteVehicle: (id: string) => client.delete(`/api/vehicles/${id}`),

  getVehicleCategories: (orgId: string) => client.get<any[]>(`/api/vehicles/categories/org/${orgId}`),
  getAllCategories: () => client.get<any[]>('/api/vehicles/categories/all'),
  createCategory: async (orgId: string, data: any) => {
    const res = await client.post<any>(`/api/vehicles/categories/org/${orgId}`, data);
    if (!res.ok) {
      return { ...res, data: { message: extractApiErrorMessage(res.data) } };
    }
    return res;
  },
  updateCategory: async (id: string, data: any) => {
    const res = await client.put<any>(`/api/vehicles/categories/${id}`, data);
    if (!res.ok) {
      return { ...res, data: { message: extractApiErrorMessage(res.data) } };
    }
    return res;
  },
  deleteCategory: async (id: string) => {
    const res = await client.delete(`/api/vehicles/categories/${id}`);
    if (!res.ok) {
      return { ...res, data: { message: extractApiErrorMessage(res.data) } };
    }
    return res;
  },
};

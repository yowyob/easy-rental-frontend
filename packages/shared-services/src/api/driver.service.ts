import { defaultClient as client } from './api-client';
import {
  normalizeDriverDetails,
  normalizeDriverList,
  toApiPricingPayload,
} from './driver.mapper';
import { extractApiErrorMessage } from './vehicle.mapper';

async function mapDriverListResponse(res: Awaited<ReturnType<typeof client.get<any[]>>>) {
  if (!res.ok || !Array.isArray(res.data)) return res;
  return { ...res, data: normalizeDriverList(res.data) };
}

async function mapDriverDetailsResponse(res: Awaited<ReturnType<typeof client.get<any>>>) {
  if (!res.ok || !res.data) return res;
  return { ...res, data: normalizeDriverDetails(res.data as Record<string, unknown>) };
}

export const driverService = {
  getDriversByAgency: async (agencyId: string) =>
    mapDriverListResponse(await client.get<any[]>(`/api/drivers/agency/${agencyId}`)),
  createDriver: (orgId: string, formData: FormData) => client.post<any>(`/api/drivers/org/${orgId}`, formData),
  updateDriver: (id: string, formData: FormData) => client.put<any>(`/api/drivers/${id}`, formData),
  deleteDriver: (id: string) => client.delete(`/api/drivers/${id}`),
  updateDriverPricing: async (id: string, data: { pricePerHour?: number; pricePerDay?: number; pricePerMonth?: number }) => {
    const res = await client.put<any>(`/api/drivers/${id}/pricing`, toApiPricingPayload(data));
    if (!res.ok) {
      return { ...res, data: { message: extractApiErrorMessage(res.data) } };
    }
    return mapDriverDetailsResponse(res);
  },
  updateDriverStatus: (id: string, status: string) =>
    client.put<any>(`/api/drivers/${id}/status`, { status }),
  updateDriverSchedule: async (id: string, data: {
    schedules: Array<{ startDate: string; endDate: string; status: string; reason?: string }>;
  }) => {
    const payload = {
      schedules: data.schedules.map((s) => ({
        start_date: s.startDate,
        end_date: s.endDate,
        status: s.status,
        reason: s.reason,
      })),
    };
    const res = await client.post<any>(`/api/drivers/${id}/schedule`, payload);
    if (!res.ok) {
      return { ...res, data: { message: extractApiErrorMessage(res.data) } };
    }
    return mapDriverDetailsResponse(res);
  },
  getDriverDetails: async (id: string) => mapDriverDetailsResponse(await client.get<any>(`/api/drivers/${id}/details`)),
  getAvailableDrivers: async (agencyId: string, start: string, end: string) =>
    mapDriverListResponse(
      await client.get<any[]>(
        `/api/vehicles/drivers/available?agencyId=${agencyId}&startDate=${start}&endDate=${end}`
      )
    ),
};

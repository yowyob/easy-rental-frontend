import { defaultClient as client } from './api-client';
import { normalizeAgencyStats } from './agency.mapper';

export type DashboardTimeSeries = { labels: string[]; values: number[] };
export type DashboardDistribution = { distribution: Record<string, number> };

export type NormalizedDashboard = {
  summary: {
    totalAgencies: number;
    totalVehicles: number;
    totalDrivers: number;
    totalStaff: number;
    totalRentals: number;
    activeRentals: number;
    totalReservations: number;
    totalRevenue: number;
    monthlyRevenue: number;
  };
  revenueEvolution: DashboardTimeSeries;
  rentalEvolution: DashboardTimeSeries;
  vehicleStatusDistribution: DashboardDistribution;
  rentalStatusDistribution: DashboardDistribution;
  agencyComparison: Array<{
    agencyName: string;
    totalVehicles: number;
    totalRentals: number;
    revenue: number;
  }>;
};

function normalizeSeries(raw: unknown): DashboardTimeSeries {
  const series = (raw ?? {}) as { labels?: string[]; values?: number[] };
  return {
    labels: series.labels ?? [],
    values: series.values ?? [],
  };
}

function normalizeDistribution(raw: unknown): DashboardDistribution {
  const dist = (raw ?? {}) as { distribution?: Record<string, number> };
  return { distribution: dist.distribution ?? {} };
}

/** Maps API snake_case dashboard payload to camelCase for UI components. */
export function normalizeDashboard(raw: Record<string, unknown> | null): NormalizedDashboard | null {
  if (!raw) return null;
  const summary = (raw.summary ?? {}) as Record<string, unknown>;
  const agencies = (raw.agencyComparison ?? raw.agency_comparison ?? []) as Array<Record<string, unknown>>;

  return {
    summary: {
      totalAgencies: Number(summary.totalAgencies ?? summary.total_agencies ?? 0),
      totalVehicles: Number(summary.totalVehicles ?? summary.total_vehicles ?? 0),
      totalDrivers: Number(summary.totalDrivers ?? summary.total_drivers ?? 0),
      totalStaff: Number(summary.totalStaff ?? summary.total_staff ?? 0),
      totalRentals: Number(summary.totalRentals ?? summary.total_rentals ?? 0),
      activeRentals: Number(summary.activeRentals ?? summary.active_rentals ?? 0),
      totalReservations: Number(summary.totalReservations ?? summary.total_reservations ?? 0),
      totalRevenue: Number(summary.totalRevenue ?? summary.total_revenue ?? 0),
      monthlyRevenue: Number(summary.monthlyRevenue ?? summary.monthly_revenue ?? 0),
    },
    revenueEvolution: normalizeSeries(raw.revenueEvolution ?? raw.revenue_evolution),
    rentalEvolution: normalizeSeries(raw.rentalEvolution ?? raw.rental_evolution),
    vehicleStatusDistribution: normalizeDistribution(
      raw.vehicleStatusDistribution ?? raw.vehicle_status_distribution
    ),
    rentalStatusDistribution: normalizeDistribution(
      raw.rentalStatusDistribution ?? raw.rental_status_distribution
    ),
    agencyComparison: agencies.map((agency) => ({
      agencyName: String(agency.agencyName ?? agency.agency_name ?? ''),
      totalVehicles: Number(agency.totalVehicles ?? agency.total_vehicles ?? 0),
      totalRentals: Number(agency.totalRentals ?? agency.total_rentals ?? 0),
      revenue: Number(agency.revenue ?? 0),
    })),
  };
}

export const statsService = {
  getOrgReport: (orgId: string, year?: number) => 
    client.get<any>(`/api/stats/org/${orgId}/report${year ? `?year=${year}` : ''}`),
    
  getOrgDashboard: async (orgId: string, year?: number) => {
    const res = await client.get<Record<string, unknown>>(
      `/api/stats/org/${orgId}/dashboard${year ? `?year=${year}` : ''}`
    );
    if (res.ok && res.data) {
      return { ...res, data: normalizeDashboard(res.data) };
    }
    return res;
  },

  getAgencyReport: (agencyId: string, year?: number, month?: number) => {
    const y = year ?? new Date().getFullYear();
    const params = new URLSearchParams({ year: String(y) });
    if (month != null) params.set('month', String(month));
    return client.get<Record<string, unknown>>(
      `/api/stats/agency/${agencyId}/report?${params.toString()}`
    );
  },

  getAgencyDashboard: async (agencyId: string, year?: number) => {
    const res = await client.get<Record<string, unknown>>(
      `/api/stats/agency/${agencyId}/dashboard${year ? `?year=${year}` : ''}`
    );
    if (res.ok && res.data) {
      return { ...res, data: normalizeDashboard(res.data) };
    }
    return res;
  },

  getAgencyDetailedReport: async (agencyId: string, year?: number, month?: number) => {
    const y = year ?? new Date().getFullYear();
    const params = new URLSearchParams({ year: String(y) });
    if (month != null) params.set('month', String(month));
    const res = await client.get<Record<string, unknown>>(
      `/api/stats/agency/${agencyId}/report?${params.toString()}`
    );
    if (res.ok && res.data) {
      return { ...res, data: normalizeAgencyStats(res.data) };
    }
    return res;
  },
};
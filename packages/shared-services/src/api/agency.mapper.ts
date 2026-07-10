/** Maps API snake_case agency payloads to camelCase for UI. */
import { normalizeCmPhone } from '../utils/phone';
import { dedupeById } from '../utils/dedupe';

export function normalizeAgency(raw: Record<string, unknown> | null | undefined) {
  if (!raw) return null;
  return {
    id: raw.id,
    organizationId: raw.organizationId ?? raw.organization_id,
    name: raw.name,
    description: raw.description,
    address: raw.address,
    aliasAddress: raw.aliasAddress ?? raw.alias_address,
    city: raw.city,
    country: raw.country,
    postalCode: raw.postalCode ?? raw.postal_code,
    region: raw.region,
    latitude: raw.latitude,
    longitude: raw.longitude,
    geofenceRadius: raw.geofenceRadius ?? raw.geofence_radius,
    email: raw.email,
    phone: raw.phone,
    managerId: raw.managerId ?? raw.manager_id,
    is24Hours: raw.is24Hours ?? raw.is_24_hours,
    timezone: raw.timezone,
    workingHours: raw.workingHours ?? raw.working_hours,
    allowOnlineBooking: raw.allowOnlineBooking ?? raw.allow_online_booking,
    depositPercentage: raw.depositPercentage ?? raw.deposit_percentage,
    logoUrl: raw.logoUrl ?? raw.logo_url,
    primaryColor: raw.primaryColor ?? raw.primary_color,
    secondaryColor: raw.secondaryColor ?? raw.secondary_color,
    totalVehicles: raw.totalVehicles ?? raw.total_vehicles ?? 0,
    totalRentals: raw.totalRentals ?? raw.total_rentals ?? 0,
    monthlyRevenue: raw.monthlyRevenue ?? raw.monthly_revenue ?? 0,
  };
}

export function normalizeAgencyList(data: unknown) {
  if (!Array.isArray(data)) return [];
  const list = data.map((item) => normalizeAgency(item as Record<string, unknown>)).filter(Boolean);
  return dedupeById(list);
}

export function normalizeAgencyStats(raw: Record<string, unknown> | null | undefined) {
  if (!raw) return null;
  return {
    agencyName: raw.agencyName ?? raw.agency_name,
    totalRevenue: Number(raw.totalRevenue ?? raw.total_revenue ?? 0),
    monthlyRevenue: Number(raw.monthlyRevenue ?? raw.monthly_revenue ?? 0),
    yearlyRevenue: Number(raw.yearlyRevenue ?? raw.yearly_revenue ?? 0),
    totalRentals: Number(raw.totalRentals ?? raw.total_rentals ?? 0),
    activeRentals: Number(raw.activeRentals ?? raw.active_rentals ?? 0),
    completedRentals: Number(raw.completedRentals ?? raw.completed_rentals ?? 0),
    cancelledRentals: Number(raw.cancelledRentals ?? raw.cancelled_rentals ?? 0),
  };
}

/** DB stores meters (default 500 m); display in km for operators. */
export function formatGeofenceRadius(meters: unknown): string {
  const n = Number(meters);
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)} km`;
  return `${(n / 1000).toFixed(2)} km`;
}

/** Converts stored meters to km for form inputs. */
export function geofenceMetersToKm(meters: unknown): number {
  const n = Number(meters);
  if (!Number.isFinite(n) || n <= 0) return 0.5;
  return n >= 100 ? Math.round((n / 1000) * 100) / 100 : n;
}

/** Form sends km; API/DB expects meters. */
export function geofenceKmToMeters(km: unknown): number {
  const n = Number(km);
  if (!Number.isFinite(n) || n <= 0) return 500;
  return n >= 100 ? n : Math.round(n * 1000);
}

export function toApiAgencyPayload(data: Record<string, unknown>): Record<string, unknown> {
  return {
    name: data.name,
    description: data.description ?? null,
    address: data.address ?? null,
    city: data.city ?? null,
    country: data.country ?? 'CM',
    postal_code: data.postalCode ?? data.postal_code ?? null,
    region: data.region ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    manager_id: data.managerId ?? data.manager_id ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    geofence_radius: geofenceKmToMeters(data.geofenceRadius ?? data.geofence_radius),
    is_24_hours: data.is24Hours ?? data.is_24_hours ?? false,
    timezone: data.timezone ?? 'Africa/Douala',
    working_hours: data.workingHours ?? data.working_hours ?? null,
    allow_online_booking: data.allowOnlineBooking ?? data.allow_online_booking ?? true,
    deposit_percentage: data.depositPercentage ?? data.deposit_percentage ?? null,
    logo_url: data.logoUrl ?? data.logo_url ?? null,
    primary_color: data.primaryColor ?? data.primary_color ?? null,
    secondary_color: data.secondaryColor ?? data.secondary_color ?? null,
  };
}

/** Prepare agency record for edit form (geofence km, camelCase). */
export function buildAgencyFormInitialData(agency?: Record<string, unknown> | null) {
  if (!agency) {
    return {
      name: '',
      description: '',
      address: '',
      city: '',
      country: 'Cameroun',
      postalCode: '',
      region: '',
      phone: '',
      email: '',
      geofenceRadius: 0.5,
      is24Hours: true,
      workingHours: '08:00-18:00',
      allowOnlineBooking: true,
      depositPercentage: 10,
      logoUrl: '',
    };
  }
  const normalized = normalizeAgency(agency as Record<string, unknown>);
  return {
    ...normalized,
    phone: normalizeCmPhone(String(normalized?.phone ?? '')),
    geofenceRadius: geofenceMetersToKm(normalized?.geofenceRadius),
  };
}

/** Contact display with org-level fallback when agency fields are empty. */
export function resolveAgencyContact(
  agency: Record<string, unknown> | null | undefined,
  org?: Record<string, unknown> | null
) {
  const a = normalizeAgency(agency as Record<string, unknown>) ?? {};
  const o = org ?? {};
  return {
    address: a.address || a.aliasAddress || o.address || null,
    email: a.email || o.email || null,
    phone: a.phone || o.phone || null,
    city: a.city || o.city || null,
    region: a.region || o.region || null,
  };
}

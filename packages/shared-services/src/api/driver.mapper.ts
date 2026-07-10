/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PricingRates } from '../pricing/rental-pricing';

const numOrNull = (primary: unknown, fallback?: unknown): number | null => {
  const raw = primary ?? fallback;
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

/** Normalise pricing JSON (snake_case API → camelCase UI). */
export function normalizePricing(raw: Record<string, unknown> | null | undefined): PricingRates | null {
  if (!raw) return null;
  const hour = numOrNull(raw.pricePerHour, raw.price_per_hour);
  const day = numOrNull(raw.pricePerDay, raw.price_per_day);
  const month = numOrNull(raw.pricePerMonth, raw.price_per_month);
  if (hour === null && day === null && month === null) return null;
  return { pricePerHour: hour, pricePerDay: day, pricePerMonth: month };
}

export function toApiPricingPayload(data: {
  pricePerHour?: number;
  pricePerDay?: number;
  pricePerMonth?: number;
}): Record<string, number | undefined> {
  return {
    price_per_hour: data.pricePerHour,
    price_per_day: data.pricePerDay,
    price_per_month: data.pricePerMonth,
  };
}

export function normalizeScheduleItem(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    ...raw,
    id: raw.id,
    startDate: raw.startDate ?? raw.start_date,
    endDate: raw.endDate ?? raw.end_date,
    status: raw.status,
    reason: raw.reason,
  };
}

export function normalizeScheduleList(raw: unknown): Record<string, unknown>[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeScheduleItem(item as Record<string, unknown>));
}

/** Formate une date planning API (ISO ou datetime-local). */
export function formatScheduleDate(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export function normalizeDriver(raw: Record<string, unknown> | null | undefined): any | null {
  if (!raw) return null;
  const pricingRaw = (raw.pricing ?? null) as Record<string, unknown> | null;
  return {
    ...raw,
    id: raw.id,
    organizationId: raw.organizationId ?? raw.organization_id,
    agencyId: raw.agencyId ?? raw.agency_id,
    firstname: raw.firstname,
    lastname: raw.lastname,
    profilUrl: raw.profilUrl ?? raw.profil_url,
    cniUrl: raw.cniUrl ?? raw.cni_url,
    drivingLicenseUrl: raw.drivingLicenseUrl ?? raw.driving_license_url,
    cniNumber: raw.cniNumber ?? raw.cni_number,
    licenseNumber: raw.licenseNumber ?? raw.license_number,
    licenseExpiry: raw.licenseExpiry ?? raw.license_expiry,
    yearsExperience: raw.yearsExperience ?? raw.years_experience,
    pricing: normalizePricing(pricingRaw),
  };
}

export function normalizeDriverList(raw: unknown): any[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeDriver(item as Record<string, unknown>)).filter(Boolean);
}

export function normalizeDriverDetails(raw: Record<string, unknown> | null | undefined): any | null {
  if (!raw) return null;
  const driver = normalizeDriver((raw.driver ?? raw) as Record<string, unknown>);
  const pricing =
    normalizePricing((raw.pricing ?? null) as Record<string, unknown> | null) ?? driver?.pricing ?? null;
  return {
    ...raw,
    driver,
    pricing,
    schedule: normalizeScheduleList(raw.schedule),
    reviews: raw.reviews ?? [],
    rating: raw.rating ?? driver?.rating,
  };
}

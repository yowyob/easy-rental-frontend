/* eslint-disable @typescript-eslint/no-explicit-any */

const MAX_DAILY_PRICE_XAF = 5_000_000;
const MAX_HOURLY_PRICE_XAF = 500_000;
const JUNK_NAME = /^[^a-zA-Z0-9\u00C0-\u024F]/;
const MIN_BRAND_LENGTH = 3;
const MIN_MODEL_LENGTH = 2;

export const BLOCKING_SCHEDULE_STATUSES = new Set([
  'RESERVED',
  'RENTED',
  'MAINTENANCE',
  'UNAVAILABLE',
  'PENDING',
]);

export function formatXaf(value: number | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return n.toLocaleString('fr-FR');
}

export function isPublishableCatalogVehicle(vehicle: any): boolean {
  if (!vehicle?.id || !vehicle?.agencyId) return false;

  const brand = String(vehicle.brand ?? '').trim();
  const model = String(vehicle.model ?? '').trim();
  if (brand.length < MIN_BRAND_LENGTH || model.length < MIN_MODEL_LENGTH) return false;
  if (JUNK_NAME.test(brand) || JUNK_NAME.test(model)) return false;
  if (/^[a-z]{1,3}$/i.test(brand) && !/^[A-Z]/.test(brand)) return false;

  const status = String(vehicle.statut ?? 'AVAILABLE').toUpperCase();
  if (status !== 'AVAILABLE') return false;

  const day = Number(vehicle.pricing?.pricePerDay ?? 0);
  const hour = Number(vehicle.pricing?.pricePerHour ?? 0);
  if (day <= 0 && hour <= 0) return false;
  if (day > MAX_DAILY_PRICE_XAF || hour > MAX_HOURLY_PRICE_XAF) return false;

  return true;
}

export function filterCatalogVehicles(vehicles: unknown): any[] {
  if (!Array.isArray(vehicles)) return [];
  const publishable = vehicles.filter(isPublishableCatalogVehicle);
  const seen = new Set<string>();
  return publishable.filter((vehicle) => {
    const id = String(vehicle.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function isPublishableCatalogAgency(agency: any): boolean {
  if (!agency?.id) return false;
  const name = String(agency.name ?? '').trim();
  // Siège / HQ : souvent nom court ("HQ", "Siège") sans ville complète
  if (name.length < 2) return false;
  if (agency.allowOnlineBooking === false) return false;
  return true;
}

export function filterCatalogAgencies(agencies: unknown): any[] {
  if (!Array.isArray(agencies)) return [];
  const publishable = agencies.filter(isPublishableCatalogAgency);
  const seen = new Set<string>();
  return publishable.filter((agency) => {
    const id = String(agency.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function rentalPeriodOverlapsSchedule(
  startIso: string,
  endIso: string,
  schedule: Array<{ startDate?: string; endDate?: string; status?: string }> = []
): boolean {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return true;

  return schedule.some((block) => {
    const status = String(block.status ?? '').toUpperCase();
    if (!BLOCKING_SCHEDULE_STATUSES.has(status)) return false;
    const blockStart = new Date(String(block.startDate ?? '')).getTime();
    const blockEnd = new Date(String(block.endDate ?? '')).getTime();
    if (!Number.isFinite(blockStart) || !Number.isFinite(blockEnd)) return false;
    return start < blockEnd && end > blockStart;
  });
}

export function vehicleStatusLabel(statut: string | undefined, lang: 'FR' | 'EN' = 'FR'): string {
  const key = String(statut ?? 'AVAILABLE').toUpperCase();
  const fr: Record<string, string> = {
    AVAILABLE: 'Disponible',
    RENTED: 'En location',
    MAINTENANCE: 'Maintenance',
    UNAVAILABLE: 'Indisponible',
  };
  const en: Record<string, string> = {
    AVAILABLE: 'Available',
    RENTED: 'Rented',
    MAINTENANCE: 'Maintenance',
    UNAVAILABLE: 'Unavailable',
  };
  const map = lang === 'EN' ? en : fr;
  return map[key] ?? key;
}

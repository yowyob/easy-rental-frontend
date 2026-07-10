/* eslint-disable @typescript-eslint/no-explicit-any */
import { normalizePricing, normalizeScheduleList } from './driver.mapper';
import { canonicalMediaStoragePath, resolveMediaDisplayUrl } from './media.mapper';
import { dedupeById } from '../utils/dedupe';

export const DEFAULT_VEHICLE_FUNCTIONALITIES: Record<string, boolean> = {
  air_condition: true,
  usb_input: false,
  seat_belt: true,
  audio_input: false,
  child_seat: false,
  bluetooth: true,
  sleeping_bed: false,
  onboard_computer: true,
  gps: true,
  luggage: true,
  water: false,
  additional_covers: false,
};

function toDateInput(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value.split('T')[0];
  return '';
}

function nestedRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

/** Builds form state for create/edit modals (merges defaults + normalises dates). */
export function buildVehicleFormInitialData(vehicle: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!vehicle) {
    return {
      brand: '',
      model: '',
      licencePlate: '',
      vinNumber: '',
      kilometrage: 0,
      places: 5,
      color: '',
      transmission: 'MANUAL',
      agencyId: '',
      categoryId: '',
      statut: 'AVAILABLE',
      yearProduction: '',
      engineDetails: { type: '', horsepower: 0, capacity: 0 },
      insuranceDetails: { provider: '', policy_number: '', expiry: '' },
      fuelEfficiency: { city: '', highway: '' },
      functionalities: { ...DEFAULT_VEHICLE_FUNCTIONALITIES },
      images: [],
      description: [],
    };
  }

  const normalized = normalizeVehicle(vehicle) as Record<string, unknown>;
  const engine = (normalized.engineDetails ?? {}) as Record<string, unknown>;
  const fuel = (normalized.fuelEfficiency ?? {}) as Record<string, unknown>;
  const insurance = (normalized.insuranceDetails ?? {}) as Record<string, unknown>;
  const functionalities = {
    ...DEFAULT_VEHICLE_FUNCTIONALITIES,
    ...nestedRecord(normalized.functionalities),
  };

  return {
    ...normalized,
    yearProduction: toDateInput(normalized.yearProduction),
    engineDetails: {
      type: engine.type ?? '',
      horsepower: engine.horsepower ?? 0,
      capacity: engine.capacity ?? 0,
    },
    fuelEfficiency: {
      city: fuel.city ?? '',
      highway: fuel.highway ?? '',
    },
    insuranceDetails: {
      provider: insurance.provider ?? '',
      policy_number: insurance.policy_number ?? insurance.policyNumber ?? '',
      expiry: toDateInput(insurance.expiry),
    },
    functionalities,
    images: Array.isArray(normalized.images) ? normalized.images : [],
    description: Array.isArray(normalized.description) ? normalized.description : [],
  };
}

/** Maps UI camelCase vehicle payload to API snake_case (Jackson backend). */
export function toApiVehiclePayload(data: Record<string, unknown>): Record<string, unknown> {
  const engine = (data.engineDetails ?? data.engine_details ?? {}) as Record<string, unknown>;
  const fuel = (data.fuelEfficiency ?? data.fuel_efficiency ?? {}) as Record<string, unknown>;
  const insurance = (data.insuranceDetails ?? data.insurance_details ?? {}) as Record<string, unknown>;

  return {
    agency_id: data.agencyId ?? data.agency_id,
    category_id: data.categoryId ?? data.category_id,
    licence_plate: data.licencePlate ?? data.licence_plate,
    vin_number: data.vinNumber ?? data.vin_number,
    brand: data.brand,
    model: data.model,
    year_production: data.yearProduction ?? data.year_production,
    places: data.places,
    kilometrage: data.kilometrage,
    statut: data.statut,
    color: data.color,
    transmission: data.transmission,
    functionalities: data.functionalities,
    engine_details: {
      type: engine.type,
      horsepower: engine.horsepower,
      capacity: engine.capacity,
    },
    fuel_efficiency: {
      city: fuel.city,
      highway: fuel.highway,
    },
    insurance_details: {
      provider: insurance.provider,
      policy_number: insurance.policy_number ?? insurance.policyNumber,
      expiry: insurance.expiry,
    },
    description: data.description ?? [],
    images: Array.isArray(data.images)
        ? data.images.map((img) => canonicalMediaStoragePath(String(img)))
        : [],
  };
}

export function normalizeVehicle(raw: Record<string, unknown> | null | undefined): any | null {
  if (!raw) return null;

  const engine = (raw.engine_details ?? raw.engineDetails ?? {}) as Record<string, unknown>;
  const fuel = (raw.fuel_efficiency ?? raw.fuelEfficiency ?? {}) as Record<string, unknown>;
  const insurance = (raw.insurance_details ?? raw.insuranceDetails ?? {}) as Record<string, unknown>;
  const pricing = normalizePricing((raw.pricing ?? null) as Record<string, unknown> | null);

  return {
    id: raw.id,
    agencyId: raw.agencyId ?? raw.agency_id,
    categoryId: raw.categoryId ?? raw.category_id,
    licencePlate: raw.licencePlate ?? raw.licence_plate,
    vinNumber: raw.vinNumber ?? raw.vin_number,
    brand: raw.brand,
    model: raw.model,
    yearProduction: raw.yearProduction ?? raw.year_production,
    places: raw.places,
    kilometrage: raw.kilometrage,
    statut: raw.statut,
    color: raw.color,
    transmission: raw.transmission,
    functionalities: raw.functionalities,
    engineDetails: {
      type: engine.type,
      horsepower: engine.horsepower,
      capacity: engine.capacity,
    },
    fuelEfficiency: {
      city: fuel.city,
      highway: fuel.highway,
    },
    insuranceDetails: {
      provider: insurance.provider,
      policy_number: insurance.policy_number ?? insurance.policyNumber,
      expiry: insurance.expiry,
    },
    description: raw.description ?? [],
    images: Array.isArray(raw.images)
        ? raw.images
            .map((img) => resolveMediaDisplayUrl(canonicalMediaStoragePath(String(img))))
            .filter((url) => url && url.length > 0)
        : [],
    pricing,
  };
}

export function normalizeVehicleList(raw: unknown): any[] {
  if (!Array.isArray(raw)) return [];
  const list = raw.map((item) => normalizeVehicle(item as Record<string, unknown>)).filter(Boolean);
  return dedupeById(list);
}

function normalizeReviewItem(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    id: raw.id,
    authorName: raw.authorName ?? raw.author_name,
    rating: raw.rating,
    comment: raw.comment,
    createdAt: raw.createdAt ?? raw.created_at,
  };
}

/** Normalise la réponse GET /api/vehicles/{id}/details (snake_case → camelCase UI). */
export function normalizeVehicleDetails(raw: Record<string, unknown> | null | undefined): any | null {
  if (!raw) return null;
  const vehicle = normalizeVehicle((raw.vehicle ?? raw) as Record<string, unknown>);
  const pricing = normalizePricing(
    (raw.pricing ?? vehicle?.pricing ?? null) as Record<string, unknown> | null
  );
  const reviews = Array.isArray(raw.reviews)
    ? raw.reviews.map((item) => normalizeReviewItem(item as Record<string, unknown>))
    : [];
  return {
    vehicle,
    pricing,
    schedule: normalizeScheduleList(raw.schedule),
    rating: raw.rating ?? null,
    reviews,
    isDriverBookingRequired: raw.isDriverBookingRequired ?? raw.is_driver_booking_required ?? false,
  };
}

export function extractApiErrorMessage(data: unknown, fallback = 'Opération impossible'): string {
  if (!data || typeof data !== 'object') return fallback;
  const obj = data as Record<string, unknown>;
  const message = obj.message ?? obj.error;
  return typeof message === 'string' && message.length > 0 ? message : fallback;
}

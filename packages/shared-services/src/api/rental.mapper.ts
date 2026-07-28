/* eslint-disable @typescript-eslint/no-explicit-any */
import { normalizeAgency } from './agency.mapper';
import { normalizeDriver } from './driver.mapper';
import { extractApiErrorMessage, normalizeVehicle } from './vehicle.mapper';

/** Maps client rental init form (camelCase) to API snake_case. */
export function toApiRentalInitPayload(data: Record<string, unknown>): Record<string, unknown> {
  const driverId = data.driverId ?? data.driver_id;
  const driverValue = driverId != null && String(driverId).trim() !== '' ? driverId : null;
  return {
    vehicle_id: data.vehicleId ?? data.vehicle_id,
    driver_id: driverValue,
    start_date: data.startDate ?? data.start_date,
    end_date: data.endDate ?? data.end_date,
    rental_type: data.rentalType ?? data.rental_type,
    client_phone: data.clientPhone ?? data.client_phone,
    redeem_points: data.redeemPoints ?? data.redeem_points ?? undefined,
  };
}

/** Maps agency rental form (camelCase) to API snake_case. */
export function toApiAgencyRentalPayload(data: Record<string, unknown>): Record<string, unknown> {
  const driverId = data.driverId ?? data.driver_id;
  const deposit = data.requestedDeposit ?? data.initialPaymentAmount ?? data.initial_payment_amount;
  return {
    client_name: data.clientName ?? data.client_name,
    client_phone: data.clientPhone ?? data.client_phone,
    client_email: data.clientEmail ?? data.client_email ?? null,
    cni_number: data.cniNumber ?? data.cni_number ?? null,
    vehicle_id: data.vehicleId ?? data.vehicle_id,
    driver_id: driverId || null,
    start_date: data.startDate ?? data.start_date,
    end_date: data.endDate ?? data.end_date,
    rental_type: data.rentalType ?? data.rental_type,
    initial_payment_amount: deposit != null ? Number(deposit) : null,
    payment_method: data.paymentMethod ?? data.payment_method ?? 'CASH',
  };
}

/** Normalizes rental list/detail records from API snake_case to camelCase. */
export function normalizeRentalRecord(raw: Record<string, unknown> | null | undefined): any {
  if (!raw) return raw;
  return {
    ...raw,
    id: raw.id,
    clientId: raw.clientId ?? raw.client_id,
    clientName: raw.clientName ?? raw.client_name,
    clientPhone: raw.clientPhone ?? raw.client_phone,
    clientEmail: raw.clientEmail ?? raw.client_email,
    cniNumber: raw.cniNumber ?? raw.cni_number,
    agencyId: raw.agencyId ?? raw.agency_id,
    vehicleId: raw.vehicleId ?? raw.vehicle_id,
    driverId: raw.driverId ?? raw.driver_id,
    startDate: raw.startDate ?? raw.start_date,
    endDate: raw.endDate ?? raw.end_date,
    rentalType: raw.rentalType ?? raw.rental_type,
    totalAmount: raw.totalAmount ?? raw.total_amount,
    amountPaid: raw.amountPaid ?? raw.amount_paid,
    commissionAmount: raw.commissionAmount ?? raw.commission_amount,
    depositAmount: raw.depositAmount ?? raw.deposit_amount,
    licencePlate: raw.licencePlate ?? raw.licence_plate,
    status: raw.status,
    // Champs R2 (caution / inspection / tracking)
    rentalAmount: raw.rentalAmount ?? raw.rental_amount,
    cautionAmount: raw.cautionAmount ?? raw.caution_amount,
    rentalAmountPaid: raw.rentalAmountPaid ?? raw.rental_amount_paid,
    cautionAmountPaid: raw.cautionAmountPaid ?? raw.caution_amount_paid,
    cautionHeld: raw.cautionHeld ?? raw.caution_held,
    cautionDeducted: raw.cautionDeducted ?? raw.caution_deducted,
    cautionRefunded: raw.cautionRefunded ?? raw.caution_refunded,
    supplementDue: raw.supplementDue ?? raw.supplement_due,
    requestedUpfront: raw.requestedUpfront ?? raw.requested_upfront,
    startOdometer: raw.startOdometer ?? raw.start_odometer,
    endOdometer: raw.endOdometer ?? raw.end_odometer,
    trackedKm: raw.trackedKm ?? raw.tracked_km,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  };
}

export function normalizeRentalList(data: unknown): any[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeRentalRecord(item as Record<string, unknown>));
}

/** Label affiché côté agence pour une réservation. */
export function resolveRentalClientLabel(rental: Record<string, unknown> | null | undefined): string {
  if (!rental) return 'Walk-in comptoir';
  const name = String(rental.clientName ?? rental.client_name ?? '').trim();
  if (name.length > 0) return name;
  if (rental.clientId ?? rental.client_id) return 'Client en ligne';
  return 'Walk-in comptoir';
}

export function toApiPaymentPayload(data: { amount: number; method: string }): Record<string, unknown> {
  return {
    amount: data.amount,
    method: data.method,
  };
}

export function normalizeRentalInitResponse(raw: Record<string, unknown> | null | undefined): any {
  if (!raw) return null;
  const agencyRaw = (raw.agencyDetails ?? raw.agency_details ?? raw.agency) as Record<string, unknown> | undefined;
  return {
    ...raw,
    rentalId: raw.rentalId ?? raw.rental_id,
    totalAmount: raw.totalAmount ?? raw.total_amount,
    depositAmount: raw.depositAmount ?? raw.deposit_amount,
    commissionAmount: raw.commissionAmount ?? raw.commission_amount,
    isAllowed: raw.isAllowed ?? raw.is_allowed,
    loyaltyDiscount: raw.loyaltyDiscount ?? raw.loyalty_discount,
    message: raw.message,
    agency: agencyRaw ? normalizeAgency(agencyRaw) : null,
  };
}

/** Normalise GET /api/rentals/{id}/details (rental + vehicle + agency + driver). */
export function normalizeRentalDetails(raw: Record<string, unknown> | null | undefined): any {
  if (!raw) return null;
  const rental = normalizeRentalRecord((raw.rental ?? raw) as Record<string, unknown>);
  const vehicleRaw = raw.vehicle as Record<string, unknown> | undefined;
  const agencyRaw = raw.agency as Record<string, unknown> | undefined;
  const driverRaw = raw.driver as Record<string, unknown> | undefined | null;
  return {
    rental,
    vehicle: vehicleRaw ? normalizeVehicle(vehicleRaw) : null,
    agency: agencyRaw ? normalizeAgency(agencyRaw) : null,
    driver: driverRaw ? normalizeDriver(driverRaw) : null,
  };
}

export function formatRentalApiError(data: unknown, fallback = 'Impossible de traiter la réservation.'): string {
  if (!data || typeof data !== 'object') return fallback;
  const obj = data as Record<string, unknown>;
  const detail = obj.detail ?? obj.message ?? obj.error;
  let message = typeof detail === 'string' && detail.length > 0
    ? detail
    : extractApiErrorMessage(data, fallback);
  if (message.includes('startDate') || message.includes('start_date')) {
    return 'Dates de location invalides — vérifiez le départ et le retour.';
  }
  if (message === 'Access Denied') {
    return 'Accès refusé — permissions insuffisantes pour créer une réservation.';
  }
  if (message.includes('RESOURCE_ID') || message.includes('resource_id')) {
    return 'Erreur interne lors de la notification — réessayez après redémarrage du serveur.';
  }
  if (message.includes('executeMany') || message.includes('INSERT INTO notifications')) {
    return 'La réservation n\'a pas pu être finalisée (notification). Réessayez ou contactez le support.';
  }
  return message.length > 300 ? fallback : message;
}

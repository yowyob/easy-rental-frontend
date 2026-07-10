export type RentalType = 'DAILY' | 'HOURLY' | 'MONTHLY';

export const DAILY_GRACE_HOURS = 12;
export const MONTHLY_GRACE_DAYS = 15;
export const PLATFORM_COMMISSION_RATE = 0.01;
export const DEPOSIT_RATE = 0.10;
export const RESERVATION_DEPOSIT_RATE = 0.60;

export type PricingRates = {
  pricePerHour?: number | null;
  pricePerDay?: number | null;
  pricePerMonth?: number | null;
};

export type RentalQuoteInput = {
  startDate: Date;
  endDate: Date;
  rentalType: RentalType;
  vehiclePricing: PricingRates;
  driverPricing?: PricingRates | null;
};

export type RentalQuote = {
  billedUnits: number;
  unitLabel: 'h' | 'j' | 'mois';
  vehicleBaseAmount: number;
  driverBaseAmount: number;
  baseAmount: number;
  commission: number;
  deposit: number;
  total: number;
  requestedDeposit: number;
  savingsVsHourly: number;
  hourlyEquivalent: number;
};

function diffMs(start: Date, end: Date): number {
  return Math.max(0, end.getTime() - start.getTime());
}

/** Billable hours (ceil, min 1). */
export function billableHours(start: Date, end: Date): number {
  const ms = diffMs(start, end);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
}

/** Billable days with 12h grace on remainder. */
export function billableDays(start: Date, end: Date): number {
  const ms = diffMs(start, end);
  if (ms === 0) return 1;
  const fullDays = Math.floor(ms / (1000 * 60 * 60 * 24));
  const remainderHours = (ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60);
  const extraDay = remainderHours > DAILY_GRACE_HOURS ? 1 : 0;
  return Math.max(1, fullDays + extraDay);
}

/** Billable months with 15-day grace on remainder. */
export function billableMonths(start: Date, end: Date): number {
  const ms = diffMs(start, end);
  if (ms === 0) return 1;

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const dayRemainder = end.getDate() - start.getDate();
  if (dayRemainder > MONTHLY_GRACE_DAYS) {
    months += 1;
  } else if (dayRemainder < 0 && Math.abs(dayRemainder) > MONTHLY_GRACE_DAYS) {
    months += 1;
  }
  if (months < 1) {
    const totalDays = ms / (1000 * 60 * 60 * 24);
    months = totalDays > MONTHLY_GRACE_DAYS ? 2 : 1;
  }
  return Math.max(1, months);
}

function rateForType(pricing: PricingRates, type: RentalType): number {
  if (type === 'HOURLY') return Number(pricing.pricePerHour ?? 0);
  if (type === 'MONTHLY') return Number(pricing.pricePerMonth ?? 0);
  return Number(pricing.pricePerDay ?? 0);
}

function billedUnitsForType(start: Date, end: Date, type: RentalType): number {
  if (type === 'HOURLY') return billableHours(start, end);
  if (type === 'MONTHLY') return billableMonths(start, end);
  return billableDays(start, end);
}

function unitLabel(type: RentalType): 'h' | 'j' | 'mois' {
  if (type === 'HOURLY') return 'h';
  if (type === 'MONTHLY') return 'mois';
  return 'j';
}

export function computeRentalQuote(input: RentalQuoteInput, reservationMode = true): RentalQuote {
  const { startDate, endDate, rentalType } = input;
  const vehiclePricing = resolvePricingRates(input.vehiclePricing) ?? {
    pricePerHour: 0,
    pricePerDay: 0,
    pricePerMonth: 0,
  };
  const driverPricing = input.driverPricing ? resolvePricingRates(input.driverPricing) : null;
  const units = billedUnitsForType(startDate, endDate, rentalType);
  const vRate = rateForType(vehiclePricing, rentalType);
  const dRate = driverPricing ? rateForType(driverPricing, rentalType) : 0;
  const vehicleBaseAmount = units * vRate;
  const driverBaseAmount = units * dRate;
  const baseAmount = vehicleBaseAmount + driverBaseAmount;

  const hours = billableHours(startDate, endDate);
  const hourlyBase =
    hours * (rateForType(vehiclePricing, 'HOURLY') + (driverPricing ? rateForType(driverPricing, 'HOURLY') : 0));
  const savingsVsHourly = Math.max(0, hourlyBase - baseAmount);

  const commission = baseAmount * PLATFORM_COMMISSION_RATE;
  const deposit = baseAmount * DEPOSIT_RATE;
  const total = baseAmount + commission + deposit;
  const requestedDeposit = reservationMode ? total * RESERVATION_DEPOSIT_RATE : total;

  return {
    billedUnits: units,
    unitLabel: unitLabel(rentalType),
    vehicleBaseAmount,
    driverBaseAmount,
    baseAmount,
    commission,
    deposit,
    total,
    requestedDeposit,
    savingsVsHourly,
    hourlyEquivalent: hourlyBase,
  };
}

export function resolvePricingRates(raw: PricingRates | Record<string, unknown> | null | undefined): PricingRates | null {
  if (!raw) return null;
  const r = raw as Record<string, unknown>;
  return {
    pricePerHour: (r.pricePerHour ?? r.price_per_hour) as number | null | undefined,
    pricePerDay: (r.pricePerDay ?? r.price_per_day) as number | null | undefined,
    pricePerMonth: (r.pricePerMonth ?? r.price_per_month) as number | null | undefined,
  };
}
export function getPricingRate(
  pricing: PricingRates | Record<string, unknown> | null | undefined,
  type: RentalType
): number | null {
  const resolved = resolvePricingRates(pricing);
  if (!hasPricingForType(resolved, type)) return null;
  return rateForType(resolved as PricingRates, type);
}

export function hasPricingForType(
  pricing: PricingRates | Record<string, unknown> | null | undefined,
  type: RentalType
): boolean {
  const resolved = resolvePricingRates(pricing);
  if (!resolved) return false;
  if (type === 'HOURLY') return Number(resolved.pricePerHour ?? 0) > 0;
  if (type === 'MONTHLY') return Number(resolved.pricePerMonth ?? 0) > 0;
  return Number(resolved.pricePerDay ?? 0) > 0;
}

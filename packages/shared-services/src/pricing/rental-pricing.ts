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
  /** Taux de caution en fraction (ex 0.30 pour 30%). Défaut = DEPOSIT_RATE (0.10). */
  cautionRate?: number | null;
};

export type RentalQuote = {
  billedUnits: number;
  unitLabel: 'h' | 'j' | 'mois';
  /** Détail lisible de la facturation en cascade, ex. "2 jours + 3 h". */
  billedLabel: string;
  /** false si la période est nulle/inversée — dans ce cas ne pas afficher de prix. */
  valid: boolean;
  vehicleBaseAmount: number;
  driverBaseAmount: number;
  baseAmount: number;
  commission: number;
  deposit: number;
  /** Alias R2 de `deposit` — montant de la caution (escrow). */
  caution: number;
  total: number;
  requestedDeposit: number;
  savingsVsHourly: number;
  hourlyEquivalent: number;
};

/** Résultat détaillé de la facturation en cascade. */
type CascadeResult = { amount: number; label: string };

/**
 * Facturation en cascade (miroir de RentalDurationCalculator.computeBaseAmount côté backend).
 * @param combinedRates tarifs véhicule+chauffeur additionnés {hour, day, month}
 */
function computeCascade(
  start: Date,
  end: Date,
  type: RentalType,
  rates: { hour: number; day: number; month: number },
): CascadeResult {
  const ms = end.getTime() - start.getTime();
  const totalHours = ms / (1000 * 60 * 60);

  if (type === 'HOURLY') {
    const h = Math.max(1, Math.ceil(totalHours));
    return { amount: h * rates.hour, label: `${h} h` };
  }

  if (type === 'DAILY') {
    const fullDays = Math.floor(totalHours / 24);
    if (fullDays === 0) return { amount: rates.day, label: '1 jour (min)' };
    const remHours = Math.floor(totalHours - fullDays * 24);
    const extraHours = remHours > DAILY_GRACE_HOURS ? remHours - DAILY_GRACE_HOURS : 0;
    const amount = fullDays * rates.day + extraHours * rates.hour;
    const label = extraHours > 0 ? `${fullDays} jours + ${extraHours} h` : `${fullDays} jour${fullDays > 1 ? 's' : ''}`;
    return { amount, label };
  }

  // MONTHLY
  const fullMonths = fullCalendarMonths(start, end);
  if (fullMonths === 0) return { amount: rates.month, label: '1 mois (min)' };
  const anchor = new Date(start);
  anchor.setMonth(anchor.getMonth() + fullMonths);
  const remMs = end.getTime() - anchor.getTime();
  const remTotalHours = remMs / (1000 * 60 * 60);
  const remDays = Math.floor(remTotalHours / 24);
  const remHours = Math.floor(remTotalHours - remDays * 24);
  const extraDays = remDays > MONTHLY_GRACE_DAYS ? remDays - MONTHLY_GRACE_DAYS : 0;
  const extraHours = remHours > DAILY_GRACE_HOURS ? remHours - DAILY_GRACE_HOURS : 0;
  const amount = fullMonths * rates.month + extraDays * rates.day + extraHours * rates.hour;
  const parts = [`${fullMonths} mois`];
  if (extraDays > 0) parts.push(`${extraDays} j`);
  if (extraHours > 0) parts.push(`${extraHours} h`);
  return { amount, label: parts.join(' + ') };
}

/** Nombre de mois calendaires complets entre start et end. */
export function fullCalendarMonths(start: Date, end: Date): number {
  let months = 0;
  const probe = new Date(start);
  probe.setMonth(probe.getMonth() + 1);
  while (probe.getTime() <= end.getTime()) {
    months++;
    probe.setTime(start.getTime());
    probe.setMonth(start.getMonth() + months + 1);
  }
  return months;
}

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

  // Période invalide (fin ≤ début) → pas de prix affiché.
  const valid = endDate.getTime() > startDate.getTime();

  const rates = {
    hour: rateForType(vehiclePricing, 'HOURLY') + (driverPricing ? rateForType(driverPricing, 'HOURLY') : 0),
    day: rateForType(vehiclePricing, 'DAILY') + (driverPricing ? rateForType(driverPricing, 'DAILY') : 0),
    month: rateForType(vehiclePricing, 'MONTHLY') + (driverPricing ? rateForType(driverPricing, 'MONTHLY') : 0),
  };

  const cascade = computeCascade(startDate, endDate, rentalType, rates);
  const baseAmount = cascade.amount;
  // Répartition véhicule/chauffeur au prorata des tarifs de l'unité choisie.
  const vRateUnit = rateForType(vehiclePricing, rentalType);
  const dRateUnit = driverPricing ? rateForType(driverPricing, rentalType) : 0;
  const unitTotal = vRateUnit + dRateUnit;
  const vehicleBaseAmount = unitTotal > 0 ? baseAmount * (vRateUnit / unitTotal) : baseAmount;
  const driverBaseAmount = baseAmount - vehicleBaseAmount;

  const hours = billableHours(startDate, endDate);
  const hourlyBase = hours * rates.hour;
  const savingsVsHourly = Math.max(0, hourlyBase - baseAmount);

  const commission = baseAmount * PLATFORM_COMMISSION_RATE;
  // R2 : caution = base × taux caution agence (fallback 10%). Incluse dans le total.
  const cautionRate = input.cautionRate != null && input.cautionRate >= 0 ? input.cautionRate : DEPOSIT_RATE;
  const deposit = baseAmount * cautionRate;
  const total = baseAmount + commission + deposit;
  // R2 : acompte = 60% du total (caution incluse).
  const requestedDeposit = reservationMode ? total * RESERVATION_DEPOSIT_RATE : total;

  return {
    billedUnits: units,
    unitLabel: unitLabel(rentalType),
    billedLabel: cascade.label,
    valid,
    vehicleBaseAmount,
    driverBaseAmount,
    baseAmount,
    commission,
    deposit,
    caution: deposit,
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

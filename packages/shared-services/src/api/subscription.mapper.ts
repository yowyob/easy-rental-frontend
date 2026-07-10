export type NormalizedSubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  maxVehicles: number;
  maxDrivers: number;
  maxAgencies: number;
  maxUsers: number;
  hasGeofencing: boolean;
  hasChat: boolean;
  billingPeriod: 'MONTHLY' | 'YEARLY' | 'UNLIMITED';
  monthlyEquivalentPrice: number;
};

export type NormalizedSubscription = {
  planName: string;
  description: string;
  price: number;
  durationDays: number;
  maxVehicles: number;
  maxAgencies: number;
  expiresAt: string | null;
  isExpired: boolean;
  autoRenew: boolean;
  daysRemaining: number;
  renewalDueSoon: boolean;
  overQuotaAgencies: boolean;
  overQuotaVehicles: boolean;
  overQuotaDrivers: boolean;
  overQuotaUsers: boolean;
  monthlyEquivalentPrice: number;
  billingPeriod: 'MONTHLY' | 'YEARLY' | 'UNLIMITED';
};

function num(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveBillingPeriod(durationDays: number, name: string): 'MONTHLY' | 'YEARLY' | 'UNLIMITED' {
  if (name.toUpperCase() === 'FREE' || durationDays <= 0) return 'UNLIMITED';
  if (durationDays >= 360) return 'YEARLY';
  return 'MONTHLY';
}

function resolveMonthlyEquivalent(price: number, durationDays: number): number {
  if (durationDays >= 360) return Math.round(price / 12);
  return price;
}

/** Maps API snake_case subscription plan payloads to camelCase for UI. */
export function normalizeSubscriptionPlan(raw: Record<string, unknown>): NormalizedSubscriptionPlan {
  const durationDays = num(raw.durationDays ?? raw.duration_days);
  const price = num(raw.price);
  const name = String(raw.name ?? '');
  return {
    id: String(raw.id ?? ''),
    name,
    description: String(raw.description ?? ''),
    price,
    durationDays,
    maxVehicles: num(raw.maxVehicles ?? raw.max_vehicles),
    maxDrivers: num(raw.maxDrivers ?? raw.max_drivers),
    maxAgencies: num(raw.maxAgencies ?? raw.max_agencies),
    maxUsers: num(raw.maxUsers ?? raw.max_users),
    hasGeofencing: Boolean(raw.hasGeofencing ?? raw.has_geofencing),
    hasChat: Boolean(raw.hasChat ?? raw.has_chat),
    billingPeriod: resolveBillingPeriod(durationDays, name),
    monthlyEquivalentPrice: resolveMonthlyEquivalent(price, durationDays),
  };
}

/** Maps API snake_case org subscription status to camelCase for UI. */
export function normalizeSubscription(raw: Record<string, unknown> | null): NormalizedSubscription | null {
  if (!raw) return null;
  const expiresAt = (raw.expiresAt ?? raw.expires_at) as string | null | undefined;
  const durationDays = num(raw.durationDays ?? raw.duration_days);
  const price = num(raw.price);
  const planName = String(raw.planName ?? raw.plan_name ?? '');
  const billingPeriod = String(raw.billingPeriod ?? raw.billing_period ?? resolveBillingPeriod(durationDays, planName));
  return {
    planName,
    description: String(raw.description ?? ''),
    price,
    durationDays,
    maxVehicles: num(raw.maxVehicles ?? raw.max_vehicles),
    maxAgencies: num(raw.maxAgencies ?? raw.max_agencies, 1),
    expiresAt: expiresAt ?? null,
    isExpired: Boolean(raw.isExpired ?? raw.is_expired),
    autoRenew: Boolean(raw.autoRenew ?? raw.auto_renew ?? false),
    daysRemaining: num(raw.daysRemaining ?? raw.days_remaining),
    renewalDueSoon: Boolean(raw.renewalDueSoon ?? raw.renewal_due_soon),
    overQuotaAgencies: Boolean(raw.overQuotaAgencies ?? raw.over_quota_agencies),
    overQuotaVehicles: Boolean(raw.overQuotaVehicles ?? raw.over_quota_vehicles),
    overQuotaDrivers: Boolean(raw.overQuotaDrivers ?? raw.over_quota_drivers),
    overQuotaUsers: Boolean(raw.overQuotaUsers ?? raw.over_quota_users),
    monthlyEquivalentPrice: num(raw.monthlyEquivalentPrice ?? raw.monthly_equivalent_price, resolveMonthlyEquivalent(price, durationDays)),
    billingPeriod: billingPeriod as NormalizedSubscription['billingPeriod'],
  };
}

export function toPlanApiPayload(data: {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxVehicles?: number;
  maxDrivers?: number;
  maxAgencies?: number;
  maxUsers?: number;
  hasGeofencing?: boolean;
  hasChat?: boolean;
}): Record<string, unknown> {
  return {
    name: data.name,
    description: data.description,
    price: data.price,
    duration_days: data.durationDays,
    max_vehicles: data.maxVehicles,
    max_drivers: data.maxDrivers,
    max_agencies: data.maxAgencies,
    max_users: data.maxUsers,
    has_geofencing: data.hasGeofencing,
    has_chat: data.hasChat,
  };
}

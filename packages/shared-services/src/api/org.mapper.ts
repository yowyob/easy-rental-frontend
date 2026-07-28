/** Maps API snake_case organization payloads to camelCase for UI. */
export function normalizeOrganization(raw: Record<string, unknown> | null | undefined) {
  if (!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    ownerId: raw.ownerId ?? raw.owner_id,
    registrationNumber: raw.registrationNumber ?? raw.registration_number,
    taxNumber: raw.taxNumber ?? raw.tax_number,
    businessLicense: raw.businessLicense ?? raw.business_license,
    address: raw.address,
    city: raw.city,
    country: raw.country,
    postalCode: raw.postalCode ?? raw.postal_code,
    region: raw.region,
    phone: raw.phone,
    email: raw.email,
    website: raw.website,
    isVerified: Boolean(raw.isVerified ?? raw.is_verified),
    verificationDate: raw.verificationDate ?? raw.verification_date,
    currentAgencies: raw.currentAgencies ?? raw.current_agencies,
    currentVehicles: raw.currentVehicles ?? raw.current_vehicles,
    currentDrivers: raw.currentDrivers ?? raw.current_drivers,
    timezone: raw.timezone,
    logoUrl: raw.logoUrl ?? raw.logo_url,
    subscriptionPlanId: raw.subscriptionPlanId ?? raw.subscription_plan_id,
    subscriptionExpiresAt: raw.subscriptionExpiresAt ?? raw.subscription_expires_at,
    totalRentals: raw.totalRentals ?? raw.total_rentals,
    monthlyRevenue: raw.monthlyRevenue ?? raw.monthly_revenue,
    yearlyRevenue: raw.yearlyRevenue ?? raw.yearly_revenue,
    isDriverBookingRequired: Boolean(
      raw.isDriverBookingRequired ?? raw.is_driver_booking_required
    ),
    governanceStatus: raw.governanceStatus ?? raw.governance_status,
    kernelOrganizationId: raw.kernelOrganizationId ?? raw.kernel_organization_id,
    accountType: raw.accountType ?? raw.account_type,
  } as Record<string, unknown>;
}

function hasRealText(value: unknown): boolean {
  if (value == null) return false;
  const text = String(value).trim();
  return text.length > 0 && text !== 'string';
}

/**
 * Whether the organisation console can skip the initial setup wizard.
 * Aligns with backend {@code is_verified} and kernel-linked orgs in PostgreSQL.
 */
export function isOrganizationOnboarded(
  org: ReturnType<typeof normalizeOrganization> | null
): boolean {
  if (!org) return false;
  if (org.isVerified) return true;
  if (org.kernelOrganizationId) return true;
  return hasRealText(org.name) && hasRealText(org.city);
}

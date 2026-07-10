export type NotificationRecord = {
  id: string;
  locationId?: string;
  resourceId?: string;
  resourceType?: string;
  reason?: string;
  vehicleId?: string;
  driverId?: string;
  createdAt?: string;
  /** Lu côté console agence */
  isReadAgency: boolean;
  /** Lu côté console organisation */
  isReadOrg: boolean;
  details?: string;
};

export type NotificationViewContext = 'AGENCY' | 'ORGANIZATION' | 'CLIENT';

export function isNotificationRead(
  notification: Pick<NotificationRecord, 'isReadAgency' | 'isReadOrg'>,
  context: NotificationViewContext
): boolean {
  if (context === 'ORGANIZATION') return notification.isReadOrg;
  return notification.isReadAgency;
}

const REASON_LABELS_FR: Record<string, string> = {
  RESERVATION_NEW: 'Nouvelle demande de réservation',
  RESERVATION_CREATED: 'Réservation confirmée',
  PAYMENT_COMPLETED: 'Paiement complet',
  PAYMENT_RECEIVED: 'Paiement reçu',
  LOCATION_START: 'Location démarrée',
  LOCATION_END_SIGNAL: 'Retour signalé',
  LOCATION_END: 'Location terminée',
  CANCELLATION: 'Annulation',
  REFUND_PROCESSED: 'Remboursement effectué',
  MAINTENANCE_SCHEDULED: 'Maintenance planifiée',
};

export function formatNotificationReason(reason?: string, locale = 'fr'): string {
  if (!reason) return locale === 'fr' ? 'Notification système' : 'System notification';
  if (locale === 'fr') return REASON_LABELS_FR[reason] ?? reason.replaceAll('_', ' ');
  return reason.replaceAll('_', ' ');
}

export function normalizeNotificationRecord(
  raw: Record<string, unknown> | null | undefined
): NotificationRecord | null {
  if (!raw) return null;

  const legacyRead = Boolean(raw.isRead ?? raw.is_read ?? false);
  const isReadAgency = Boolean(
    raw.isReadAgency ?? raw.is_read_agency ?? legacyRead
  );
  const isReadOrg = Boolean(raw.isReadOrg ?? raw.is_read_org ?? false);

  return {
    id: String(raw.id ?? ''),
    locationId: (raw.locationId ?? raw.location_id) as string | undefined,
    resourceId: (raw.resourceId ?? raw.resource_id) as string | undefined,
    resourceType: (raw.resourceType ?? raw.resource_type) as string | undefined,
    reason: raw.reason as string | undefined,
    vehicleId: (raw.vehicleId ?? raw.vehicle_id) as string | undefined,
    driverId: (raw.driverId ?? raw.driver_id) as string | undefined,
    createdAt: (raw.createdAt ?? raw.created_at) as string | undefined,
    isReadAgency,
    isReadOrg,
    details: raw.details as string | undefined,
  };
}

export function normalizeNotificationList(data: unknown): NotificationRecord[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => normalizeNotificationRecord(item as Record<string, unknown>))
    .filter((n): n is NotificationRecord => n != null && n.id !== '');
}

export function formatNotificationDate(createdAt: string | undefined, locale = 'fr-FR'): string {
  if (!createdAt) return '—';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(locale);
}

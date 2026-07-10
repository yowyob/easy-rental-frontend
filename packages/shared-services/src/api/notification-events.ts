export const NOTIFICATIONS_REFRESH_EVENT = 'easyrental:notifications-refresh';

export type NotificationRefreshContext = 'AGENCY' | 'ORGANIZATION' | 'CLIENT';

/** Notify header badges to reload unread counts for a specific console. */
export function dispatchNotificationsRefresh(context?: NotificationRefreshContext): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(NOTIFICATIONS_REFRESH_EVENT, { detail: { context } })
    );
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import {
  notifService,
  formatNotificationDate,
  formatNotificationReason,
  isNotificationRead,
  dispatchNotificationsRefresh,
} from '@pwa-easy-rental/shared-services';
import {
  NotificationCard,
  NotificationsEmptyState,
  NotificationsFilterBar,
} from '@pwa-easy-rental/shared-ui';

export const NotificationsView = ({ orgId, t }: { orgId: string; t: any }) => {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'ALERTS'>('ALL');

  const loadNotifs = async (silent = false) => {
    if (!orgId) return;
    if (!silent) setLoading(true);
    try {
      const res = await notifService.getOrgNotifications(orgId);
      if (res.ok) setNotifs(res.data || []);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(() => loadNotifs(true), 15000);
    return () => clearInterval(interval);
  }, [orgId]);

  const handleMarkRead = async (id: string) => {
    const res = await notifService.markAsReadOrganization(id);
    if (res.ok) {
      await loadNotifs(true);
      dispatchNotificationsRefresh('ORGANIZATION');
    }
  };

  const unreadCount = notifs.filter((n) => !isNotificationRead(n, 'ORGANIZATION')).length;

  const filteredNotifs = useMemo(() => {
    return notifs.filter((n) => {
      const matchesSearch =
        n.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      const read = isNotificationRead(n, 'ORGANIZATION');
      const matchesFilter =
        filterType === 'ALL' ? true : filterType === 'UNREAD' ? !read : n.reason?.includes('ALERT');
      return matchesSearch && matchesFilter;
    });
  }, [notifs, searchTerm, filterType]);

  if (loading && notifs.length === 0)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-10 animate-spin text-[#0528d6]" />
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-20 text-left animate-in fade-in duration-500">
      <div className="mb-2 flex flex-col items-start justify-between gap-4 px-1 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
            {t.notifications.title}
          </h2>
          <div className="mt-2 flex items-center gap-3">
            <span className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase text-slate-500 dark:border-slate-700">
              {t.notifications.total}: {notifs.length}
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase text-[#0528d6] dark:border-slate-700">
              {t.notifications.unread}: {unreadCount}
            </span>
          </div>
          <p className="mt-2 text-[10px] font-medium text-slate-400">
            Historique conservé en base — lectures indépendantes des consoles agence.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadNotifs(false)}
          className="rounded-full border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition-all hover:shadow-md hover:text-[#0528d6] dark:border-slate-700 dark:bg-[#1a1d2d]"
          aria-label="Actualiser"
        >
          <Clock size={18} />
        </button>
      </div>

      <NotificationsFilterBar
        filterType={filterType}
        onFilterChange={setFilterType}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t.notifications.searchPlaceholder}
        labels={{
          all: t.notifications.tabAll,
          unread: t.notifications.tabUnread,
          alerts: t.notifications.tabAlerts,
        }}
      />

      {filteredNotifs.length === 0 ? (
        <NotificationsEmptyState message={t.notifications.noNotifs} />
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => {
            const read = isNotificationRead(n, 'ORGANIZATION');
            return (
              <NotificationCard
                key={n.id}
                title={formatNotificationReason(n.reason)}
                details={n.details}
                date={formatNotificationDate(n.createdAt)}
                read={read}
                isAlert={n.reason?.includes('ALERT')}
                locationId={n.locationId}
                onMarkRead={read ? undefined : () => handleMarkRead(n.id)}
                markAsReadLabel={t.notifications.markAsRead}
                readLabel={read ? 'Lu (organisation)' : undefined}
                folderLabel={t.notifications.folderId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { notifService, isNotificationRead } from '@pwa-easy-rental/shared-services';
import { NotificationCard, NotificationsEmptyState } from '@pwa-easy-rental/shared-ui';

export const NotificationsView = ({ clientId }: { clientId: string }) => {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = async (silent = false) => {
    if (!clientId) return;
    if (!silent) setLoading(true);
    try {
      const res = await notifService.getClientNotifications(clientId);
      if (res.ok) setNotifs(res.data || []);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(() => loadNotifs(true), 10000);
    return () => clearInterval(interval);
  }, [clientId]);

  const handleMarkRead = async (id: string) => {
    const res = await notifService.markAsReadClient(id);
    if (res.ok) {
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isReadAgency: true } : n))
      );
    }
  };

  if (loading && notifs.length === 0)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-10 animate-spin text-[#0528d6]" />
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl space-y-5 text-left animate-in fade-in duration-500">
      <div className="mb-2 flex items-center justify-between px-1">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">
            Mes Notifications
          </h2>
          <p className="mt-1 text-[10px] font-medium tracking-widest text-slate-400">
            Suivi de vos réservations et alertes en temps réel
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

      {notifs.length === 0 ? (
        <NotificationsEmptyState message="Aucune notification pour le moment" />
      ) : (
        <div className="space-y-3">
          {notifs.map((n) => {
            const read = isNotificationRead(n, 'CLIENT');
            const isAlert = n.reason?.includes('ALERT') || n.reason?.includes('CANCELLED');
            return (
              <NotificationCard
                key={n.id}
                title={n.reason || 'Information système'}
                details={n.details}
                date={new Date(n.createdAt).toLocaleString()}
                read={read}
                isAlert={isAlert}
                locationId={n.locationId}
                onMarkRead={read ? undefined : () => handleMarkRead(n.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

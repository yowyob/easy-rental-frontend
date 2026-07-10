'use client';

import React from 'react';
import { AlertTriangle, Check, Info } from 'lucide-react';

export interface NotificationCardProps {
  title: string;
  details: string;
  date: string;
  read: boolean;
  isAlert?: boolean;
  locationId?: string | null;
  onMarkRead?: () => void;
  markAsReadLabel?: string;
  readLabel?: string;
  folderLabel?: string;
}

/**
 * Notification row with a subtle Google-search-like border (uniform, no left accent).
 */
export const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  details,
  date,
  read,
  isAlert = false,
  locationId,
  onMarkRead,
  markAsReadLabel = 'Marquer comme lu',
  readLabel,
  folderLabel = 'Dossier',
}) => (
  <article
    className={`group flex items-start gap-4 rounded-2xl border px-5 py-4 transition-all ${
      read
        ? 'border-slate-200/80 bg-white/70 opacity-80 dark:border-slate-800 dark:bg-[#1a1d2d]/50'
        : 'border-slate-200 bg-white shadow-sm hover:shadow-md dark:border-slate-700 dark:bg-[#1a1d2d]'
    }`}
  >
    <div
      className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
        isAlert ? 'text-amber-500' : 'text-slate-400'
      }`}
      aria-hidden
    >
      {isAlert ? <AlertTriangle size={16} /> : <Info size={16} />}
    </div>

    <div className="min-w-0 flex-1">
      <div className="mb-1.5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {!read && (
            <span
              className="size-2 shrink-0 rounded-full bg-[#0528d6]"
              aria-label="Non lue"
            />
          )}
          <h4
            className={`truncate text-xs uppercase tracking-tight text-slate-900 dark:text-white ${
              read ? 'font-semibold' : 'font-black italic'
            }`}
          >
            {title}
          </h4>
        </div>
        <time className="shrink-0 text-[10px] font-medium text-slate-400">{date}</time>
      </div>

      <p className="mb-3 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
        {details}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {read && readLabel ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold uppercase text-slate-500 dark:border-slate-700">
            <Check size={10} />
            {readLabel}
          </span>
        ) : (
          !read &&
          onMarkRead && (
            <button
              type="button"
              onClick={onMarkRead}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold uppercase text-[#0528d6] transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Check size={10} />
              {markAsReadLabel}
            </button>
          )
        )}
        {locationId && (
          <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700">
            {folderLabel}: #{locationId.substring(0, 8)}
          </span>
        )}
      </div>
    </div>
  </article>
);

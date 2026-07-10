'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export interface NotificationsEmptyStateProps {
  message: string;
}

export const NotificationsEmptyState: React.FC<NotificationsEmptyStateProps> = ({ message }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center dark:border-slate-800 dark:bg-[#1a1d2d]">
    <Bell className="mx-auto mb-4 text-slate-200 dark:text-slate-700" size={44} aria-hidden />
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{message}</p>
  </div>
);

'use client';

import React from 'react';
import { Search } from 'lucide-react';

export type NotificationFilterType = 'ALL' | 'UNREAD' | 'ALERTS';

export interface NotificationsFilterBarProps {
  filterType: NotificationFilterType;
  onFilterChange: (type: NotificationFilterType) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  labels: {
    all: string;
    unread: string;
    alerts: string;
  };
}

/**
 * Filter tabs + search field styled like a Google search bar (subtle border, soft shadow).
 */
export const NotificationsFilterBar: React.FC<NotificationsFilterBarProps> = ({
  filterType,
  onFilterChange,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  labels,
}) => {
  const tabs: Array<{ id: NotificationFilterType; label: string }> = [
    { id: 'ALL', label: labels.all },
    { id: 'UNREAD', label: labels.unread },
    { id: 'ALERTS', label: labels.alerts },
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="inline-flex w-full shrink-0 rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-[#1a1d2d] lg:w-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={`flex-1 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wide transition-all lg:flex-none ${
              filterType === tab.id
                ? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="group relative w-full">
        <Search
          className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-600"
          aria-hidden
        />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-5 text-sm text-slate-800 shadow-sm outline-none transition-shadow placeholder:text-slate-400 hover:shadow-md focus:shadow-md dark:border-slate-700 dark:bg-[#1a1d2d] dark:text-white"
        />
      </div>
    </div>
  );
};

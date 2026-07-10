'use client';
import React from 'react';

type HeaderIconButtonProps = {
  onClick: () => void;
  'aria-label': string;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export const HeaderIconButton = ({
  onClick,
  'aria-label': ariaLabel,
  title,
  children,
  className = '',
}: HeaderIconButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    title={title ?? ariaLabel}
    className={`inline-flex items-center justify-center gap-1.5 min-h-10 min-w-10 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#0528d6] hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0528d6]/40 ${className}`}
  >
    {children}
  </button>
);

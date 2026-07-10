// FILE: apps/mfe-agency/src/components/StatCard.tsx
'use client';
import React from 'react';

export const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
  <div className="bg-white dark:bg-[#1a1d2d] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-5 shadow-sm transition-all hover:shadow-md">
    <div className="size-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-[#0528d6] shadow-inner shrink-0 group">
      {React.cloneElement(icon as React.ReactElement, { size: 24, className: "group-hover:scale-110 transition-transform" })}
    </div>
    <div className="overflow-hidden text-left">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] italic mb-0.5 truncate">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none truncate tracking-tighter italic">{value}</p>
    </div>
  </div>
);
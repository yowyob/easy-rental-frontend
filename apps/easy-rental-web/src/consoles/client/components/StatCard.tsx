'use client';
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}

export const StatCard = ({ label, value, icon, className = "" }: StatCardProps) => {
  return (
    <div className={`bg-white dark:bg-[#1a1d2d] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-5 shadow-sm transition-all hover:shadow-md ${className}`}>
      <div className="size-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[#0528d6] shadow-inner shrink-0">
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement, { size: 22 }) 
          : icon
        }
      </div>
      <div className="text-left overflow-hidden">
        <p className="text-[11px] font-bold  text-slate-400 tracking-widest italic mb-0.5 truncate">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none truncate">
          {value}
        </p>
      </div>
    </div>
  );
};
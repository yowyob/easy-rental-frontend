/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';

export const KpiCard = ({ label, value, growth, icon, badge, highlight, className = "" }: any) => (
  <div className={`p-6 rounded-[2.5rem] border flex flex-col justify-between h-44 transition-all bg-white dark:bg-[#1a1d2d] shadow-sm hover:shadow-md text-left ${highlight ? 'border-orange-200 dark:border-orange-500/30' : 'border-slate-100 dark:border-slate-800'} ${className}`}>
    <div className="flex justify-between items-start">
      <div className={`p-4 rounded-2xl ${highlight ? 'bg-orange-50 dark:bg-orange-500/10 text-[#F76513]' : 'bg-slate-50 dark:bg-slate-800 text-[#0528d6]'}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <div className="flex flex-col items-end gap-1">
        {growth && <span className={`text-[10px] font-black italic uppercase ${growth.includes('+') ? 'text-green-600' : 'text-red-500'}`}>{growth}</span>}
        {badge && <span className="bg-[#F76513] text-white text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest italic shadow-sm">{badge}</span>}
      </div>
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 italic leading-none">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">{value}</h3>
        {highlight && <div className="size-2 bg-[#F76513] rounded-full animate-ping" />}
      </div>
    </div>
  </div>
);
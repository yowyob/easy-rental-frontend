/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { Calendar, MapPin, ArrowUpRight, Info, Banknote } from 'lucide-react';

export const RentalCard = ({ rental, onView }: any) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ONGOING': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'PAID': return 'bg-green-50 text-green-700 border-green-100';
      case 'RESERVED': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'COMPLETED': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-red-50 text-red-700 border-red-100';
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col h-full text-left">
      <div className="flex justify-between items-start mb-8">
        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(rental.status)}`}>
          {rental.status}
        </div>
        <button onClick={() => onView(rental)} className="size-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#0528d6] transition-all">
          <Info size={18}/>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center size-11 rounded-xl bg-blue-600 text-white font-semibold text-base shadow-md">
          {rental.clientName?.[0]}
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {rental.clientName}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {rental.clientPhone}
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-8 pt-4 border-t border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 italic">
          <Calendar size={14} className="text-[#0528d6]" /> 
          <span>{new Date(rental.startDate).toLocaleDateString()} — {new Date(rental.endDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 italic">
          <Banknote size={14} className="text-[#0528d6]" /> 
          <span className="font-black text-slate-900 dark:text-white">{rental.totalAmount?.toLocaleString()} XAF</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin size={12} className="text-orange-500"/>
          <span className="text-[9px] font-black uppercase italic tracking-widest">Dossier #{rental.id.substring(0,8)}</span>
        </div>
        <div className="size-8 bg-slate-900 text-white rounded-lg flex items-center justify-center group-hover:bg-[#0528d6] transition-all">
            <ArrowUpRight size={14}/>
        </div>
      </div>
    </div>
  );
};
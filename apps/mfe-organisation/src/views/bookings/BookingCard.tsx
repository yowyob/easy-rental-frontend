/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { User, Calendar, MapPin, ArrowUpRight, Info, Banknote } from 'lucide-react';

interface BookingCardProps {
  rental: any;
  onView: () => void;
  t: any;
}

export const BookingCard = ({ rental, onView, t }: BookingCardProps) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ONGOING': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PAID': return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'RESERVED': return 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'COMPLETED': return 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800';
    }
  };

  // Helper pour obtenir le label traduit du statut
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ONGOING': t.rentals.statusOngoing,
      'PAID': t.rentals.statusPaid,
      'RESERVED': t.rentals.statusReserved,
      'COMPLETED': t.rentals.statusCompleted,
      'CANCELLED': t.rentals.statusCancelled,
    };
    return labels[status] || status;
  };

  return (
    <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col h-full text-left relative overflow-hidden">
      
      {/* Badge de Statut */}
      <div className="flex justify-between items-start mb-8">
        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border italic ${getStatusStyle(rental.status)}`}>
          {getStatusLabel(rental.status)}
        </div>
        <button 
          onClick={onView} 
          title={t.common.view}
          className="size-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#0528d6] transition-all shadow-inner"
        >
          <Info size={18}/>
        </button>
      </div>

      {/* Infos Client */}
      <div className="flex items-center gap-4 mb-6">
        <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#0528d6] font-black text-lg italic shadow-inner">
          {rental.clientName?.[0] || <User size={20}/>}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate leading-tight">
            {rental.clientName}
          </h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase italic tracking-widest truncate mt-0.5">
            {rental.clientPhone}
          </p>
        </div>
      </div>

      {/* Dates & Prix */}
      <div className="space-y-4 mb-8 pt-4 border-t border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-3 text-[11px] font-black text-slate-500 dark:text-slate-400 italic">
          <Calendar size={14} className="text-[#0528d6]" /> 
          <span>{new Date(rental.startDate).toLocaleDateString()} — {new Date(rental.endDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-black text-slate-500 dark:text-slate-400 italic">
          <Banknote size={14} className="text-[#0528d6]" /> 
          <span className="text-slate-900 dark:text-white text-sm font-black tracking-tighter">
            {rental.totalAmount?.toLocaleString()} <span className="text-[9px] opacity-50 uppercase">{t.common.currency}</span>
          </span>
        </div>
      </div>

      {/* Footer avec ID Dossier */}
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin size={12} className="text-orange-500"/>
          <span className="text-[9px] font-black uppercase italic tracking-[0.1em]">
            {t.bookingCard.folderPrefix} #{rental.id.substring(0,8).toUpperCase()}
          </span>
        </div>
        <button 
          onClick={onView}
          className="size-8 bg-slate-900 dark:bg-slate-700 text-white rounded-lg flex items-center justify-center group-hover:bg-[#0528d6] group-hover:scale-110 transition-all shadow-md"
        >
            <ArrowUpRight size={14}/>
        </button>
      </div>
    </div>
  );
};
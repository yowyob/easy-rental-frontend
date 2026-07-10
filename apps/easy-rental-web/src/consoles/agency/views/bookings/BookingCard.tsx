/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { User, Car, Phone, Info, CheckCircle2 } from 'lucide-react';
import { hasPermission } from '../../utils/permissions';

interface BookingCardProps {
    rental: any;
    userData: any;
    onStart?: () => void;
    onConfirmDeposit?: () => void;
    onView: () => void;
    staffPermissions: any;
    t: any;
    variant?: 'active' | 'history';
}

export const BookingCard = ({
  rental,
  userData,
  onStart,
  onConfirmDeposit,
  staffPermissions,
  onView,
  t,
  variant = 'active',
}: BookingCardProps) => {
  const isPaidTotal = rental.amountPaid >= rental.totalAmount;
  const remaining = Math.max(0, Number(rental.totalAmount ?? 0) - Number(rental.amountPaid ?? 0));
  const depositShare = Number(rental.totalAmount ?? 0) > 0
    ? Math.round((Number(rental.amountPaid ?? 0) / Number(rental.totalAmount)) * 100)
    : 0;

  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'PAID': return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'ONGOING': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'COMPLETED': return 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'RESERVED': return 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'UNDER_REVIEW': return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      default: return 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-left flex flex-col h-full relative overflow-hidden group">
      
      <div className="flex justify-between items-start mb-8">
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border italic ${getStatusStyle(rental.status)}`}>
            {rental.status}
        </div>
        <button onClick={onView} className="size-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#0528d6] transition-all">
            <Info size={18}/>
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#0528d6] shrink-0 border border-white dark:border-slate-700">
            <User size={24} />
        </div>
        <div className="overflow-hidden">
          <h4 className="font-black text-slate-800 dark:text-white leading-tight truncate uppercase italic tracking-tighter leading-none">
            {rental.clientName?.trim() || (rental.clientId ? 'Client en ligne' : 'Walk-in comptoir')}
          </h4>
          <p className="flex items-center gap-2 mt-1 text-slate-400 font-bold text-[10px] uppercase italic">
            <Phone size={10} className="text-[#0528d6]"/> {rental.clientPhone}
          </p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 mb-8 grid grid-cols-2 gap-4 border border-slate-100 dark:border-slate-800">
        <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-400 uppercase italic">{t.table.start}</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{new Date(rental.startDate).toLocaleDateString()}</p>
        </div>
        <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-400 uppercase italic">{t.table.end}</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{new Date(rental.endDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 space-y-5">
        <div className="flex justify-between items-end">
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase italic mb-1">{t.kpi.revenue}</p>
                <div className="flex items-baseline gap-1">
                    <span className={`text-xl font-black ${isPaidTotal ? 'text-green-500' : 'text-[#0528d6]'}`}>
                        {Number(rental.amountPaid ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 italic">/ {Number(rental.totalAmount ?? 0).toLocaleString()} XAF</span>
                </div>
                <p className="text-[8px] font-bold text-slate-400 italic mt-1">
                  {t.booking?.totalIncludesFees ?? 'Total dossier (véhicule + chauffeur + frais)'}
                  {depositShare > 0 && !isPaidTotal ? ` · Acompte ${depositShare}%` : ''}
                </p>
            </div>
            {!isPaidTotal && remaining > 0 && (
                <div className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded text-[8px] font-black uppercase italic animate-pulse">
                    {t.booking?.balanceAtHandover ?? 'Solde à la remise'}: {remaining.toLocaleString()}
                </div>
            )}
        </div>

        {variant === 'history' && (
          <p className="text-[8px] font-bold text-slate-400 italic -mt-4 mb-4">
            {t.reservations?.historyHint ?? 'Dossier transformé en location ou clôturé'}
          </p>
        )}

        <div className="flex gap-2">
            {variant === 'active' && onConfirmDeposit && hasPermission(userData, staffPermissions, 'rental:create') && (
                <button onClick={onConfirmDeposit} className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black text-[11px] uppercase flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all italic tracking-widest">
                    <CheckCircle2 size={18}/>
                    {t.reservations?.confirmDeposit ?? 'Encaisser acompte 60 %'}
                </button>
            )}
            {variant === 'active' && onStart && hasPermission(userData, staffPermissions, 'rental:create') && (
                <button onClick={onStart} className="flex-1 py-4 bg-[#0528d6] text-white rounded-2xl font-black text-[11px] uppercase flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all italic tracking-widest">
                    <Car size={18}/> 
                    {isPaidTotal ? t.table.handover : t.reservations.actionStart}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
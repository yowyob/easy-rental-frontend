/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { X, Loader2, Banknote, Calendar, Tag, ArrowUpRight, ArrowDownRight, CreditCard, Activity } from 'lucide-react';
import { transactionService } from '@pwa-easy-rental/shared-services';
import { Portal } from '../../components/Portal';

export const TransactionDetailsModal = ({ transactionId, onClose, t }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    transactionService.getTransactionDetails(transactionId).then(res => {
      if (isMounted) {
        if (res.ok) setData(res.data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [transactionId]);

  if (loading) return <Portal><div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md"><Loader2 className="animate-spin text-white size-12" /></div></Portal>;

  const isIncome = data.type === 'RENTAL_INCOME' || data.type === 'RENTAL_PAYMENT';
  const absAmount = Math.abs(data.amount || 0);
  const isSuccess = ['SUCCESS', 'COMPLETED', 'ACTIVE', 'PAID'].includes(data.status?.toUpperCase());

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4 text-left">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-[#1a1d2d] rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20 animate-in zoom-in">
          
          <div className="px-6 md:px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{t.sidebar.transactions}</h3>
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border italic ${isSuccess ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30' : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30'}`}>{data.status}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic leading-none">REF ID: {data.reference}</p>
            </div>
            <button onClick={onClose} className="size-12 bg-white dark:bg-slate-800 flex items-center justify-center rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><X size={24}/></button>
          </div>

          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-10">
            <div className="flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                <div className={`size-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isIncome ? <ArrowUpRight size={32}/> : <ArrowDownRight size={32}/>}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 italic">{t.table.amount}</p>
                <p className={`text-4xl md:text-5xl font-black italic tracking-tighter ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                    {isIncome ? '+' : '-'}{absAmount.toLocaleString()} <span className="text-sm opacity-50">XAF</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <section className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-[#0528d6] dark:text-blue-400 italic border-b dark:border-slate-800 pb-2 flex items-center gap-2"><Tag size={14}/> {t.onboarding.step1Title}</h4>
                    <DataRow label="Nature" value={isIncome ? t.table.income : t.table.refund} />
                    <DataRow label={t.table.method} value={data.method || 'Automatique'} icon={<CreditCard size={12}/>} />
                    <DataRow label="Date Flux" value={new Date(data.date).toLocaleString()} icon={<Calendar size={12}/>} />
                </section>
                <section className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-[#0528d6] dark:text-blue-400 italic border-b dark:border-slate-800 pb-2 flex items-center gap-2"><Banknote size={14}/> {t.onboarding.form.vision}</h4>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 leading-relaxed italic">{data.description || 'N/A'}</p>
                </section>
            </div>

            {(data.rentalDetails || data.planDetails) && (
                <div className="p-7 bg-[#0528d6]/5 dark:bg-blue-900/10 border-2 border-[#0528d6]/10 dark:border-blue-800/30 rounded-[2.5rem]">
                    <h4 className="text-xs font-black uppercase text-[#0528d6] dark:text-blue-400 italic mb-5 flex items-center gap-2 tracking-widest"><Activity size={16}/> {t.table.viewAll || 'Lien Système'}</h4>
                    <div className="space-y-3">
                        {data.rentalDetails && (
                            <>
                                <DataRow label={t.table.customer} value={data.rentalDetails.rental?.clientName} dark />
                                <DataRow label="ID Dossier" value={data.rentalDetails.rental?.id.substring(0,18)} mono dark />
                            </>
                        )}
                        {data.planDetails && (
                            <>
                                <DataRow label="Plan" value={data.planDetails.name} dark />
                                <DataRow label="Validité" value={`${data.planDetails.durationDays} ${t.vehicles.modal.days}`} dark />
                            </>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

const DataRow = ({ label, value, dark, icon, mono }: any) => (
    <div className="flex justify-between items-center gap-4">
        <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400 whitespace-nowrap">{label}</span>
        <div className="flex items-center gap-2 overflow-hidden">
            {icon && <span className="text-[#0528d6] dark:text-blue-400">{icon}</span>}
            <span className={`text-sm font-black italic truncate ${dark ? 'text-slate-800 dark:text-slate-200' : 'text-slate-900 dark:text-white'} ${mono ? 'font-mono uppercase' : ''}`}>{value || '---'}</span>
        </div>
    </div>
);
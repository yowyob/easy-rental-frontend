/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { AlertTriangle, ArrowUpCircle, ShieldCheck } from 'lucide-react';
import { Portal } from './Portal';

export const QuotaAlertModal = ({ onClose, onUpgrade, type, limit, t }: any) => (
  <Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1d2d] rounded-[3rem] shadow-2xl p-10 text-center animate-in zoom-in border border-white/20">
        <div className="size-20 bg-orange-50 dark:bg-orange-500/10 rounded-3xl flex items-center justify-center text-[#F76513] mx-auto mb-6 shadow-inner">
          <AlertTriangle size={40} />
        </div>
        
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none mb-4">
          {t.quota.title}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-8">
          {t.quota.description1}{' '}
          <span className="font-black text-slate-900 dark:text-white uppercase">
            {limit} {type}
          </span>. {t.quota.description2}
        </p>

        <div className="space-y-3">
          <button 
            onClick={onUpgrade} 
            className="w-full py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 italic tracking-widest"
          >
            <ArrowUpCircle size={18} /> {t.quota.upgradeButton}
          </button>
          
          <button 
            onClick={onClose} 
            className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors italic"
          >
            {t.common.cancel}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t dark:border-slate-800 flex items-center justify-center gap-2">
           <ShieldCheck size={14} className="text-blue-500" />
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
             {t.quota.secureBilling}
           </span>
        </div>
      </div>
    </div>
  </Portal>
);
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { Mail, Store, Shield, Edit3, Trash2, Info, CheckCircle2, UserX } from 'lucide-react';

export const StaffCard = ({ staff, agencies, onEdit, onDelete, onView, t }: any) => {
  const agencyName = agencies.find((a: any) => a.id === staff.agencyId)?.name || t.staff.noAgency || 'Siège';
  
  return (
    <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col h-full text-left relative overflow-hidden">
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-[#0528d6] text-white flex items-center justify-center font-black text-xl italic shadow-lg shadow-blue-600/20 shrink-0 uppercase">
            {staff.firstname?.[0]}{staff.lastname?.[0]}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-black text-slate-900 dark:text-white leading-tight uppercase italic tracking-tighter truncate text-lg">
              {staff.firstname} {staff.lastname}
            </h4>
            <div className="flex items-center gap-1.5 mt-1.5 text-[#0528d6] dark:text-blue-400">
              <Shield size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest italic truncate">
                {staff.poste?.name || t.staff.noPoste}
              </span>
            </div>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest italic border ${
          staff.status === 'ACTIVE' 
          ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400' 
          : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {staff.status === 'ACTIVE' ? <div className="flex items-center gap-1"><CheckCircle2 size={10}/> ACTIVE</div> : <div className="flex items-center gap-1"><UserX size={10}/> SUSPENDED</div>}
        </div>
      </div>

      <div className="space-y-3 mb-8 pt-6 border-t border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 italic">
          <Mail size={14} className="text-[#0528d6] dark:text-blue-400" /> <span className="truncate">{staff.email}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 italic">
          <Store size={14} className="text-[#0528d6] dark:text-blue-400" /> <span className="truncate uppercase">{agencyName}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-auto pt-6 border-t border-slate-50 dark:border-slate-800">
        <button onClick={() => onView(staff.id)} className="flex-1 py-3 bg-[#F76513] text-white rounded-2xl text-[9px] font-black uppercase italic tracking-widest hover:scale-[1.02] hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-500/25">
            <Info size={14}/> {t.staff.viewProfile.split(' ')[0]}
        </button>
        <button onClick={() => onEdit(staff)} className="p-3 text-slate-400 hover:text-[#0528d6] bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all shadow-inner"><Edit3 size={16}/></button>
        <button onClick={() => onDelete(staff.id)} className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all shadow-inner"><Trash2 size={16}/></button>
      </div>
    </div>
  );
};
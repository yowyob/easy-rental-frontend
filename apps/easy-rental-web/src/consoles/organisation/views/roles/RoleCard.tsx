/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { ShieldCheck, Edit3, Key } from 'lucide-react';

export const RoleCard = ({ role, onEdit, isSystem, t }: any) => (
  <div className={`bg-white dark:bg-[#1a1d2d] rounded-[2rem] p-6 md:p-8 border-2 transition-all group relative overflow-hidden flex flex-col h-full ${
    isSystem ? 'border-blue-50 dark:border-blue-900/20 shadow-sm' : 'border-slate-100 dark:border-slate-800 hover:shadow-md'
  }`}>
    {isSystem && (
      <div className="absolute top-0 right-0 bg-[#0528d6] text-white px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest italic z-10 shadow-lg">
        {t.roles.systemBadge}
      </div>
    )}
    
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-4">
        <div className={`size-14 rounded-2xl flex items-center justify-center shadow-inner ${isSystem ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0528d6]' : 'bg-slate-50 dark:bg-slate-800 text-[#0528d6]'}`}>
          {isSystem ? <Key size={24} /> : <ShieldCheck size={24} />}
        </div>
        <div>
          <h4 className="font-black text-slate-900 dark:text-white uppercase italic tracking-tighter text-lg leading-none">{role.name}</h4>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 italic">
            {role.permissions?.length || 0} {t.roles.privileges}
          </p>
        </div>
      </div>
      
      {!isSystem && (
        <button onClick={() => onEdit(role)} className="p-2.5 text-slate-400 hover:text-[#0528d6] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-sm">
          <Edit3 size={18} />
        </button>
      )}
    </div>

    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-8 line-clamp-3 italic leading-relaxed font-medium">
      {role.description || t.common.noData}
    </p>

    <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-slate-50 dark:border-slate-800">
       {role.permissions?.slice(0, 3).map((p: any) => (
         <span key={p.id} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[8px] font-black text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 uppercase italic tracking-tighter">
            {p.name.split(' ')[0]}
         </span>
       ))}
       {role.permissions?.length > 3 && (
         <span className="text-[10px] font-black text-[#0528d6] dark:text-blue-400 self-center ml-1 italic">
           +{role.permissions.length - 3} {t.roles.others}
         </span>
       )}
    </div>
  </div>
);
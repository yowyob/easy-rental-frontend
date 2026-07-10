/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { LayoutGrid, Lock, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

export const CategoryCard = ({ category, onEdit, onDelete, t }: any) => {
  const isSystem = category.organizationId === null;

  return (
    <div className={`bg-white dark:bg-[#1a1d2d] rounded-3xl p-6 border-2 transition-all group relative flex flex-col h-full ${
      isSystem ? 'border-blue-50 dark:border-blue-900/20 shadow-sm' : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md'
    }`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`size-12 rounded-xl flex items-center justify-center ${
          isSystem ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 text-[#0528d6] dark:text-blue-400 border border-slate-100 dark:border-slate-800'
        }`}>
          <LayoutGrid size={24} />
        </div>
        
        <div className="flex gap-1">
          {!isSystem ? (
            <>
              <button onClick={() => onEdit(category)} className="p-2 text-slate-400 hover:text-[#0528d6] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                <Edit3 size={16}/>
              </button>
              <button onClick={() => onDelete(category.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">
                <Trash2 size={16}/>
              </button>
            </>
          ) : isSystem && (
            <div className="p-2 text-slate-200 dark:text-slate-700" title={t.categories.systemLabel}>
              <Lock size={18} />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight uppercase italic tracking-tighter">{category.name}</h4>
          {isSystem && <CheckCircle2 size={14} className="text-blue-500" />}
        </div>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-3">
          {category.description || t.common.noData}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md italic ${
          isSystem ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-orange-50 text-[#F76513] dark:bg-orange-900/20'
        }`}>
          {isSystem ? t.categories.filterSystem : t.categories.customLabel}
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-300 dark:text-slate-600">#{category.id.substring(0, 4).toUpperCase()}</span>
      </div>
    </div>
  );
};
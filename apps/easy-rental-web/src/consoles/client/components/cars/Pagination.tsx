/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ current, total, onPageChange }: any) => {
  if (total <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      <button 
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
        className="p-3 rounded-xl bg-white dark:bg-[#1a1d2d] border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-[#0528d6] disabled:opacity-30 transition-all"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1d2d] rounded-2xl border border-slate-100 dark:border-slate-800">
        <span className="text-xs font-black text-[#0528d6] italic">{current}</span>
        <span className="text-[10px] font-bold text-slate-300 ">sur</span>
        <span className="text-xs font-black text-slate-600 dark:text-slate-400 italic">{total}</span>
      </div>

      <button 
        disabled={current === total}
        onClick={() => onPageChange(current + 1)}
        className="p-3 rounded-xl bg-white dark:bg-[#1a1d2d] border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-[#0528d6] disabled:opacity-30 transition-all"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
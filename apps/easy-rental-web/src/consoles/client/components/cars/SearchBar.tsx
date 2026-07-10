/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export const SearchBar = ({ value, onChange, total, onOpenFilters }: any) => {
  return (
    // On utilise la couleur exacte du background de la page pour créer un "masque" opaque
    <div className="sticky top-[72px] md:top-[68px] z-[50] py-4 bg-[#f4f7fe] dark:bg-[#080b14]">
      <div className="bg-white dark:bg-[#1a1d2d] p-2 md:p-3 rounded-2xl md:rounded-[1.8rem] border-2 border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-600/5 flex items-center gap-2 md:gap-4">
        
        <div className="relative flex-1 group">
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0528d6] transition-colors" size={20} />
          <input 
            type="text" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Rechercher une voiture..." 
            className="w-full pl-12 md:pl-16 pr-4 py-3 md:py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs md:text-sm font-bold outline-none focus:ring-2 focus:ring-[#0528d6]/10 dark:text-white"
          />
        </div>

        <button onClick={onOpenFilters} className="xl:hidden p-3 bg-[#0528d6] text-white rounded-xl">
            <SlidersHorizontal size={20} />
        </button>

        <div className="px-6 border-l-2 border-slate-100 dark:border-slate-800 hidden md:block text-right">
          <p className="text-[9px] font-bold text-slate-400  mb-0.5">Résultats</p>
          <p className="text-xs font-black text-[#0528d6] whitespace-nowrap">{total} véhicules</p>
        </div>
      </div>
    </div>
  );
};
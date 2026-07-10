/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { MapPin, Car, Users, Settings, Filter } from 'lucide-react';

export const FilterSidebar = ({ 
  categories, 
  activeFilters, 
  setActiveFilters, 
  selectedCategory, 
  setSelectedCategory,
  onReset,
  isMobile = false
}: any) => {
  
  // Sur desktop : hauteur calculée pour tenir dans l'écran et scrollable
  const desktopClasses = "w-80 bg-white dark:bg-[#1a1d2d] p-8 rounded-[2.5rem] rounded-r-[0.5rem] border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col h-[calc(100vh-120px)]";
  const mobileClasses = "flex flex-col space-y-8 p-6";

  return (
    <div className={isMobile ? mobileClasses : desktopClasses}>
      <div className="flex justify-between items-center border-b-2 border-slate-50 dark:border-slate-800 pb-4 shrink-0">
        <div className="flex items-center gap-2 text-[#0528d6]">
          <Filter size={18} />
          <h4 className="font-bold  italic text-xs tracking-widest">Filtrage</h4>
        </div>
        <button onClick={onReset} className="text-[9px] font-black text-slate-400  hover:text-red-500 transition-colors">Reset</button>
      </div>

      {/* Zone scrollable interne */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-8 space-y-10">
        <section className="space-y-4 text-left">
          <label className="text-[10px] font-bold  text-slate-500 italic flex items-center gap-2">
            <MapPin size={14} className="text-[#0528d6]"/> Localisation
          </label>
          <input 
            type="text" 
            value={activeFilters.city}
            onChange={(e) => setActiveFilters({...activeFilters, city: e.target.value})}
            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:border-[#0528d6] transition-all dark:text-white" 
            placeholder="Douala, Yaoundé..."
          />
        </section>

        <section className="space-y-4 text-left">
          <label className="text-[10px] font-bold  text-slate-500 italic flex items-center gap-2">
            <Car size={14} className="text-[#0528d6]"/> Catégories
          </label>
          <div className="flex flex-col gap-2">
            <CategoryBtn label="Tous les types" active={selectedCategory === 'ALL'} onClick={() => setSelectedCategory('ALL')} />
            {categories.map((c: any) => (
              <CategoryBtn key={c.id} label={c.name} active={selectedCategory === c.id} onClick={() => setSelectedCategory(c.id)} />
            ))}
          </div>
        </section>

        <section className="space-y-4 text-left">
          <label className="text-[10px] font-bold  text-slate-500 italic flex items-center gap-2">
            <Settings size={14} className="text-[#0528d6]"/> Transmission
          </label>
          <div className="grid grid-cols-2 gap-2">
            <SelectBtn label="Manuel" active={activeFilters.transmission === 'MANUAL'} onClick={() => setActiveFilters({...activeFilters, transmission: 'MANUAL'})} />
            <SelectBtn label="Auto" active={activeFilters.transmission === 'AUTOMATIC'} onClick={() => setActiveFilters({...activeFilters, transmission: 'AUTOMATIC'})} />
          </div>
        </section>

        <section className="space-y-4 text-left">
          <label className="text-[10px] font-bold  text-slate-500 italic flex items-center gap-2">
            <Users size={14} className="text-[#0528d6]"/> Capacité
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[2, 5, 7].map(n => (
              <SelectBtn key={n} label={`${n}+`} active={activeFilters.places === n} onClick={() => setActiveFilters({...activeFilters, places: n})} />
            ))}
          </div>
        </section>
      </div>

      <div className="pt-6 border-t-2 border-slate-50 dark:border-slate-800 shrink-0">
           <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
              <p className="text-[9px] font-black text-[#0528d6] leading-relaxed  italic">
                Réservez en ligne, payez sur place.
              </p>
           </div>
      </div>
    </div>
  );
};

const CategoryBtn = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center justify-between px-5 py-3 rounded-xl text-[10px] font-black  border-2 transition-all ${active ? 'bg-[#0528d6] border-[#0528d6] text-white' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400 hover:bg-slate-100'}`}>
    <span className="truncate">{label}</span>
    <div className={`size-1.5 rounded-full ${active ? 'bg-white' : 'bg-slate-300'}`} />
  </button>
);

const SelectBtn = ({ label, active, onClick }: any) => (
  <button type="button" onClick={onClick} className={`py-3 rounded-xl text-[10px] font-black  border-2 transition-all ${active ? 'border-[#0528d6] bg-[#0528d6] text-white shadow-md' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:border-slate-300'}`}>
    {label}
  </button>
);
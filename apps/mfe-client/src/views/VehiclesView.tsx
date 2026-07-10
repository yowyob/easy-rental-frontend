/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Car, ArrowRight, Loader2, Gauge, Users, Settings, ArrowLeft, X } from 'lucide-react';
import { agencyService, vehicleService } from '@pwa-easy-rental/shared-services';
import { SearchBar } from '../components/cars/SearchBar';
import { FilterSidebar } from '../components/cars/FilterSidebar';
import { Pagination } from '../components/cars/Pagination';

export const VehiclesView = ({ initialFilters, onSelectVehicle, onBack }: any) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [activeFilters, setActiveFilters] = useState({
    city: initialFilters.city || '',
    transmission: '',
    places: 0
  });
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vehRes, agRes, catRes] = await Promise.all([
          vehicleService.getAvailableVehicles(),
          agencyService.getAllAgencies(),
          vehicleService.getAllCategories()
        ]);
        if (vehRes.ok) setVehicles(vehRes.data);
        if (agRes.ok) setAgencies(agRes.data);
        if (catRes.ok) setCategories(catRes.data);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const agency = agencies.find(a => a.id === v.agencyId);
      const matchesSearch = `${v.brand} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = !activeFilters.city || agency?.city?.toLowerCase().includes(activeFilters.city.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || v.categoryId === selectedCategory;
      const matchesTrans = !activeFilters.transmission || v.transmission === activeFilters.transmission;
      const matchesPlaces = !activeFilters.places || v.places >= activeFilters.places;
      return matchesSearch && matchesCity && matchesCategory && matchesTrans && matchesPlaces;
    });
  }, [vehicles, agencies, searchTerm, activeFilters, selectedCategory]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f4f7fe] dark:bg-[#080b14]">
      <Loader2 className="animate-spin text-[#0528d6] size-12" />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 px-4 md:px-6 max-w-[1600px] mx-auto text-left min-h-screen flex flex-col bg-[#f4f7fe] dark:bg-[#080b14]">
      
      {/* 1. TOP NAV (Z-INDEX 60) */}
      <div className="sticky top-0 z-[60] -mx-4 md:-mx-6 px-4 md:px-6 py-4 bg-[#f4f7fe] dark:bg-[#080b14] flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400  hover:text-[#0528d6] transition-all italic">
          <ArrowLeft size={14} /> <span className="hidden sm:inline">Retour à l&apos;accueil</span><span className="sm:hidden">Retour</span>
        </button>
        <span className="text-[10px] font-black text-slate-400  tracking-[0.2em] italic">Catalogue Flotte</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 mt-6 items-start flex-1 pb-10">
        
        {/* 2. SIDEBAR (FIXE/STICKY SUR DESKTOP) */}
        <aside className="hidden xl:block w-80 shrink-0 sticky top-[80px] z-[40]">
           <FilterSidebar 
              categories={categories}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onReset={() => {
                setActiveFilters({ city: '', transmission: '', places: 0 });
                setSelectedCategory('ALL');
              }}
            />
        </aside>

        {/* MOBILE DRAWER */}
        <div className={`fixed inset-0 z-[100] xl:hidden transition-opacity duration-300 ${isMobileFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
            <div className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white dark:bg-[#1a1d2d] shadow-2xl transition-transform duration-300 transform ${isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 flex justify-end">
                    <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                <div className="px-2 h-[calc(100%-80px)] overflow-y-auto">
                    <FilterSidebar categories={categories} activeFilters={activeFilters} setActiveFilters={setActiveFilters} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onReset={() => {}} isMobile />
                </div>
            </div>
        </div>

        <div className="flex-1 w-full relative">
          {/* 3. SEARCH BAR (Z-INDEX 50) - OPAQUE */}
          <SearchBar 
            value={searchTerm} 
            onChange={(val: string) => { setSearchTerm(val); setCurrentPage(1); }} 
            total={filteredVehicles.length}
            onOpenFilters={() => setIsMobileFilterOpen(true)}
          />

          {/* GRID DES VEHICULES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {paginatedVehicles.map(v => {
              return (
                <div key={v.id} onClick={() => onSelectVehicle(v.id)} className="group cursor-pointer bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-6 border-2 border-slate-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-[#0528d6] transition-all flex flex-col h-full">
                  <div className="aspect-video bg-slate-50 dark:bg-slate-900 rounded-3xl mb-6 relative overflow-hidden flex items-center justify-center p-4 border border-slate-100 dark:border-slate-800">
                    {v.images?.[0] ? <img src={v.images[0]} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" /> : <Car size={40} className="text-slate-200"/>}
                  </div>
                  <div className="flex-1 flex flex-col space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate italic ">{v.brand} {v.model}</h3>
                    <div className="grid grid-cols-3 gap-2 py-3 border-y-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl">
                      <DetailItem icon={<Gauge size={12}/>} value={`${v.kilometrage} km`} />
                      <DetailItem icon={<Users size={12}/>} value={`${v.places} pl.`} />
                      <DetailItem icon={<Settings size={12}/>} value={v.transmission?.substring(0,3)} />
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-2">
                      <p className="text-lg font-black text-[#0528d6] italic">{v.pricing?.pricePerDay?.toLocaleString()} XAF <span className="text-xs font-bold text-slate-400">/ jour</span></p>
                      <button className="size-11 bg-[#0528d6] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30"><ArrowRight size={18} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10"><Pagination current={currentPage} total={totalPages} onPageChange={setCurrentPage} /></div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, value }: any) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-slate-400">{icon}</span>
    <span className="text-[9px] font-black  text-slate-600 dark:text-slate-300">{value}</span>
  </div>
);
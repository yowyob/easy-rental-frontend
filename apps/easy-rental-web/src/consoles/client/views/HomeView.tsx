/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import {
  Zap, ShieldCheck, MapPin, ChevronRight,
  Clock, Search, Filter, Loader2,
} from 'lucide-react';
import { vehicleService, formatXaf, vehicleStatusLabel } from '@pwa-easy-rental/shared-services';
import { About } from '@shared-ui/components/ui/About';
import { useClientI18n } from '../hooks/useClientI18n';

export const HomeView = ({ onSearch, setViewAll, onSelectVehicle, lang = 'FR' }: any) => {
  const t = useClientI18n(lang);
  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    vehicleService.getAvailableVehicles().then(res => {
      if (res.ok) {
        setFeaturedVehicles(res.data.slice(0, 3));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query: searchQuery });
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-2">
      <section className="relative min-h-[240px] md:min-h-[280px] rounded-2xl bg-[#0528d6] overflow-hidden flex flex-col items-center justify-center px-6 py-8 text-white shadow-lg shadow-[#0528d6]/20">
        <div className="absolute inset-0 opacity-20">
          <img
            src="/client/vehicle-placeholder.svg"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>

        <div className="relative z-10 max-w-4xl w-full text-center space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black tracking-widest italic mx-auto">
              <Zap size={14} className="text-orange-400" /> {t.hero.badge}
            </div>
            <h1 className="text-4xl md:text-6xl font-[900] italic leading-[0.9] tracking-tighter">
              {t.hero.title} <br /><span className="text-blue-200">{t.hero.accent}</span>
            </h1>
            <p className="text-base md:text-lg text-blue-100/80 font-medium leading-relaxed max-w-xl mx-auto">
              {t.hero.sub}
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="bg-white dark:bg-[#1a1d2d] p-2.5 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto border border-white/20"
          >
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0528d6] transition-colors" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.hero.searchPlaceholder}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#0528d6]/20 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors">
                <Filter size={18} />
              </button>
              <button type="submit" className="px-7 py-3 bg-[#0528d6] text-white rounded-2xl font-black text-xs tracking-widest shadow-lg shadow-blue-600/40 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all">
                {t.hero.search}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureItem icon={<ShieldCheck />} title={t.features.securityTitle} desc={t.features.securityDesc} />
        <FeatureItem icon={<MapPin />} title={t.features.geoTitle} desc={t.features.geoDesc} />
        <FeatureItem icon={<Clock />} title={t.features.flexTitle} desc={t.features.flexDesc} />
      </section>

      <section className="space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-[900] italic tracking-tighter leading-none text-[#0528d6]">
              {t.premium.title} <span className="text-slate-700 dark:text-white">{t.premium.accent}</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black tracking-[0.2em] mt-2 italic">{t.premium.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={setViewAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-slate-800 text-[#0528d6] dark:text-blue-300 rounded-xl text-[10px] font-black tracking-widest hover:bg-[#0528d6] hover:text-white transition-all italic"
          >
            {t.premium.viewAll} <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-slate-300" size={28} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredVehicles.map(v => (
              <FeaturedCard key={v.id} vehicle={v} lang={lang} perDay={t.premium.perDay} onClick={() => onSelectVehicle(v.id)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <About onInstall={handleInstallPWA} labels={t.about} />
      </section>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }: any) => (
  <div className="p-5 bg-white dark:bg-[#1a1d2d] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-left group hover:border-[#0528d6]/40 transition-colors">
    <div className="size-11 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-[#0528d6] mb-3">
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <h4 className="text-base font-bold mb-1.5 text-slate-800 dark:text-white">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const FeaturedCard = ({ vehicle, lang, perDay, onClick }: any) => (
  <div
    onClick={onClick}
    className="cursor-pointer group bg-white dark:bg-[#1a1d2d] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#0528d6]/30 transition-all"
  >
    <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
      <img
        src={vehicle.images?.[0] || '/client/vehicle-placeholder.svg'}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        alt={`${vehicle.brand} ${vehicle.model}`}
        onError={(e) => { (e.target as HTMLImageElement).src = '/client/vehicle-placeholder.svg'; }}
      />
      <div className="absolute top-3 left-3 px-2 py-1 bg-white/95 rounded-lg text-[10px] font-bold text-[#0528d6]">
        {vehicleStatusLabel(vehicle.statut, lang)}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0528d6]/85 to-transparent">
        <p className="text-white text-lg font-bold">
          {formatXaf(vehicle.pricing?.pricePerDay)} <span className="text-xs font-medium">{perDay}</span>
        </p>
      </div>
    </div>
    <div className="p-4 text-left">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">
        {vehicle.brand} {vehicle.model}
      </h3>
      <p className="text-xs text-slate-400 mt-1">Ref: {vehicle.licencePlate}</p>
    </div>
  </div>
);

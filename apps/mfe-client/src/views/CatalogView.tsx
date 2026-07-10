/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Store, Car } from 'lucide-react';
import { agencyService, vehicleService } from '@pwa-easy-rental/shared-services';
import { useLocalFirst } from '@pwa-easy-rental/shared-services/offline';
import { MapView } from '@pwa-easy-rental/shared-maps';
import { VehicleCard } from './catalog/VehicleCard';
import { VehicleDetailsView } from './VehicleDetailsView';
import { AgencyDetailsView } from './AgencyDetailsView';
import { AgencyCard } from './catalog/AgencyCard';
import { useClientI18n } from '../hooks/useClientI18n';

export const CatalogView = ({ userData, lang = 'FR' }: { userData: any; lang?: 'FR' | 'EN' }) => {
  const t = useClientI18n(lang);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'agencies'>('vehicles');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  const [itemsToShow, setItemsToShow] = useState(12);

  const { isOnline, isSyncing } = useLocalFirst();

  useEffect(() => {
    const load = async () => {
      try {
        const [a, v, c] = await Promise.all([
          agencyService.getAllAgencies(),
          vehicleService.getAvailableVehicles(),
          vehicleService.getAllCategories(),
        ]);
        if (a.ok) setAgencies(a.data || []);
        if (v.ok) setVehicles(v.data || []);
        if (c.ok) setCategories(c.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === 'vehicles') {
      return vehicles.filter(
        (v) =>
          (selectedCat === 'all' || v.categoryId === selectedCat) &&
          `${v.brand} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return agencies.filter(
      (a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, vehicles, selectedCat, agencies, searchTerm]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0528d6] size-8" />
      </div>
    );
  }

  if (selectedVehicleId) {
    return (
      <VehicleDetailsView
        vehicleId={selectedVehicleId}
        userData={userData}
        onBack={() => setSelectedVehicleId(null)}
      />
    );
  }

  if (selectedAgencyId) {
    return (
      <AgencyDetailsView
        agencyId={selectedAgencyId}
        userData={userData}
        onBack={() => setSelectedAgencyId(null)}
      />
    );
  }

  return (
    <div className="animate-in fade-in duration-300 pb-2">
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <aside className="w-full lg:w-48 flex flex-row lg:flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('vehicles'); setSearchTerm(''); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'vehicles' ? 'bg-[#0528d6] text-white' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Car size={16} /> {t.catalog.vehicles}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('agencies'); setSearchTerm(''); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'agencies' ? 'bg-[#0528d6] text-white' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Store size={16} /> {t.catalog.agencies}
          </button>
        </aside>

        <div className="flex-1 w-full min-w-0 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#1a1d2d] p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                placeholder={activeTab === 'vehicles' ? t.catalog.searchVehicles : t.catalog.searchAgencies}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#0528d6] dark:text-white"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setItemsToShow(12); }}
              />
            </div>
            {activeTab === 'vehicles' && (
              <select
                value={selectedCat}
                onChange={(e) => { setSelectedCat(e.target.value); setItemsToShow(12); }}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#0528d6] dark:text-white min-w-[160px]"
              >
                <option value="all">{t.catalog.allSegments}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {!isOnline && activeTab === 'agencies' && (
            <p className="text-xs font-medium text-amber-600">
              Mode hors ligne — données en cache{isSyncing ? ' (synchronisation…)' : ''}
            </p>
          )}

          {activeTab === 'agencies' && agencies.some((a) => a.latitude && a.longitude) && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-48">
              <MapView
                markers={agencies
                  .filter((a) => a.latitude && a.longitude)
                  .map((a) => ({
                    id: a.id,
                    latitude: a.latitude,
                    longitude: a.longitude,
                    label: a.name,
                  }))}
              />
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="font-medium">Aucun résultat pour cette recherche.</p>
            </div>
          ) : activeTab === 'vehicles' ? (
            <>
              <p className="text-xs text-slate-500">{filtered.length} {t.catalog.vehiclesAvailable}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.slice(0, itemsToShow).map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    lang={lang}
                    categoryName={categories.find((c) => c.id === v.categoryId)?.name || 'Premium'}
                    onViewDetails={(id) => setSelectedVehicleId(id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500">{filtered.length} {t.catalog.agenciesAvailable}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((a) => (
                  <AgencyCard key={a.id} agency={a} onClick={(id) => setSelectedAgencyId(id)} />
                ))}
              </div>
            </>
          )}

          {activeTab === 'vehicles' && itemsToShow < filtered.length && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setItemsToShow((prev) => prev + 12)}
                className="px-8 py-2.5 bg-[#0528d6] text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
              >
                Charger plus
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { Users, Gauge, Settings, ArrowRight, Clock, CalendarDays } from 'lucide-react';
import { formatXaf, vehicleStatusLabel } from '@pwa-easy-rental/shared-services';

interface VehicleCardProps {
  vehicle: any;
  categoryName: string;
  lang?: 'FR' | 'EN';
  onViewDetails: (id: string) => void;
}

const FALLBACK_IMAGE = '/client/vehicle-placeholder.svg';

export const VehicleCard = ({ vehicle, categoryName, lang = 'FR', onViewDetails }: VehicleCardProps) => {
  const imageSrc = vehicle.images?.[0] || FALLBACK_IMAGE;
  const dayPrice = formatXaf(vehicle.pricing?.pricePerDay);
  const hourPrice = formatXaf(vehicle.pricing?.pricePerHour);

  return (
    <article className="bg-white dark:bg-[#1a1d2d] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-[#0528d6]/30 transition-all group flex flex-col h-full">
      <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
        <img
          src={imageSrc}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={`${vehicle.brand} ${vehicle.model}`}
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 rounded-lg text-[10px] font-bold text-[#0528d6] shadow-sm">
          {vehicleStatusLabel(vehicle.statut, lang)}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3 text-left">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">{categoryName}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-2.5 border border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 flex items-center gap-1 mb-0.5"><Clock size={11} /> Par heure</p>
            <p className="font-bold text-[#0528d6]">{hourPrice} <span className="text-[10px] font-medium">XAF</span></p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-2.5 border border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 flex items-center gap-1 mb-0.5"><CalendarDays size={11} /> Par jour</p>
            <p className="font-bold text-[#0528d6]">{dayPrice} <span className="text-[10px] font-medium">XAF</span></p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1"><Users size={12} /> {vehicle.places ?? '—'} pl.</span>
          <span className="flex items-center gap-1"><Gauge size={12} /> {vehicle.transmission?.substring(0, 3) ?? '—'}</span>
          <span className="flex items-center gap-1"><Settings size={12} /> {vehicle.engineDetails?.type?.substring(0, 6) || '—'}</span>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(vehicle.id)}
          className="mt-auto w-full py-2.5 bg-[#0528d6] text-white rounded-xl font-semibold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Voir détails <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
};

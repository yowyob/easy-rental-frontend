/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { MapPin, Gauge, Users, Trash2, Edit3, Info, CalendarClock } from 'lucide-react';
import { resolveMediaDisplayUrl } from '@pwa-easy-rental/shared-services';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop';

export const VehicleCard = ({ vehicle, agencyName, categoryName, onEdit, onDelete, onViewDetails, onQuickStatus }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-700';
      case 'MAINTENANCE': return 'bg-orange-100 text-orange-700';
      case 'RENTED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const imageUrl = resolveMediaDisplayUrl(vehicle.images?.[0] || FALLBACK_IMAGE);

  return (
    <div className="bg-white dark:bg-[#1a1d2d] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col h-full text-left">
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img 
          src={imageUrl} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          alt="v"
        />
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-black  tracking-widest backdrop-blur-md border border-white/20 ${getStatusColor(vehicle.statut)}`}>
          {vehicle.statut}
        </div>
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onQuickStatus(vehicle)} title="Statut & Planning" className="p-2 bg-white/90 rounded-xl text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-lg"><CalendarClock size={16}/></button>
          <button onClick={() => onViewDetails(vehicle.id)} title="Fiche technique" className="p-2 bg-white/90 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Info size={16}/></button>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight  italic tracking-tighter">
              {vehicle.brand} <span className="text-[#0528d6]">{vehicle.model}</span>
            </h4>
            <div className="mt-1 px-2 py-0.5 inline-block bg-slate-100 dark:bg-slate-700 rounded font-mono font-bold text-[9px] text-slate-500 dark:text-slate-300 italic">
              {vehicle.licencePlate}
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEdit(vehicle)} className="p-2 text-slate-400 hover:text-[#0528d6] hover:bg-blue-50 rounded-lg"><Edit3 size={16}/></button>
            <button onClick={() => onDelete(vehicle.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-50 dark:border-slate-800 mb-4">
          <div className="flex flex-col items-center">
            <Gauge size={14} className="text-slate-300 mb-1" />
            <span className="text-[10px] font-bold text-slate-500">{vehicle.kilometrage} km</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-50 dark:border-slate-800">
            <Users size={14} className="text-slate-300 mb-1" />
            <span className="text-[10px] font-bold text-slate-500">{vehicle.places} pl.</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="size-3 rounded-full bg-slate-200 border border-slate-300 mb-1" style={{backgroundColor: vehicle.color}} />
            <span className="text-[9px] font-black text-slate-500  italic truncate w-full text-center">{vehicle.color}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin size={12} className="text-[#0528d6]"/>
            <span className="text-[10px] font-bold  italic truncate max-w-[100px]">{agencyName}</span>
          </div>
          <span className="text-[9px] font-black text-[#0528d6]  tracking-tighter bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded italic">
            {categoryName}
          </span>
        </div>
      </div>
    </div>
  );
};
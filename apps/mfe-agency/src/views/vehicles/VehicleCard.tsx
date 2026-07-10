/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { MapPin, Gauge, Users, Trash2, Edit3, Info, CheckCircle2, Clock, CalendarClock } from 'lucide-react';
import { resolveMediaDisplayUrl } from '@pwa-easy-rental/shared-services';
import { hasPermission } from '../../utils/permissions';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop';

export const VehicleCard = ({
  vehicle,
  categoryName,
  onEdit,
  staffPermissions,
  onDelete,
  onStatusUpdate,
  onQuickStatus,
  onViewDetails,
  t,
  userData,
}: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'RENTED':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const imageUrl = resolveMediaDisplayUrl(vehicle.images?.[0] || FALLBACK_IMAGE);

  return (
    <div className="bg-white dark:bg-[#1a1d2d] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col h-full text-left">
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={imageUrl}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={`${vehicle.brand} ${vehicle.model}`}
        />
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-black tracking-widest backdrop-blur-md border border-white/20 ${getStatusColor(vehicle.statut)}`}
        >
          {vehicle.statut}
        </div>
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onViewDetails(vehicle)}
            title="Fiche technique"
            className="p-2 bg-white/90 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
          >
            <Info size={16} />
          </button>
          {hasPermission(userData, staffPermissions, 'vehicle:update') && (
            <button
              type="button"
              onClick={() => onQuickStatus(vehicle)}
              title="Tarifs & statut"
              className="p-2 bg-white/90 rounded-xl text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-lg"
            >
              <CalendarClock size={16} />
            </button>
          )}
          {hasPermission(userData, staffPermissions, 'vehicle:update') && (
            <button
              type="button"
              onClick={() => onEdit(vehicle)}
              className="p-2 bg-white/90 rounded-xl text-slate-600 hover:bg-[#0528d6] hover:text-white transition-all shadow-lg"
            >
              <Edit3 size={16} />
            </button>
          )}
          {hasPermission(userData, staffPermissions, 'vehicle:delete') && (
            <button
              type="button"
              onClick={() => onDelete(vehicle.id)}
              className="p-2 bg-white/90 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight italic tracking-tighter">
              {vehicle.brand} <span className="text-[#0528d6]">{vehicle.model}</span>
            </h4>
            <div className="mt-1 px-2 py-0.5 inline-block bg-slate-100 dark:bg-slate-700 rounded font-mono font-bold text-[9px] text-slate-500 dark:text-slate-300 italic">
              {vehicle.licencePlate}
            </div>
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
            <Clock size={14} className="text-slate-300 mb-1" />
            <span className="text-[10px] font-bold text-slate-500">{vehicle.transmission?.substring(0, 3)}</span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase italic">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-[#0528d6]" /> {t.vehicles.modal.category}
            </span>
            <span className="text-[#0528d6] dark:text-blue-400 font-black">{categoryName || 'Standard'}</span>
          </div>

          {hasPermission(userData, staffPermissions, 'vehicle:update') && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onStatusUpdate(vehicle.id, 'AVAILABLE')}
                className="flex items-center justify-center gap-1.5 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-green-100 transition-colors"
              >
                <CheckCircle2 size={12} /> {t.vehicles.stats?.available?.split(' ')[0] || 'Dispo'}
              </button>
              <button
                type="button"
                onClick={() => onStatusUpdate(vehicle.id, 'MAINTENANCE')}
                className="flex items-center justify-center gap-1.5 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-orange-100 transition-colors"
              >
                <Clock size={12} /> Maint.
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Portal } from '../../components/Portal';
import { vehicleService } from '@pwa-easy-rental/shared-services';
import { VehicleDetailsBody } from '@pwa-easy-rental/shared-ui';

export const VehicleDetailsModal = ({ vehicleId, onClose, t }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vehicleService.getVehicleDetails(vehicleId).then((res) => {
      if (res.ok) setData(res.data);
      setLoading(false);
    });
  }, [vehicleId]);

  if (loading) {
    return (
      <Portal>
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <Loader2 className="animate-spin text-white size-12" />
        </div>
      </Portal>
    );
  }

  if (!data?.vehicle) {
    return (
      <Portal>
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1d2d] p-8 rounded-3xl text-center">
            <p className="text-sm font-bold text-red-500 italic">Fiche véhicule indisponible.</p>
            <button type="button" onClick={onClose} className="mt-4 text-xs font-black text-slate-400 uppercase">
              Fermer
            </button>
          </div>
        </div>
      </Portal>
    );
  }

  const vehicle = data.vehicle;
  const shortId = vehicle.id ? String(vehicle.id).substring(0, 8).toUpperCase() : '--------';

  return (
    <Portal>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 text-left">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />

        <div className="relative w-full max-w-5xl bg-white dark:bg-[#1a1d2d] rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/10 animate-in zoom-in">
          <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1a1d2d]">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                Fiche technique <span className="text-[#0528d6]">#FL-{shortId}</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-black tracking-widest mt-1 italic">
                {vehicle.brand} {vehicle.model} — {vehicle.licencePlate}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-12 bg-slate-50 dark:bg-slate-800 flex items-center justify-center rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
            <VehicleDetailsBody details={data} t={t} />
          </div>

          <div className="px-10 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition-all italic tracking-widest"
            >
              {t?.resDetails?.closeBtn ?? 'Fermer la vue'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { Settings, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const VehicleSpecs = ({ vehicle }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
    <div className="bg-white dark:bg-[#1a1d2d] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
      <h4 className="font-bold  italic text-[#0528d6] text-xs flex items-center gap-2 tracking-widest">
        <Settings size={16}/> Motorisation & Type
      </h4>
      <div className="grid grid-cols-2 gap-6">
        <DataBox label="Transmission" value={vehicle.transmission} />
        <DataBox label="Kilométrage" value={`${vehicle.kilometrage} km`} />
        <DataBox label="Production" value={new Date(vehicle.yearProduction).getFullYear()} />
        <DataBox label="Capacité" value={`${vehicle.places} places`} />
      </div>
    </div>

    <div className="bg-white dark:bg-[#1a1d2d] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
      <h4 className="font-bold  italic text-[#0528d6] text-xs flex items-center gap-2 tracking-widest">
        <ShieldCheck size={16}/> Équipements inclus
      </h4>
      <div className="grid grid-cols-2 gap-y-4">
        <FeatureItem label="Climatisation" active={vehicle.functionalities?.air_condition} />
        <FeatureItem label="Système GPS" active={vehicle.functionalities?.gps} />
        <FeatureItem label="Bluetooth" active={vehicle.functionalities?.bluetooth} />
        <FeatureItem label="Confort route" active={vehicle.functionalities?.seat_belt} />
      </div>
    </div>
  </div>
);

const DataBox = ({ label, value }: any) => (
  <div className="space-y-1">
    <p className="text-[9px] font-bold text-slate-300  tracking-widest italic">{label}</p>
    <p className="text-sm font-black text-slate-700 dark:text-white italic  tracking-tight">{value || '---'}</p>
  </div>
);

const FeatureItem = ({ label, active }: any) => (
  <div className={`flex items-center gap-3 ${active ? 'opacity-100' : 'opacity-30'}`}>
    <CheckCircle2 size={14} className={active ? 'text-green-500' : 'text-slate-300'} />
    <span className={`text-xs font-bold italic ${active ? 'text-slate-600 dark:text-slate-400' : 'text-slate-300 line-through'}`}>{label}</span>
  </div>
);
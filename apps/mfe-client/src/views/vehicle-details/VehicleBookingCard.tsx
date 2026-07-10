/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { MapPin, CheckCircle2, Zap, Info } from 'lucide-react';

export const VehicleBookingCard = ({ vehicle, pricing, isAuth, onAuthRequired, onStartBooking }: any) => (
  <aside className="lg:col-span-4">
    <div className="bg-white dark:bg-[#1a1d2d] p-8 rounded-[3rem] border-b-8 border-[#0528d6] shadow-2xl sticky top-44 space-y-8 text-left">
      <div>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight  italic">{vehicle.brand}</h3>
        <p className="text-slate-400 font-bold  text-[10px] mt-2 italic tracking-widest leading-none">{vehicle.model} • {vehicle.color}</p>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
        <p className="text-[9px] font-black text-slate-400  mb-1 tracking-widest italic">Coût journalier</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-[#0528d6] italic">{pricing?.pricePerDay?.toLocaleString()} XAF</p>
          <p className="text-[10px] font-bold text-slate-400  italic">/ Jour</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#0528d6]"><MapPin size={16}/></div>
          <span className="text-xs font-bold italic">Retrait en agence agréée</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <div className="size-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600"><CheckCircle2 size={16}/></div>
          <span className="text-xs font-bold italic">Couverture assurance incluse</span>
        </div>
      </div>

      <button 
        onClick={!isAuth ? onAuthRequired : onStartBooking}
        className="w-full py-5 bg-[#0528d6] text-white rounded-[2rem] font-black  italic shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
      >
        {!isAuth ? "Se connecter pour réserver" : "Initialiser la réservation"} <Zap size={18} />
      </button>

      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex gap-3">
        <Info size={18} className="text-[#F76513] shrink-0" />
        <p className="text-[9px] text-[#F76513] font-bold italic leading-relaxed ">
          La caution est gérée par l&apos;agence partenaire lors de la prise du véhicule.
        </p>
      </div>
    </div>
  </aside>
);
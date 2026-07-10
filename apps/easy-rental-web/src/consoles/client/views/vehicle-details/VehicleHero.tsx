/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { Car } from 'lucide-react';

export const VehicleHero = ({ vehicle }: any) => (
  <section className="bg-white dark:bg-[#1a1d2d] rounded-[3rem] p-4 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
    <div className="aspect-video bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] relative flex items-center justify-center">
      {vehicle.images?.[0] ? (
        <img 
          src={vehicle.images[0]} 
          alt={vehicle.model} 
          className="w-full h-full object-contain p-8 transition-transform hover:scale-105 duration-700" 
        />
      ) : (
        <Car size={120} className="text-slate-200" />
      )}
      <div className="absolute bottom-6 left-6 flex gap-2">
        <span className="px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl text-[9px] font-black  tracking-widest shadow-sm border border-white/20">Images HD</span>
        <span className="px-4 py-2 bg-[#0528d6] text-white rounded-2xl text-[9px] font-black  tracking-widest shadow-lg shadow-blue-600/20">Vérifié</span>
      </div>
    </div>
  </section>
);
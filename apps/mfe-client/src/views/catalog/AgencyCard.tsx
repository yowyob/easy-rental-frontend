/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  MapPin,
  ArrowUpRight,
  Store,
  Clock,
  CreditCard,
} from "lucide-react";

interface AgencyCardProps {
  agency: any;
  onClick: (id: string) => void;
}

export const AgencyCard = ({ agency, onClick }: AgencyCardProps) => {
  return (
    <div
      onClick={() => onClick(agency.id)}
      className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 hover:border-[#0528d6] hover:shadow-xl hover:shadow-[#0528d6]/10 transition-all duration-500 cursor-pointer overflow-hidden"
    >
      {/* Badges */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
        {agency.is24Hours && (
          <span className="px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 text-[9px] font-black  rounded-full border border-green-100">
            24h/24
          </span>
        )}

        {agency.allowOnlineBooking && (
          <span className="px-3 py-1 bg-blue-50 text-[#0528d6] text-[9px] font-black  rounded-full border border-blue-100">
            Réservation en ligne
          </span>
        )}
      </div>

      {/* Logo */}
      <div className="flex items-start gap-4 mb-6">
        <div className="size-20 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
          {agency.logoUrl ? (
            <img
              src={agency.logoUrl}
              alt={agency.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Store size={32} className="text-slate-300" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-black italic  text-slate-900 dark:text-white leading-tight group-hover:text-[#0528d6] transition-colors">
            {agency.name}
          </h3>

          {agency.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {agency.description}
            </p>
          )}
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-3 text-xs">

        <div className="flex items-center gap-2 text-slate-500">
          <MapPin size={14} className="text-slate-300 shrink-0" />
          <span className="font-bold truncate">
            {agency.address}, {agency.city} - {agency.region}
          </span>
        </div>

        {agency.workingHours && (
          <div className="flex items-center gap-2 text-slate-500">
            <Clock size={14} className="text-slate-300 shrink-0" />
            <span className="font-bold truncate">{agency.workingHours}</span>
          </div>
        )}


       
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">

        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-slate-300" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-300  tracking-widest">
              Acompte
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white italic">
              {agency.depositPercentage}%
            </span>
          </div>
        </div>

        <div className="size-12 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-[#0528d6] group-hover:text-white group-hover:rotate-45 transition-all duration-500">
          <ArrowUpRight size={20} />
        </div>
      </div>
    </div>
  );
};

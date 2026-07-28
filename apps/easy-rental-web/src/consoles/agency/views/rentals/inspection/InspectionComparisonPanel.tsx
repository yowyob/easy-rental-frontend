/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { AlertTriangle, Info, Fuel, Gauge } from 'lucide-react';
import { INSPECTION_ITEM_LABELS, ITEM_STATUS_LABELS, type InspectionComparison } from '@pwa-easy-rental/shared-services';

const label = (code: string) => INSPECTION_ITEM_LABELS[code] || code;
const st = (s?: string | null) => (s ? ITEM_STATUS_LABELS[s] || s : '—');

/** Panneau récap de la comparaison CHECK_IN vs CHECK_OUT. */
export const InspectionComparisonPanel = ({ comparison }: { comparison: InspectionComparison | null }) => {
  if (!comparison) {
    return <p className="text-sm italic text-slate-400">Comparaison indisponible (les deux inspections sont requises).</p>;
  }
  const { newDamages, preExisting, newMissing, fuelDelta, kmTraveled } = comparison;
  const nothing = newDamages.length === 0 && preExisting.length === 0 && newMissing.length === 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Gauge size={18} className="text-[#0528d6]" />
          <div>
            <div className="text-[9px] font-black uppercase italic tracking-widest text-slate-400">Km parcourus</div>
            <div className="text-lg font-black italic text-slate-800 dark:text-white">{kmTraveled ?? '—'} km</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Fuel size={18} className="text-[#0528d6]" />
          <div>
            <div className="text-[9px] font-black uppercase italic tracking-widest text-slate-400">Écart carburant</div>
            <div className="text-lg font-black italic text-slate-800 dark:text-white">
              {fuelDelta == null ? '—' : `${fuelDelta > 0 ? '+' : ''}${fuelDelta}/8`}
            </div>
          </div>
        </div>
      </div>

      {nothing && (
        <p className="px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 text-[11px] font-black italic uppercase tracking-widest text-emerald-700">
          Aucun changement d'état constaté — véhicule rendu conforme.
        </p>
      )}

      {newDamages.length > 0 && (
        <Section title="Nouveaux dommages (imputables)" tone="red" icon={<AlertTriangle size={14} />}>
          {newDamages.map((d, i) => (
            <Row key={i} code={d.itemCode} before={d.statusBefore} after={d.statusAfter} note={d.noteAfter} tone="red" />
          ))}
        </Section>
      )}
      {newMissing.length > 0 && (
        <Section title="Éléments manquants" tone="red" icon={<AlertTriangle size={14} />}>
          {newMissing.map((d, i) => (
            <Row key={i} code={d.itemCode} before={d.statusBefore} after={d.statusAfter} note={d.noteAfter} tone="red" />
          ))}
        </Section>
      )}
      {preExisting.length > 0 && (
        <Section title="Dommages préexistants (non imputables)" tone="gray" icon={<Info size={14} />}>
          {preExisting.map((d, i) => (
            <Row key={i} code={d.itemCode} before={d.statusBefore} after={d.statusAfter} note={d.noteAfter} tone="gray" />
          ))}
        </Section>
      )}
    </div>
  );
};

const Section = ({ title, tone, icon, children }: any) => (
  <div>
    <div className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase italic tracking-widest ${tone === 'red' ? 'text-red-600' : 'text-slate-400'}`}>
      {icon} {title}
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

const Row = ({ code, before, after, note, tone }: any) => (
  <div className={`p-3 rounded-2xl border ${tone === 'red' ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-black italic text-slate-700 dark:text-slate-200">{label(code)}</span>
      <span className="text-[10px] font-bold text-slate-500">{st(before)} → <span className={tone === 'red' ? 'text-red-600 font-black' : ''}>{st(after)}</span></span>
    </div>
    {note && <p className="mt-1 text-[11px] italic text-slate-400">{note}</p>}
  </div>
);

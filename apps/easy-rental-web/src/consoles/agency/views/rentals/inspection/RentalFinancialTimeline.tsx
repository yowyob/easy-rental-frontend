/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { Banknote, ShieldCheck, RotateCcw, MinusCircle, AlertTriangle } from 'lucide-react';

/**
 * Timeline financière d'une location : location, caution, retenue, remboursement.
 * Reçoit le rental (avec champs R2) et affiche les mouvements dans l'ordre.
 */
export const RentalFinancialTimeline = ({ rental }: { rental: any }) => {
  const rows: Array<{ icon: any; label: string; amount: number; tone: string }> = [];

  const rentalAmount = Number(rental.rentalAmount ?? 0);
  const cautionAmount = Number(rental.cautionAmount ?? 0);
  const rentalPaid = Number(rental.rentalAmountPaid ?? 0);
  const cautionHeld = Number(rental.cautionHeld ?? 0);
  const cautionDeducted = Number(rental.cautionDeducted ?? 0);
  const cautionRefunded = Number(rental.cautionRefunded ?? 0);
  const supplementDue = Number(rental.supplementDue ?? 0);

  if (rentalAmount > 0) rows.push({ icon: <Banknote size={16} />, label: 'Location (facturable)', amount: rentalAmount, tone: 'blue' });
  if (cautionAmount > 0) rows.push({ icon: <ShieldCheck size={16} />, label: 'Caution (escrow)', amount: cautionAmount, tone: 'slate' });
  if (rentalPaid > 0) rows.push({ icon: <Banknote size={16} />, label: 'Location encaissée', amount: rentalPaid, tone: 'green' });
  if (cautionHeld > 0) rows.push({ icon: <ShieldCheck size={16} />, label: 'Caution détenue', amount: cautionHeld, tone: 'green' });
  if (cautionDeducted > 0) rows.push({ icon: <MinusCircle size={16} />, label: 'Retenue caution (revenu)', amount: cautionDeducted, tone: 'blue' });
  if (cautionRefunded > 0) rows.push({ icon: <RotateCcw size={16} />, label: 'Caution remboursée', amount: cautionRefunded, tone: 'emerald' });
  if (supplementDue > 0) rows.push({ icon: <AlertTriangle size={16} />, label: 'Supplément dû (créance)', amount: supplementDue, tone: 'red' });

  const toneClass = (t: string) => {
    switch (t) {
      case 'blue': return 'text-[#0528d6] bg-blue-50 dark:bg-blue-900/20';
      case 'green': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'emerald': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
      case 'red': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-800';
    }
  };

  if (rows.length === 0) {
    return <p className="text-sm italic text-slate-400">Aucun mouvement financier ventilé (dossier antérieur au module caution).</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className={`size-10 rounded-xl flex items-center justify-center ${toneClass(r.tone)}`}>{r.icon}</div>
          <span className="flex-1 text-xs font-black italic uppercase tracking-widest text-slate-600 dark:text-slate-300">{r.label}</span>
          <span className={`text-sm font-black italic ${r.amount < 0 ? 'text-red-600' : 'text-slate-800 dark:text-white'}`}>
            {r.amount < 0 ? '' : '+'}{r.amount.toLocaleString()} FCFA
          </span>
        </div>
      ))}
    </div>
  );
};

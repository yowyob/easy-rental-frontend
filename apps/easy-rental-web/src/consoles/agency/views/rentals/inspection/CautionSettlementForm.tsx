/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

/**
 * Règlement caution au checkout. L'agent saisit le COÛT DES DOMMAGES constatés
 * (jugement libre). Le système calcule :
 *  - retenue = min(dommages, caution)  → revenu agence
 *  - remboursement = caution − retenue → rendu au client
 *  - supplément dû = max(0, dommages − caution) → créance à encaisser à part
 */
export const CautionSettlementForm = ({
  cautionHeld,
  submitting,
  onSubmit,
}: {
  cautionHeld: number;
  submitting?: boolean;
  onSubmit: (damageCost: number, reason: string) => void;
}) => {
  const [damage, setDamage] = useState<string>('0');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const damageNum = Number(damage) || 0;
  const deduction = Math.min(damageNum, cautionHeld);
  const refunded = Math.max(0, cautionHeld - deduction);
  const supplement = Math.max(0, damageNum - cautionHeld);

  const handleSubmit = () => {
    setError(null);
    if (damageNum < 0) { setError('Le coût des dommages ne peut pas être négatif.'); return; }
    if (damageNum > 0 && !reason.trim()) { setError('Un motif est obligatoire dès qu\'il y a des dommages.'); return; }
    onSubmit(damageNum, reason.trim());
  };

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-500">Caution détenue</span>
        <span className="text-xl font-black italic text-[#0528d6]">{cautionHeld.toLocaleString()} FCFA</span>
      </div>

      <label className="block">
        <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">
          Coût total des dommages constatés
        </span>
        <input
          type="number"
          value={damage}
          onChange={(e) => setDamage(e.target.value)}
          min={0}
          placeholder="0 si aucun dommage"
          className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-black"
        />
        <span className="text-[10px] text-slate-400 italic">
          Basez-vous sur le panneau de comparaison ci-contre (dommages détectés) + coût réel des réparations.
        </span>
      </label>

      {damageNum > 0 && (
        <label className="block">
          <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">Motif *</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="ex. rayure portière + pare-chocs + niveau carburant"
            className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
          />
        </label>
      )}

      {/* Récap calculé */}
      <div className="space-y-2">
        <Row label="Retenue sur caution (revenu)" value={deduction} tone="blue" />
        <Row label="Remboursé au client" value={refunded} tone="emerald" />
        {supplement > 0 && (
          <Row label="Supplément dû par le client (créance)" value={supplement} tone="red" />
        )}
      </div>

      {supplement > 0 && (
        <p className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 text-[11px] font-bold italic text-red-600">
          Les dommages dépassent la caution : le client devra encore {supplement.toLocaleString()} FCFA
          (à encaisser depuis l'onglet Caution après clôture).
        </p>
      )}

      {error && (
        <p className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 text-[11px] font-black italic uppercase tracking-widest text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-4 rounded-2xl bg-[#0528d6] text-white text-xs font-black uppercase italic disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
        Régler le retour et clôturer
      </button>
    </div>
  );
};

const Row = ({ label, value, tone }: { label: string; value: number; tone: string }) => {
  const cls = tone === 'blue' ? 'text-[#0528d6]' : tone === 'emerald' ? 'text-emerald-600' : 'text-red-600';
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
      <span className="text-[11px] font-black uppercase italic tracking-widest text-slate-500">{label}</span>
      <span className={`text-lg font-black italic ${cls}`}>{value.toLocaleString()} FCFA</span>
    </div>
  );
};

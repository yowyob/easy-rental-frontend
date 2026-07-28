/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { Gift, Star, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr as frLocale, enUS } from 'date-fns/locale';
import { loyaltyService, type LoyaltyBalance, type LoyaltyEntry } from '@pwa-easy-rental/shared-services';

const TIER_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  BRONZE: { color: '#b45309', bg: 'rgba(180,83,9,0.12)', label: 'Bronze' },
  ARGENT: { color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'Argent' },
  OR: { color: '#d4af37', bg: 'rgba(212,175,55,0.14)', label: 'Or' },
  PLATINE: { color: '#0e7490', bg: 'rgba(14,116,144,0.12)', label: 'Platine' },
};

const SOURCE_LABELS: Record<string, string> = {
  EARN_RENTAL: 'Gain location',
  REDEEM_BOOKING: 'Remise réservation',
};

export const LoyaltyView = ({ userData, lang = 'FR' }: { userData: any; lang?: 'FR' | 'EN' }) => {
  const dateLocale = lang === 'EN' ? enUS : frLocale;
  const [balance, setBalance] = useState<LoyaltyBalance | null>(null);
  const [history, setHistory] = useState<LoyaltyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientId = userData?.id;
    if (!clientId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [balRes, histRes] = await Promise.all([
          loyaltyService.getBalance(clientId),
          loyaltyService.getHistory(clientId),
        ]);
        if (!cancelled) {
          if (balRes.ok && balRes.data) setBalance(balRes.data);
          if (histRes.ok && Array.isArray(histRes.data)) {
            setHistory([...histRes.data].sort((a, b) => {
              const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return db - da;
            }));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userData?.id]);

  const tier = (balance?.tier || 'BRONZE').toUpperCase();
  const tierStyle = TIER_STYLES[tier] ?? TIER_STYLES.BRONZE;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#0528d6] size-12" />
      <p className="text-sm font-bold italic text-slate-400 tracking-widest">Chargement de votre fidélité...</p>
    </div>
  );

  return (
    <div className="w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4 text-left">

      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">Fidélité</h2>
          <p className="text-slate-400 text-xs font-medium mt-1">Vos points, votre statut, votre historique</p>
        </div>
        <div className="relative size-11 bg-white shadow-sm border border-slate-100 text-[#0528d6] rounded-2xl flex items-center justify-center">
          <Gift size={18} />
        </div>
      </div>

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 bg-slate-900 text-white shadow-2xl">
        <div
          className="absolute -top-16 -right-16 size-48 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: tierStyle.color }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 flex items-center gap-2">
              <TrendingUp size={12} /> Solde de points
            </p>
            <p className="text-5xl font-black italic tracking-tighter">
              {Number(balance?.balance ?? 0).toLocaleString('fr-FR')}
            </p>
            <p className="text-xs text-white/50 font-medium mt-2">
              {Number(balance?.annualPoints ?? 0).toLocaleString('fr-FR')} points cumulés cette année
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black italic uppercase tracking-widest text-sm shrink-0 shadow-lg"
            style={{ backgroundColor: tierStyle.bg, color: tierStyle.color, border: `1px solid ${tierStyle.color}55` }}
          >
            <Star size={16} fill={tierStyle.color} />
            {tierStyle.label}
          </div>
        </div>
      </div>

      {/* Barème */}
      <div className="flex items-start gap-3 p-5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-2xl">
        <Gift size={18} className="text-[#0528d6] shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong className="text-[#0528d6]">1 point = 10 FCFA de remise</strong> · gagnez 1 point par tranche de 1000 FCFA de location.
        </p>
      </div>

      {/* Historique */}
      <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8">
        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5">Historique des points</h4>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((entry) => {
              const isEarn = entry.deltaPoints >= 0;
              const label = SOURCE_LABELS[entry.sourceType] ?? entry.sourceType;
              let dateLabel = '—';
              try {
                if (entry.createdAt) dateLabel = format(new Date(entry.createdAt), 'dd MMM yyyy, HH:mm', { locale: dateLocale });
              } catch { /* noop */ }
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#0528d6]/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isEarn ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {isEarn ? <TrendingUp size={16} /> : <Gift size={16} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{label}</p>
                      <p className="text-[10px] text-slate-400 font-medium tracking-wide">{dateLabel}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black ${isEarn ? 'text-green-600' : 'text-red-500'}`}>
                      {isEarn ? '+' : '−'}{Math.abs(entry.deltaPoints).toLocaleString('fr-FR')}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      Solde: {Number(entry.balanceAfter ?? 0).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="size-16 bg-slate-50 dark:bg-slate-900 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Gift size={28} />
            </div>
            <p className="text-slate-400 text-sm font-medium italic">Aucun mouvement de points pour l&apos;instant.</p>
          </div>
        )}
      </div>
    </div>
  );
};

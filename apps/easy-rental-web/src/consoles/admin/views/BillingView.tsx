/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, CreditCard, Briefcase, Building2 } from 'lucide-react';
import { statisticsService, type SubscriptionBilling } from '@pwa-easy-rental/shared-services';

const formatFcfa = (value: number | string | null | undefined): string => {
  const n = value == null ? 0 : Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toLocaleString('fr-FR')} FCFA`;
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const planBadgeClasses = (planName: string) => {
  const p = (planName || '').toUpperCase();
  if (p.includes('ENTERPRISE')) return 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 border-purple-200';
  if (p.includes('PRO')) return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 border-blue-200';
  if (p.includes('FREELANCE')) return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 border-amber-200';
  if (p.includes('FREE')) return 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 border-slate-200';
  return 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 border-slate-200';
};

export const BillingView = () => {
  const [rows, setRows] = useState<SubscriptionBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await statisticsService.listActiveSubscriptionsBilling();
      if (!res.ok || !res.data) {
        setError('Impossible de charger la facturation.');
        return;
      }
      setRows(res.data as SubscriptionBilling[]);
    } catch (e: any) {
      setError(e?.message || 'Erreur inattendue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalMRR = rows.reduce((sum, r) => {
    const n = r.price == null ? 0 : Number(r.price);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  const paidCount = rows.filter((r) => {
    const n = r.price == null ? 0 : Number(r.price);
    return Number.isFinite(n) && n > 0;
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black italic uppercase tracking-widest text-slate-400">
          Facturation — abonnements actifs, plans souscrits et montants
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-black italic uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1a1d2d] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#0528d6]">
            <CreditCard size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black italic uppercase tracking-widest text-slate-400">Abonnements actifs</div>
            <div className="text-2xl font-black italic text-slate-900 dark:text-white">{rows.length}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1a1d2d] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
            <Briefcase size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black italic uppercase tracking-widest text-slate-400">Payants</div>
            <div className="text-2xl font-black italic text-slate-900 dark:text-white">{paidCount}</div>
          </div>
        </div>
        <div className="bg-[#0528d6] p-6 rounded-2xl shadow-lg flex items-center gap-4 text-white">
          <div className="p-3 rounded-xl bg-white/15">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black italic uppercase tracking-widest text-blue-100">Total mensuel</div>
            <div className="text-2xl font-black italic">{formatFcfa(totalMRR)}</div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 italic">
          <Loader2 size={16} className="animate-spin" /> Chargement…
        </div>
      )}
      {error && (
        <p className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 text-[11px] font-black italic uppercase tracking-widest text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-[#0f1323] text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                <tr>
                  <th className="px-4 py-3">Organisation</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Prix / mois</th>
                  <th className="px-4 py-3">Début</th>
                  <th className="px-4 py-3">Fin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                      Aucun abonnement actif.
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.subscriptionId} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-black text-slate-900 dark:text-white italic">{r.organizationName ?? '—'}</div>
                      <div className="text-[11px] text-slate-400 font-medium italic">{r.organizationEmail ?? '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      {r.accountType === 'FREELANCE' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 text-[10px] font-black uppercase border border-amber-200">
                          Freelance
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 text-[10px] font-black uppercase">
                          Société
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide ${planBadgeClasses(r.planName)}`}>
                        {r.planName}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black italic text-slate-900 dark:text-white whitespace-nowrap">
                      {formatFcfa(r.price)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(r.startDate)}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(r.endDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

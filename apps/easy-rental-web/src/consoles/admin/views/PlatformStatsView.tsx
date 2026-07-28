'use client';
import React, { useEffect, useState } from 'react';
import {
  Loader2,
  RefreshCw,
  Users,
  UserRound,
  Building2,
  Briefcase,
  Warehouse,
  Car,
  Clock3,
  CheckCircle2,
  Wallet,
  Repeat,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import { statisticsService } from '@pwa-easy-rental/shared-services';
import type { PlatformStats } from '@pwa-easy-rental/shared-services';
import { StatCard } from '../components/StatCard';

function formatFcfa(value: number | string | null | undefined): string {
  const n = value == null ? 0 : Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toLocaleString('fr-FR')} FCFA`;
}

export const PlatformStatsView = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');
    const res = await statisticsService.getPlatformStats();
    if (res.ok && res.data) {
      setStats(res.data);
    } else {
      setError('Impossible de charger les statistiques plateforme.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0528d6] size-8" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <section className="space-y-4">
        <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
          {error || 'Aucune donnée disponible.'}
        </p>
        <button
          type="button"
          onClick={loadStats}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-[#0528d6] hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
        >
          <RefreshCw size={14} /> Réessayer
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
          Vue d&apos;ensemble de la plateforme
        </p>
        <button
          type="button"
          onClick={loadStats}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-[#0528d6] hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
        >
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Ligne 1 : utilisateurs & organisations */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Utilisateurs" value={stats.users.total} icon={<Users />} />
        <StatCard label="Clients" value={stats.users.clients} icon={<UserRound />} />
        <StatCard label="Organisations" value={stats.organizations.total} icon={<Building2 />} />
        <StatCard label="Freelances" value={stats.organizations.freelances} icon={<Briefcase />} />
      </div>

      {/* Ligne 2 : agences, véhicules, locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Agences" value={stats.agencies.total} icon={<Warehouse />} />
        <StatCard label="Véhicules publiés" value={stats.vehicles.published} icon={<Car />} />
        <StatCard label="Locations en cours" value={stats.rentals.ongoing} icon={<Clock3 />} />
        <StatCard label="Complétées ce mois" value={stats.rentals.monthlyCompleted} icon={<CheckCircle2 />} />
      </div>

      {/* Ligne 3 : suspensions & dettes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <StatCard label="Organisations suspendues" value={stats.organizations.suspended} icon={<Ban />} />
        <StatCard
          label="Dettes en cours"
          value={`${(stats.revenue.totalOutstandingDebt ?? 0).toLocaleString()} FCFA`}
          icon={<AlertTriangle />}
        />
      </div>

      {/* Ligne 4 : mise en avant revenu */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-[#0528d6] to-[#0a3fd8] p-8 rounded-3xl shadow-lg shadow-blue-600/20 flex items-center gap-6">
          <div className="size-16 bg-white/15 rounded-2xl flex items-center justify-center text-white shrink-0">
            <Wallet size={28} />
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-[10px] font-black uppercase text-blue-100 tracking-[0.2em] italic mb-1 truncate">
              MRR Abonnements
            </p>
            <p className="text-3xl font-black text-white leading-none truncate tracking-tighter italic">
              {formatFcfa(stats.revenue.monthlyRecurringRevenue)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d2d] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
          <div className="size-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-[#0528d6] shrink-0">
            <Repeat size={28} />
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic mb-1 truncate">
              Abonnements actifs
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white leading-none truncate tracking-tighter italic">
              {stats.revenue.subscriptionsActiveCount}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

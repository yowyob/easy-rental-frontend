/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { Car, Users, Activity, Building2, TrendingUp, Wallet, CalendarCheck, ArrowUpRight } from 'lucide-react';
import { statsService } from '@pwa-easy-rental/shared-services';
import { StatCard } from '../components/StatCard';

export const DashboardView = ({ agencyData, t, setCurrentView }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agencyData?.id) {
      statsService.getAgencyDashboard(agencyData.id).then((res) => {
        if (res.ok) setData(res.data);
        setLoading(false);
      });
    }
  }, [agencyData?.id]);

  if (loading || !data) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Activity className="animate-spin text-[#0528d6]" size={32} />
      </div>
    );
  }

  const { summary, revenueEvolution, rentalStatusDistribution } = data;
  const pendingCount = rentalStatusDistribution?.distribution?.PENDING ?? 0;
  const reservedCount = summary.totalReservations ?? 0;
  const revenueMax = Math.max(...(revenueEvolution.values ?? []), 1);
  const hasRevenue = (revenueEvolution.values ?? []).some((v: number) => v > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 text-left">
      <div className="bg-white dark:bg-[#1a1d2d] p-8 md:p-12 rounded-[3rem] border-b-4 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 dark:opacity-10 pointer-events-none">
          <Building2 size={150} className="text-[#0528d6]" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black italic text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            {t.header.greet}
          </h1>
          <p className="text-slate-400 mt-3 italic text-sm font-medium">
            {t.dashboard.agencyLabel} :{' '}
            <span className="text-[#0528d6] dark:text-blue-400 font-black uppercase tracking-widest">
              {agencyData?.name}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t.kpi.inventory} value={summary.totalVehicles} icon={<Car />} />
        <StatCard label={t.kpi.drivers} value={summary.totalDrivers} icon={<Users />} />
        <StatCard label={t.table.colRev} value={`${summary.totalRevenue?.toLocaleString()} XAF`} icon={<Wallet className="text-[#0528d6]" />} />
        <StatCard label={t.kpi.active} value={summary.activeRentals} icon={<CalendarCheck className="text-green-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[10px] font-black uppercase italic tracking-widest flex items-center gap-2 mb-8 text-slate-400">
            <TrendingUp size={14} /> {t.dashboard.revenueEvolution}
          </h3>
          {!hasRevenue ? (
            <p className="text-xs text-slate-400 italic h-40 flex items-center justify-center">
              {t.dashboard.noRevenueData}
            </p>
          ) : (
            <>
              <div className="flex items-end gap-1.5 h-40">
                {revenueEvolution.values.map((v: number, i: number) => (
                  <div
                    key={i}
                    className="flex-1 bg-[#0528d6] rounded-t-lg opacity-20 hover:opacity-100 transition-all cursor-help relative group"
                    style={{ height: `${(v / revenueMax) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20">
                      {v.toLocaleString()} XAF
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-3 uppercase">
                <span>{revenueEvolution.labels[0] ?? '—'}</span>
                <span>{revenueEvolution.labels[revenueEvolution.labels.length - 1] ?? '—'}</span>
              </div>
            </>
          )}
        </div>

        <div className="bg-[#0528d6] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <ArrowUpRight className="absolute -top-6 -right-6 opacity-10 rotate-12" size={180} />
          <div>
            <h4 className="font-bold mb-4 italic uppercase text-[11px] tracking-[0.2em] opacity-80">
              {t.dashboard.agencyActivity}
            </h4>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-[9px] font-black uppercase opacity-60 mb-1 italic">{t.dashboard.pendingReservations}</p>
                <p className="text-2xl font-black italic tracking-tighter">{pendingCount}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-[9px] font-black uppercase opacity-60 mb-1 italic">{t.dashboard.confirmedReservations}</p>
                <p className="text-2xl font-black italic tracking-tighter">{reservedCount}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-[9px] font-black uppercase opacity-60 mb-1 italic">{t.kpi.active}</p>
                <p className="text-2xl font-black italic tracking-tighter">{summary.activeRentals}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView?.('TRANSACTIONS')}
            className="mt-8 w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-tighter bg-white text-[#0528d6] py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition-all italic"
          >
            {t.table.viewAll}
          </button>
        </div>
      </div>
    </div>
  );
};

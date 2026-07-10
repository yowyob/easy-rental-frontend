/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { 
  Store, Zap, BarChart3, Users, Car, Target, TrendingUp, 
  Activity, PieChart, CalendarCheck, Wallet, ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { statsService } from '@pwa-easy-rental/shared-services';
import { KpiCard } from '../components/KpiCard';
import { SparklineChart } from '../components/SparklineChart';

export const DashboardView = ({ orgData, t }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgData?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    statsService.getOrgDashboard(orgData.id).then((res) => {
      if (res.ok && res.data) setData(res.data);
      else setData(null);
      setLoading(false);
    });
  }, [orgData?.id]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Activity className="animate-spin text-[#0528d6]" size={40} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 text-sm font-medium italic">
        {t.dashboard?.loadError ?? 'Impossible de charger le tableau de bord.'}
      </div>
    );
  }

  const { summary, revenueEvolution, rentalEvolution, vehicleStatusDistribution, rentalStatusDistribution, agencyComparison } = data;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label={t.dashboard.agencies} value={summary.totalAgencies} icon={<Store />} />
        <KpiCard label={t.dashboard.fleetVehicles} value={summary.totalVehicles} icon={<Car />} />
        <KpiCard label={t.dashboard.drivers} value={summary.totalDrivers} icon={<Users />} />
        <KpiCard label={t.dashboard.totalStaff} value={summary.totalStaff} icon={<UserCheck className="text-orange-500" />} />
        
        <KpiCard label={t.dashboard.globalRevenue} value={`${summary.totalRevenue?.toLocaleString()} XAF`} icon={<Wallet className="text-green-500" />} highlight />
        <KpiCard label={t.dashboard.monthlyRevenue} value={`${summary.monthlyRevenue?.toLocaleString()} XAF`} icon={<BarChart3 />} />
        <KpiCard label={t.dashboard.totalRentals} value={summary.totalRentals} growth={`${summary.totalReservations} ${t.dashboard.reservationsCount}`} icon={<Zap />} />
        <KpiCard label={t.dashboard.activeRentals} value={summary.activeRentals} icon={<Activity className="text-blue-500" />} highlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2 mb-6">
            <TrendingUp size={16} className="text-[#0528d6]" /> {t.dashboard.revenueEvolution}
          </h3>
          <SparklineChart
            values={revenueEvolution.values ?? []}
            labels={revenueEvolution.labels ?? []}
            color="#0528d6"
            unit="XAF"
            emptyLabel={t.dashboard?.noData ?? 'Aucune donnée pour le moment.'}
          />
          <div className="flex justify-between mt-3 text-[8px] font-black text-slate-400 italic">
            <span>{revenueEvolution.labels?.[0] ?? '—'}</span>
            <span>{revenueEvolution.labels?.[revenueEvolution.labels.length - 1] ?? '—'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2 mb-6">
            <CalendarCheck size={16} className="text-[#F76513]" /> {t.dashboard.rentalVolume}
          </h3>
          <SparklineChart
            values={rentalEvolution.values ?? []}
            labels={rentalEvolution.labels ?? []}
            color="#F76513"
            emptyLabel={t.dashboard?.noData ?? 'Aucune donnée pour le moment.'}
          />
          <div className="flex justify-between mt-3 text-[8px] font-black text-slate-400 italic">
            <span>{rentalEvolution.labels?.[0] ?? '—'}</span>
            <span>{rentalEvolution.labels?.[rentalEvolution.labels.length - 1] ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        <div className="space-y-8">
            <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-6"><PieChart size={14} className="text-[#0528d6]"/> {t.dashboard.fleetStatus}</h3>
                <div className="space-y-4">
                    {Object.keys(vehicleStatusDistribution.distribution).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">{t.dashboard?.noData ?? 'Aucune donnée pour le moment.'}</p>
                    ) : Object.entries(vehicleStatusDistribution.distribution).map(([key, val]: any) => (
                        <div key={key} className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-black  italic text-slate-500"><span>{key}</span><span>{val}</span></div>
                            <div className="h-1.5 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800"><div className="h-full bg-[#0528d6]" style={{ width: `${summary.totalVehicles ? (val / summary.totalVehicles) * 100 : 0}%` }}/></div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-6"><Activity size={14} className="text-orange-500"/> {t.dashboard.rentalStatus}</h3>
                <div className="space-y-4">
                    {Object.keys(rentalStatusDistribution.distribution).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">{t.dashboard?.noData ?? 'Aucune donnée pour le moment.'}</p>
                    ) : Object.entries(rentalStatusDistribution.distribution).map(([key, val]: any) => (
                        <div key={key} className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-black  italic text-slate-500"><span>{key}</span><span>{val}</span></div>
                            <div className="h-1.5 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800"><div className="h-full bg-orange-500" style={{ width: `${summary.totalRentals ? (val / summary.totalRentals) * 100 : 0}%` }}/></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2 mb-10"><Target size={18} className="text-[#0528d6]"/> {t.dashboard.agencyComparison}</h3>
          <div className="space-y-8">
            {agencyComparison.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{t.dashboard?.noAgencies ?? 'Aucune agence pour comparer les performances.'}</p>
            ) : agencyComparison.map((agency: any, idx: number) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white uppercase italic">{agency.agencyName}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {t.dashboard.agencyFleet}: {agency.totalVehicles} — {t.dashboard.agencyActivity}: {agency.totalRentals} {t.dashboard.rentalsCount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[#0528d6]">{agency.revenue?.toLocaleString()} XAF</p>
                    <div className="flex items-center justify-end gap-1 text-[8px] font-black text-green-500 uppercase italic"><ArrowUpRight size={10}/> {t.dashboard.marketShare}</div>
                  </div>
                </div>
                <div className="h-3 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800"><div className="h-full bg-[#0528d6] transition-all duration-1000" style={{ width: `${summary.totalRevenue ? (agency.revenue / summary.totalRevenue) * 100 : 0}%` }}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { X, Loader2, MapPin, Clock, ShieldCheck, Globe, Target, BarChart3, Zap } from 'lucide-react';
import { Portal } from '../../components/Portal';
import { agencyService, statsService, formatGeofenceRadius, resolveAgencyContact, orgService } from '@pwa-easy-rental/shared-services';

export const AgencyDetailsModal = ({ agencyId, onClose, t, userData }: any) => {
  const [data, setData] = useState<any>(null);
  const [orgData, setOrgData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [res, statRes] = await Promise.all([
            agencyService.getAgencyDetails(agencyId),
            statsService.getAgencyDetailedReport(agencyId)
        ]);
      if (res.ok) setData(res.data);
      if (statRes.ok) setStats(statRes.data);
      if (userData?.organizationId) {
        const orgRes = await orgService.getOrgDetails(userData.organizationId);
        if (orgRes.ok) setOrgData(orgRes.data);
      }
      setLoading(false);
    };
    fetch();
  }, [agencyId, userData]);

  if (loading || !data) return (
    <Portal>
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
            <Loader2 className="animate-spin text-white size-12" />
        </div>
    </Portal>
  );

  const contact = resolveAgencyContact(data, orgData);
  const missingContact = !contact.address && !contact.email && !contact.phone;

  return (
    <Portal>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 md:p-4 text-left">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose} />
        <div className="relative w-full max-w-5xl bg-white dark:bg-[#1a1d2d] rounded-[3rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-white/20 animate-in zoom-in">
          
          <div className="px-6 md:px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-[#0528d6] text-white">
            <div className="flex items-center gap-4 md:gap-6">
                <div className="size-14 md:size-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden shrink-0 shadow-xl">
                    <img src={data.logoUrl || `https://ui-avatars.com/api/?name=${data.name}&background=fff&color=0528d6`} className="w-full h-full object-cover" alt="logo"/>
                </div>
                <div>
                    <h3 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">{data.name}</h3>
                    <p className="text-[10px] md:text-xs font-bold opacity-70 uppercase tracking-[0.2em] mt-2 italic flex items-center gap-2"><MapPin size={12}/> {[contact.city, contact.region].filter(Boolean).join(', ') || '—'}</p>
                </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X size={24}/></button>
          </div>

          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-12">
            
            {/* Stats section - Reserved for authorized staff */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <StatBox label={t.agencies.stats.revenue || "Revenu"} value={`${stats?.totalRevenue?.toLocaleString() || 0} XAF`} icon={<BarChart3 className="text-green-500"/>} />
                <StatBox label={t.sidebar.rentals} value={stats?.totalRentals || 0} icon={<Zap className="text-orange-500"/>} />
                <StatBox label={t.agencies.stats.active} value={stats?.activeRentals || 0} icon={<Clock className="text-blue-500"/>} />
                <StatBox label={t.rental.cancel || "Annulations"} value={stats?.cancelledRentals || 0} icon={<X className="text-red-500"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black uppercase text-[#0528d6] italic mb-8 flex items-center gap-3 border-b dark:border-slate-800 pb-4"><Globe size={18}/> {t.onboarding.step2Title}</h4>
                    <div className="space-y-6">
                        {missingContact && (
                          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 italic p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                            {t.agencies?.details?.missingContact ?? 'Coordonnées incomplètes — modifiez l\'agence pour renseigner adresse, e-mail et téléphone.'}
                          </p>
                        )}
                        <DataRow label={t.onboarding.form.address} value={contact.address} />
                        <DataRow label={t.onboarding.form.email} value={contact.email} />
                        <DataRow label={t.onboarding.form.phone} value={contact.phone} />
                        <div className="pt-6 grid grid-cols-2 gap-4">
                            <DataRow label="Latitude" value={data.latitude} mono />
                            <DataRow label="Longitude" value={data.longitude} mono />
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black uppercase text-[#0528d6] italic mb-8 flex items-center gap-3 border-b dark:border-slate-800 pb-4"><Target size={18}/> {t.agencies.modal?.operationalSettings ?? 'Paramètres opérationnels'}</h4>
                    <div className="space-y-6">
                        <DataRow label={t.sidebar.status} value={data.is24Hours ? t.agencies.modal.hours24 : (data.workingHours || '—')} />
                        <DataRow label="Geofencing" value={formatGeofenceRadius(data.geofenceRadius)} />
                        <DataRow label={t.agencies.modal.deposit} value={data.depositPercentage != null ? `${data.depositPercentage} %` : '—'} />
                        <div className="pt-6 flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <ShieldCheck className="text-green-500" size={24}/>
                            <p className="text-[10px] font-black uppercase text-slate-800 dark:text-white italic">{t.agencies.modal.submit}</p>
                        </div>
                    </div>
                </section>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

const StatBox = ({ label, value, icon }: any) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 italic">{icon}</div>
        <p className="text-[9px] font-black text-slate-400 uppercase italic tracking-widest truncate">{label}</p>
        <p className="text-lg font-black text-slate-900 dark:text-white mt-1 italic tracking-tighter">{value}</p>
    </div>
);

const DataRow = ({ label, value, mono }: any) => (
    <div className="flex justify-between items-center group gap-4">
        <span className="text-[10px] font-black text-slate-400 uppercase italic whitespace-nowrap">{label}</span>
        <span className={`text-sm font-black text-slate-800 dark:text-slate-100 italic truncate ${mono ? 'font-mono' : ''}`}>{value || '---'}</span>
    </div>
);
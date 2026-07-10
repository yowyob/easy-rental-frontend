/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { Check, Loader2, Zap, ShieldCheck, MessageSquare, LayoutGrid, Car } from 'lucide-react';

export const PlanCard = ({ plan, isCurrent, onSelect, loading, t }: any) => {
  const isYearly = plan.billingPeriod === 'YEARLY';
  const isFree = plan.billingPeriod === 'UNLIMITED' || plan.price <= 0;

  return (
  <div className={`
    relative bg-white dark:bg-[#1a1d2d] p-8 md:p-10 rounded-[2.5rem] border-2 transition-all flex flex-col h-full group text-left
    ${isCurrent ? 'border-[#0528d6] shadow-2xl scale-[1.02] z-10' : 'border-slate-100 dark:border-slate-800 hover:border-blue-200'}
  `}>
    {isCurrent && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0528d6] text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl italic">
        {t.subscription.activePlanBadge}
      </div>
    )}

    <div className="mb-8">
      <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{plan.name}</h5>
      <p className="text-xs text-slate-400 mt-2 italic font-medium leading-relaxed">{plan.description}</p>
    </div>

    <div className="mb-10 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border dark:border-slate-800 shadow-inner space-y-2">
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className="text-4xl font-black text-[#0528d6] dark:text-blue-400 tracking-tighter italic">
          {plan.price.toLocaleString()}
        </span>
        <span className="text-xs font-black text-slate-400 uppercase italic ml-1">
          XAF {isFree ? '' : isYearly ? t.subscription.perYear : t.subscription.perMonth}
        </span>
      </div>
      {isYearly && (
        <p className="text-[10px] font-bold text-slate-500 italic">
          ≈ {plan.monthlyEquivalentPrice.toLocaleString()} XAF {t.subscription.perMonthEquivalent}
        </p>
      )}
      {!isFree && plan.durationDays > 0 && (
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {plan.durationDays} {t.subscription.daysActive}
        </p>
      )}
    </div>

    <ul className="flex-1 space-y-5 mb-10">
      <FeatureItem icon={<LayoutGrid size={16}/>} label={`${plan.maxAgencies} ${t.subscription.quotas.agencies}`} active={true} />
      <FeatureItem icon={<Car size={16}/>} label={`${plan.maxVehicles} ${t.subscription.quotas.vehicles}`} active={true} />
      <FeatureItem icon={<ShieldCheck size={16}/>} label={t.subscription.quotas.geofencing} active={plan.hasGeofencing} />
      <FeatureItem icon={<MessageSquare size={16}/>} label={t.subscription.quotas.chat} active={plan.hasChat} />
    </ul>

    {!isCurrent ? (
      <button 
        onClick={() => onSelect(plan.name)}
        disabled={loading}
        className="w-full py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 italic tracking-widest"
      >
        {loading ? <Loader2 className="animate-spin size-4" /> : <><Zap size={16}/> {t.subscription.subscribeBtn}</>}
      </button>
    ) : (
      <div className="w-full py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-[10px] uppercase text-center border border-slate-100 dark:border-slate-700 italic tracking-[0.2em] shadow-inner">
        {t.subscription.alreadyInUse}
      </div>
    )}
  </div>
  );
};

const FeatureItem = ({ label, active, icon }: { label: string, active: boolean, icon: React.ReactNode }) => (
  <li className={`flex items-center gap-4 text-xs font-black uppercase italic transition-opacity ${active ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600 opacity-40'}`}>
    <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${active ? 'bg-blue-50 dark:bg-blue-900/20 text-[#0528d6] dark:text-blue-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-300'}`}>
      {React.cloneElement(icon as React.ReactElement, { strokeWidth: 3 })}
    </div>
    <span className={active ? '' : 'line-through tracking-wider'}>{label}</span>
    {active && <Check size={14} className="ml-auto text-green-500" strokeWidth={4} />}
  </li>
);

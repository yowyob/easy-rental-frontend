/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import { Shield, LayoutGrid, Loader2, AlertCircle, Clock, Zap } from 'lucide-react';
import { agencyService, extraService, orgService } from '@pwa-easy-rental/shared-services';
import { PlanCard } from './subscription/PlanCard';
import { SubscriptionPaymentModal } from './subscription/SubscriptionPaymentModal';
import type { SubscriptionPaymentMethod } from '@pwa-easy-rental/shared-services';

export const SubscriptionView = ({ orgData, t }: any) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [realAgenciesCount, setRealAgenciesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [paymentPlan, setPaymentPlan] = useState<{ name: string; price: number; billingPeriod?: string; monthlyEquivalentPrice?: number } | null>(null);

  useEffect(() => { loadSubscriptionData(); }, [orgData?.id]);

  const loadSubscriptionData = async () => {
    if (!orgData?.id) return;
    setLoading(true);
    try {
      const [plansRes, subRes, agenciesRes] = await Promise.all([
        extraService.getPlans(),
        orgService.getSubscription(orgData.id),
        agencyService.getAgencies(orgData.id)
      ]);
      
      if (plansRes.ok) {
        // Filtrer les plans selon le type de compte : un freelance ne voit
        // que les plans FREELANCE_*, une société ne voit que les plans COMPANY.
        const orgType = (orgData?.accountType || 'COMPANY').toUpperCase();
        const filtered = (plansRes.data as any[]).filter((p) => {
          const target = (p.targetType || 'COMPANY').toUpperCase();
          return target === orgType;
        });
        setPlans(filtered);
      }
      if (subRes.ok) setCurrentSub(subRes.data);
      if (agenciesRes.ok) setRealAgenciesCount(agenciesRes.data?.length || 0);
      
    } catch {
      // console.error("Erreur de chargement", error);
    } finally {
      setLoading(false);
    }
  };

  const executePlanChange = async (planName: string, paymentMethod?: SubscriptionPaymentMethod) => {
    if (!orgData?.id) return;
    setActionLoading(planName);
    try {
      const res = await orgService.upgradePlan(orgData.id, planName, paymentMethod);
      if (res.ok) {
        setPaymentPlan(null);
        await loadSubscriptionData();
        const isCancellation = planName === 'FREE';
        alert(isCancellation ? t.subscription.alertFreeSuccess : `${t.subscription.alertUpgradeSuccess} ${planName}`);
      } else {
        const message = (res.data as { message?: string } | null)?.message;
        alert(message || t.subscription.alertError);
      }
    } catch {
      alert(t.subscription.alertError);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePlanChange = async (planName: string) => {
    const isCancellation = planName === 'FREE';
    if (isCancellation && !window.confirm(t.subscription.confirmFree)) return;

    const selectedPlan = plans.find((plan) => plan.name === planName);
    const isPaidUpgrade = !isCancellation && (selectedPlan?.price ?? 0) > 0;

    if (isPaidUpgrade && selectedPlan) {
      setPaymentPlan({
        name: selectedPlan.name,
        price: selectedPlan.price,
        billingPeriod: selectedPlan.billingPeriod,
        monthlyEquivalentPrice: selectedPlan.monthlyEquivalentPrice,
      });
      return;
    }

    await executePlanChange(planName);
  };

  const handleRenewCurrentPlan = () => {
    if (!currentSub?.planName || currentSub.planName === 'FREE') return;
    const selectedPlan = plans.find((plan) => plan.name === currentSub.planName);
    if (!selectedPlan) return;
    setPaymentPlan({
      name: selectedPlan.name,
      price: selectedPlan.price,
      billingPeriod: selectedPlan.billingPeriod,
      monthlyEquivalentPrice: selectedPlan.monthlyEquivalentPrice,
    });
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#0528d6] size-10" /></div>;

  const isFreePlan = currentSub?.planName === 'FREE';
  const hasOverQuota = Boolean(
    currentSub?.overQuotaAgencies
    || currentSub?.overQuotaVehicles
    || currentSub?.overQuotaDrivers
    || currentSub?.overQuotaUsers
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">

      {currentSub?.renewalDueSoon && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-[1.5rem] p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-black text-amber-700 dark:text-amber-300">{t.subscription.renewalSoonTitle}</p>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-1">
              {t.subscription.renewalSoonDesc.replace('{days}', String(currentSub.daysRemaining ?? 0))}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRenewCurrentPlan}
            className="px-5 py-3 bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-700"
          >
            {t.subscription.renewBtn}
          </button>
        </div>
      )}

      {hasOverQuota && (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-[1.5rem] p-6">
          <p className="text-sm font-black text-orange-700 dark:text-orange-300">{t.subscription.overQuotaTitle}</p>
          <p className="text-xs text-orange-800/80 dark:text-orange-200/80 mt-1">{t.subscription.overQuotaDesc}</p>
        </div>
      )}
      
      {/* SECTION 1 : STATUT ACTUEL */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <Shield className="text-[#0528d6]" size={20} />
          <h4 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">{t.subscription.licenceStatus}</h4>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte Plan Actuel */}
          <div className="lg:col-span-1 bg-[#0528d6] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-600/20">
            <Zap size={180} className="absolute -bottom-10 -right-10 text-white/10 rotate-12" />
            <div className="relative z-10 space-y-4">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
                {t.subscription.activeLicence}
              </span>
              <h3 className="text-4xl font-black italic  tracking-tighter">
                {currentSub?.planName || "---"}
              </h3>
              <div className="flex items-center gap-2 text-blue-100 text-[11px] font-bold  tracking-tight italic pt-2">
                <Clock size={14} /> 
                {currentSub?.expiresAt
                  ? `${t.subscription.expiresOn} ${new Date(currentSub.expiresAt).toLocaleDateString()} (${currentSub.daysRemaining} ${t.subscription.daysRemaining})`
                  : t.subscription.unlimited}
              </div>
            </div>
          </div>

          {/* Jauge d'évolution des Quotas */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a1d2d] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-4 text-xs font-bold  tracking-tight">
              <div className="flex items-center gap-3 text-[#0528d6]">
                <LayoutGrid size={20}/> {t.subscription.consumptionTitle}
              </div>
              <span className="text-slate-400 text-sm font-black">{realAgenciesCount} / {currentSub?.maxAgencies || 1}</span>
            </div>
            
            <div className="h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700">
              <div 
                className={`h-full transition-all duration-1000 rounded-full ${ (realAgenciesCount / (currentSub?.maxAgencies || 1)) >= 0.85 ? 'bg-[#F76513]' : 'bg-[#0528d6]'}`} 
                style={{ width: `${Math.min((realAgenciesCount / (currentSub?.maxAgencies || 1)) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-4 text-[10px] font-medium text-slate-400 italic">
              {t.subscription.consumptionDesc}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 : CATALOGUE */}
      <section className="space-y-8">
        <div className="text-center space-y-1">
          <h4 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none italic">{t.subscription.availablePlans}</h4>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">{t.subscription.plansSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              isCurrent={currentSub?.planName === plan.name}
              onSelect={handlePlanChange}
              loading={actionLoading === plan.name}
              t={t}
            />
          ))}
        </div>
      </section>

      {/* SECTION 3 : ANNULATION (Zone de danger) */}
      {!isFreePlan && (
        <section className="bg-red-50/30 dark:bg-red-950/10 p-8 rounded-[2rem] border border-red-100 dark:border-red-900/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 shadow-inner shrink-0">
              <AlertCircle size={28} />
            </div>
            <div className="text-left">
              <h5 className="text-lg font-bold text-red-600 tracking-tight">{t.subscription.dangerZone}</h5>
              <p className="text-xs text-slate-500 max-w-sm font-medium italic leading-relaxed">
                {t.subscription.dangerDesc}
              </p>
            </div>
          </div>
          <button 
            onClick={() => handlePlanChange('FREE')}
            disabled={!!actionLoading}
            className="px-8 py-3 bg-white text-red-500 rounded-xl font-bold text-xs  shadow-sm border border-red-100 hover:bg-red-500 hover:text-white transition-all shrink-0"
          >
            {actionLoading === 'FREE' ? <Loader2 className="animate-spin size-4" /> : t.subscription.cancelBtn}
          </button>
        </section>
      )}

      {paymentPlan && (
        <SubscriptionPaymentModal
          plan={paymentPlan}
          loading={!!actionLoading}
          t={t}
          onClose={() => setPaymentPlan(null)}
          onSubmit={(method) => executePlanChange(paymentPlan.name, method)}
        />
      )}

    </div>
  );
};
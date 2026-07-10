/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { Loader2, CreditCard, Smartphone, Banknote, Zap } from 'lucide-react';
import { Portal } from '../../components/Portal';
import type { SubscriptionPaymentMethod } from '@pwa-easy-rental/shared-services';

type SubscriptionPaymentModalProps = {
  plan: { name: string; price: number; billingPeriod?: string; monthlyEquivalentPrice?: number };
  onClose: () => void;
  onSubmit: (method: SubscriptionPaymentMethod) => void;
  loading: boolean;
  t: any;
};

export const SubscriptionPaymentModal = ({
  plan,
  onClose,
  onSubmit,
  loading,
  t,
}: SubscriptionPaymentModalProps) => {
  const [method, setMethod] = useState<SubscriptionPaymentMethod>('MOMO');

  return (
    <Portal>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

        <div className="relative w-full max-w-md bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] shadow-2xl p-10 border border-white/20 animate-in zoom-in">
          <div className="size-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-[#0528d6] mx-auto mb-6">
            <Zap size={32} />
          </div>

          <h3 className="text-2xl font-bold text-center mb-2">{t.subscription.paymentTitle}</h3>
          <p className="text-xs text-slate-400 italic text-center mb-8 tracking-widest uppercase">
            {plan.name} — {plan.price.toLocaleString()} XAF
            {plan.billingPeriod === 'YEARLY' ? ` / ${t.subscription.perYear}` : ''}
            {plan.billingPeriod === 'YEARLY' && plan.monthlyEquivalentPrice
              ? ` (≈ ${plan.monthlyEquivalentPrice.toLocaleString()} XAF${t.subscription.perMonthEquivalent})`
              : ''}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { id: 'MOMO' as const, label: 'MoMo', icon: <Smartphone size={16} /> },
              { id: 'OM' as const, label: 'Orange Money', icon: <Smartphone size={16} /> },
              { id: 'CARD' as const, label: 'Carte', icon: <CreditCard size={16} /> },
              { id: 'CASH' as const, label: 'Espèces', icon: <Banknote size={16} /> },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMethod(item.id)}
                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  method === item.id
                    ? 'border-[#0528d6] bg-blue-50/50 text-[#0528d6]'
                    : 'border-slate-100 text-slate-400'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-black uppercase">{item.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onSubmit(method)}
            disabled={loading}
            className="w-full py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin size-4" /> : t.subscription.paymentConfirm}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-4 text-xs font-bold text-slate-400 tracking-widest"
          >
            {t.subscription.paymentCancel}
          </button>
        </div>
      </div>
    </Portal>
  );
};

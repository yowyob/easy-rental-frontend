import React from 'react';
import { WifiOff, MapPin, Receipt, Zap, CheckCircle2 } from 'lucide-react';
import { LandingSection, SectionTitle } from './landing/LandingSection';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Features = ({ t }: any) => {
  const items = [
    { icon: WifiOff, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', title: t.f1, desc: t.f1d },
    { icon: MapPin, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', title: t.f2, desc: t.f2d },
    { icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', title: t.f3, desc: t.f3d },
    { icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', title: t.f4, desc: t.f4d },
  ];

  const highlights = [
    'Sans installation lourde',
    'Paiement Mobile Money en agence',
    'Multi-profils B2B2C',
  ];

  return (
    <LandingSection id="features" variant="muted">
      <SectionTitle eyebrow="Pourquoi Easy Rental">{t.title}</SectionTitle>

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-2 space-y-6">
          <p className="text-lg md:text-xl lg:text-[1.35rem] text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-center lg:text-left">
            {t.desc}
          </p>
          <ul className="space-y-4 max-w-md mx-auto lg:mx-0">
            {highlights.map((line) => (
              <li
                key={line}
                className="flex items-center gap-3 text-base md:text-lg font-bold text-slate-700 dark:text-slate-200"
              >
                <span className="shrink-0 size-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
          {items.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-[1.75rem] border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon className={f.color} size={22} />
                </div>
                <h4 className="text-base font-black italic uppercase text-slate-800 dark:text-white mb-2">{f.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </LandingSection>
  );
};

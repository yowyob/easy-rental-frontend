import React from 'react';
import { Check, Zap } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Pricing = ({ t }: any) => (
  <section id="pricing" className="py-32 max-w-7xl mx-auto px-6 scroll-mt-20">
    <div className="text-center mb-20">
      <h2 className="text-5xl font-[900] italic tracking-tighter  text-slate-900 dark:text-white mb-4">{t.title}</h2>
      <p className="text-slate-400 text-xs font-black  tracking-widest">{t.subtitle}</p>
    </div>
    <div className="grid md:grid-cols-3 gap-10">
      {/* Starter */}
      <div className="p-12 bg-slate-50 dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 transition-all hover:scale-105">
        <h4 className="text-xl font-black  italic mb-8 tracking-widest text-slate-400">{t.starter}</h4>
        <div className="text-5xl font-black mb-10 italic">0€ <span className="text-sm font-normal text-slate-400 tracking-normal">{t.perMonth}</span></div>
        <ul className="space-y-5 mb-12 text-sm font-bold text-slate-500  tracking-widest">
          <li className="flex gap-2 items-center text-green-500"><Check size={16}/> {t.f1}</li>
          <li className="flex gap-2 items-center opacity-40"><Check size={16}/> {t.f2}</li>
          <li className="flex gap-2 items-center opacity-40"><Check size={16}/> {t.f3}</li>
        </ul>
        <button className="w-full py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl font-black  text-xs shadow-sm hover:bg-blue-600 hover:text-white transition-all">{t.cta}</button>
      </div>
      {/* Pro */}
      <div className="p-12 bg-blue-600 rounded-[4rem] text-white shadow-[0_40px_80px_-15px_rgba(5,40,214,0.4)] relative overflow-hidden transition-all hover:scale-110 z-10 scale-105 text-left">
        <div className="absolute top-8 right-8 rotate-12 opacity-10"><Zap size={120} fill="currentColor"/></div>
        <h4 className="text-xl font-black  italic mb-8 tracking-widest text-blue-200">{t.pro}</h4>
        <div className="text-5xl font-black mb-10 italic">49€ <span className="text-sm font-normal text-blue-200 tracking-normal">{t.perMonth}</span></div>
        <ul className="space-y-5 mb-12 text-sm font-bold  tracking-widest">
          <li className="flex gap-2 items-center"><Check size={16}/> {t.f4}</li>
          <li className="flex gap-2 items-center"><Check size={16}/> {t.f5}</li>
          <li className="flex gap-2 items-center"><Check size={16}/> {t.f6}</li>
        </ul>
        <button className="w-full py-5 bg-white text-blue-600 rounded-3xl font-black  text-xs shadow-xl hover:scale-105 transition-transform">{t.cta}</button>
      </div>
      {/* Enterprise */}
      <div className="p-12 bg-slate-50 dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 transition-all hover:scale-105">
        <h4 className="text-xl font-black  italic mb-8 tracking-widest text-slate-400">{t.enterprise}</h4>
        <div className="text-5xl font-black mb-10 italic  tracking-tighter">{t.onDemand}</div>
        <ul className="space-y-5 mb-12 text-sm font-bold text-slate-500  tracking-widest">
          <li className="flex gap-2 items-center text-green-500"><Check size={16}/> Multi-agences</li>
          <li className="flex gap-2 items-center text-green-500"><Check size={16}/> API Dédiée</li>
          <li className="flex gap-2 items-center text-green-500"><Check size={16}/> Marque blanche</li>
        </ul>
        <button className="w-full py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl font-black  text-xs shadow-sm hover:bg-blue-600 hover:text-white transition-all">{t.cta}</button>
      </div>
    </div>
  </section>
);
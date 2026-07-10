'use client';

import React from 'react';
import { Zap, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const DEFAULT_COPY = {
  desc: 'La nouvelle référence du logiciel de location au Cameroun. Agile, digital, pensé pour le terrain.',
  copy: `© ${new Date().getFullYear()} PWA EASY RENTAL. TOUS DROITS RÉSERVÉS.`,
  privacy: 'Confidentialité',
  terms: 'Conditions',
  features: 'Fonctionnalités',
};

type FooterCopy = {
  desc?: string;
  copy?: string;
  privacy?: string;
  terms?: string;
  features?: string;
};

type FooterProps = {
  t?: FooterCopy;
  nav?: { features?: string };
  /** Base URL de la landing (shell) pour les liens marketing. */
  landingBaseUrl?: string;
};

export function Footer({
  t,
  nav,
  landingBaseUrl = 'http://localhost:3000',
}: FooterProps) {
  const copy = {
    desc: t?.desc ?? DEFAULT_COPY.desc,
    copy: t?.copy ?? DEFAULT_COPY.copy,
    privacy: t?.privacy ?? DEFAULT_COPY.privacy,
    terms: t?.terms ?? DEFAULT_COPY.terms,
    features: t?.features ?? nav?.features ?? DEFAULT_COPY.features,
  };

  const base = landingBaseUrl.replace(/\/$/, '');
  const comingSoon = (title: string) =>
    `${base}/coming-soon?title=${encodeURIComponent(title)}`;

  return (
    <footer className="w-full mt-6 bg-slate-50 dark:bg-[#0c0f1a] border-t border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 mb-8">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#0528d6] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0528d6]/25">
                <Zap size={18} fill="currentColor" />
              </div>
              <span className="text-lg font-black italic text-slate-800 dark:text-white">PWA Easy Rental</span>
            </div>
            <p className="text-sm font-medium leading-relaxed max-w-sm text-slate-500 dark:text-slate-400 mb-5">
              {copy.desc}
            </p>
            <div className="flex gap-2.5">
              {[Facebook, Twitter, Instagram, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href={comingSoon('Réseaux sociaux')}
                  className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-[#0528d6] hover:text-white hover:border-[#0528d6] transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h5 className="text-[10px] font-black text-[#0528d6] mb-4 uppercase tracking-[0.2em]">
              {copy.features}
            </h5>
            <ul className="space-y-2.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              <li><a href={`${base}/#features`} className="hover:text-[#0528d6] transition-colors">PWA First</a></li>
              <li><a href={comingSoon('Mode hors-ligne')} className="hover:text-[#0528d6] transition-colors">Offline Sync</a></li>
              <li><a href={comingSoon('GPS temps réel')} className="hover:text-[#0528d6] transition-colors">Real-time GPS</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h5 className="text-[10px] font-black text-[#0528d6] mb-4 uppercase tracking-[0.2em]">Docs</h5>
            <ul className="space-y-2.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              <li><a href={comingSoon('Guides API')} className="hover:text-[#0528d6] transition-colors">API Guides</a></li>
              <li><a href={comingSoon('SDKs')} className="hover:text-[#0528d6] transition-colors">SDKs</a></li>
              <li><a href={comingSoon('Statut des services')} className="hover:text-[#0528d6] transition-colors">Status</a></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h5 className="text-[10px] font-black text-[#0528d6] mb-4 uppercase tracking-[0.2em]">Connect</h5>
            <ul className="space-y-2.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              <li><a href={`${base}/help`} className="hover:text-[#0528d6] transition-colors">Support</a></li>
              <li><a href={comingSoon('Carrières')} className="hover:text-[#0528d6] transition-colors">Careers</a></li>
              <li><a href={comingSoon('Presse')} className="hover:text-[#0528d6] transition-colors">Press</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{copy.copy}</span>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <a href={comingSoon('Politique de confidentialité')} className="hover:text-[#0528d6] transition-colors">{copy.privacy}</a>
            <a href={comingSoon('Conditions d\'utilisation')} className="hover:text-[#0528d6] transition-colors">{copy.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

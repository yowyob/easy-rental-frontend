'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const comingSoon = (title: string) => `/coming-soon?title=${encodeURIComponent(title)}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Footer = ({ t, nav }: any) => (
  <footer className="w-full mt-4 bg-slate-50 dark:bg-[#0c0f1a] border-t border-slate-200/80 dark:border-slate-800">
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-10">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="text-lg font-black italic text-slate-900 dark:text-white">PWA Easy Rental</span>
          </div>
          <p className="text-sm font-medium leading-relaxed max-w-sm text-slate-500 dark:text-slate-400 mb-6">
            {t.desc}
          </p>
          <div className="flex gap-2.5">
            {[Facebook, Twitter, Instagram, Mail].map((Icon, i) => (
              <Link
                key={i}
                href={comingSoon('Réseaux sociaux')}
                className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-colors"
              >
                <Icon size={16} />
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h5 className="text-[10px] font-black text-primary mb-4 uppercase tracking-[0.2em]">{nav.features}</h5>
          <ul className="space-y-2.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            <li><Link href="/#features" className="hover:text-primary transition-colors">PWA First</Link></li>
            <li><Link href={comingSoon('Mode hors-ligne')} className="hover:text-primary transition-colors">Offline Sync</Link></li>
            <li><Link href={comingSoon('GPS temps réel')} className="hover:text-primary transition-colors">Real-time GPS</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h5 className="text-[10px] font-black text-primary mb-4 uppercase tracking-[0.2em]">Docs</h5>
          <ul className="space-y-2.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            <li><Link href={comingSoon('Guides API')} className="hover:text-primary transition-colors">API Guides</Link></li>
            <li><Link href={comingSoon('SDKs')} className="hover:text-primary transition-colors">SDKs</Link></li>
            <li><Link href={comingSoon('Statut des services')} className="hover:text-primary transition-colors">Status</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h5 className="text-[10px] font-black text-primary mb-4 uppercase tracking-[0.2em]">Connect</h5>
          <ul className="space-y-2.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            <li><Link href="/help" className="hover:text-primary transition-colors">Support</Link></li>
            <li><Link href={comingSoon('Carrières')} className="hover:text-primary transition-colors">Careers</Link></li>
            <li><Link href={comingSoon('Presse')} className="hover:text-primary transition-colors">Press</Link></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.copy}</span>
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Link href={comingSoon('Politique de confidentialité')} className="hover:text-primary transition-colors">{t.privacy}</Link>
          <Link href={comingSoon('Conditions d\'utilisation')} className="hover:text-primary transition-colors">{t.terms}</Link>
        </div>
      </div>
    </div>
  </footer>
);

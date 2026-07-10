'use client';

import { Building, Car, Smartphone, Zap } from 'lucide-react';
import React from 'react';

type AboutLabels = {
  title?: string;
  subtitle?: string;
  completeTitle?: string;
  completeDesc?: string;
  agenciesTitle?: string;
  agenciesDesc?: string;
  performanceTitle?: string;
  performanceDesc?: string;
  pwaTitle?: string;
  pwaDesc?: string;
  installTitle?: string;
  installDesc?: string;
  installCta?: string;
};

type Props = {
  onInstall?: () => void;
  labels?: AboutLabels;
};

const DEFAULTS: Required<AboutLabels> = {
  title: 'À propos de Easy-Rent',
  subtitle:
    'Une plateforme moderne de location de véhicules pensée pour simplifier la mise en relation entre agences et clients, avec une expérience rapide, intuitive et accessible partout.',
  completeTitle: 'Une solution complète',
  completeDesc:
    'Easy-Rent permet aux utilisateurs de rechercher, comparer et réserver des véhicules en quelques clics. Grâce à un système de filtres avancés, vous pouvez trouver rapidement le véhicule adapté à vos besoins.',
  agenciesTitle: 'Pour les agences',
  agenciesDesc:
    'Les agences peuvent gérer leur catalogue de véhicules, suivre les disponibilités et optimiser leurs services grâce à une interface claire et performante.',
  performanceTitle: 'Performance & Simplicité',
  performanceDesc:
    'L’application est conçue pour être rapide, fluide et accessible même dans des environnements à ressources limitées.',
  pwaTitle: 'Progressive Web App',
  pwaDesc:
    'Installez Easy-Rent directement sur votre téléphone ou ordinateur, sans passer par un store. Expérience native, accès rapide, navigation fluide.',
  installTitle: 'Installer Easy-Rent',
  installDesc:
    'Accédez rapidement à la plateforme depuis votre écran d’accueil et profitez d’une expérience encore plus fluide.',
  installCta: 'Installer l’application',
};

export const About = ({ onInstall, labels }: Props) => {
  const l = { ...DEFAULTS, ...labels };

  return (
    <div className="w-full mx-auto animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-[900] italic tracking-tighter text-[#0528d6]">
          {l.title}
        </h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          {l.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-5">
        {[
          { icon: Car, title: l.completeTitle, desc: l.completeDesc },
          { icon: Building, title: l.agenciesTitle, desc: l.agenciesDesc },
          { icon: Zap, title: l.performanceTitle, desc: l.performanceDesc },
          { icon: Smartphone, title: l.pwaTitle, desc: l.pwaDesc },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#1a1d2d] border border-slate-100 dark:border-slate-800 shadow-sm flex gap-4 items-start"
            >
              <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-[#0528d6]" />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1.5 text-slate-800 dark:text-white">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <div className="relative overflow-hidden p-7 md:p-9 rounded-[1.75rem] bg-[#0528d6] text-white shadow-xl shadow-[#0528d6]/25">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <h3 className="text-xl font-[900] italic mb-2">{l.installTitle}</h3>
            <p className="text-sm text-blue-100 mb-5 max-w-lg mx-auto leading-relaxed">{l.installDesc}</p>
            <button
              type="button"
              onClick={onInstall}
              className="px-8 py-3 rounded-xl bg-white text-[#0528d6] font-bold text-sm hover:scale-105 transition-transform"
            >
              {l.installCta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

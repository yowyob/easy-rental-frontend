'use client';
import React, { useEffect } from 'react';
import { Hero } from '@/landing/components/Hero';
import { Solutions } from '@/landing/components/Solutions';
import { Features } from '@/landing/components/Features';
import Testimonial from '@/landing/components/testimonial';
import { MFE_URLS } from '@/landing/config/mfe-urls';
import Link from 'next/link';
import { useLang } from '@/landing/components/LangContext';
import { LandingSection } from '@/landing/components/landing/LandingSection';

export default function LandingPage() {
  const { t } = useLang();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1323] text-slate-900 dark:text-white font-sans transition-colors duration-300">
      <Hero t={t.hero} heroSlider={t.heroSlider} onInstall={() => alert(t.hero.installNotice)} />
      <Solutions t={t.stakeholders} />
      <Features t={t.features} />
      <Testimonial />

      <LandingSection containerClassName="!px-6">
        <div className="relative bg-primary rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-14 overflow-hidden shadow-[0_32px_64px_-15px_rgba(5,40,214,0.35)]">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 -skew-x-12 translate-x-1/2" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary rounded-full blur-[80px] opacity-50" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl md:text-5xl font-[900] italic leading-[0.95] tracking-tighter text-white mb-4">
                {t.ctaFinal.title} <br /> {t.ctaFinal.titleAccent}
              </h2>
              <p className="text-blue-100 text-base md:text-lg font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
                {t.ctaFinal.desc}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Link
                href={MFE_URLS.client}
                className="inline-flex items-center justify-center bg-white text-primary px-8 py-4 rounded-[2rem] font-black text-sm italic hover:scale-105 transition-transform shadow-xl"
              >
                {t.ctaFinal.catalog}
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center bg-primary-dark text-white border border-white/20 px-8 py-4 rounded-[2rem] font-black text-sm italic hover:bg-blue-900 transition-colors"
              >
                {t.ctaFinal.help}
              </Link>
            </div>
          </div>
        </div>
      </LandingSection>
    </div>
  );
}

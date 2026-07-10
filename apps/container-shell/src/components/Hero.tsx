'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { DownloadCloud } from 'lucide-react';
import { MFE_URLS } from '../config/mfe-urls';

/** Intervalle auto : 4,5 s — assez long pour lire, assez court pour rester dynamique. */
const SLIDE_INTERVAL_MS = 4500;
const FADE_MS = 800;

type HeroSlide = {
  id: string;
  badge?: string;
  headline: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  showPlatformCtas?: boolean;
  showClientCta?: boolean;
  fluidCar?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Hero = ({ t, heroSlider, onInstall }: any) => {
  const slides: HeroSlide[] = [
    {
      id: 'client',
      headline: heroSlider.clientHeadline,
      description: heroSlider.clientDesc,
      imageSrc: '/hero_car_cutout.png',
      imageAlt: 'Véhicule de location Easy Rental',
      showClientCta: true,
      fluidCar: true,
    },
    {
      id: 'platform',
      badge: t.badge,
      headline: `${t.title} ${t.titleAccent}.`,
      description: t.desc,
      imageSrc: '/hero.avif',
      imageAlt: 'Dashboard Easy Rental',
      showPlatformCtas: true,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <section
      className="relative bg-primary text-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Présentation Easy Rental"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 right-0 w-[28rem] h-[28rem] bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-secondary/25 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-4 pb-5 md:pt-5 md:pb-6">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-center min-h-[280px] md:min-h-[340px]">
          {/* Texte : fondu croisé (opacity uniquement) */}
          <div className="relative z-10 order-2 lg:order-1 min-h-[220px] md:min-h-[260px]">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 flex flex-col justify-center transition-opacity ease-in-out ${
                    isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  style={{ transitionDuration: `${FADE_MS}ms` }}
                  aria-hidden={!isActive}
                >
                  {slide.badge && (
                    <div className="inline-flex self-start items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-[10px] font-black tracking-[0.2em] mb-4 border border-white/20 italic">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      {slide.badge}
                    </div>
                  )}

                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.35rem] font-[900] italic leading-[1.05] tracking-tight mb-4 max-w-xl">
                    {slide.headline}
                  </h1>

                  {slide.description && (
                    <p className="text-base md:text-lg text-blue-100/95 font-medium leading-relaxed max-w-md mb-6">
                      {slide.description}
                    </p>
                  )}

                  {slide.showClientCta && (
                    <div>
                      <button
                        type="button"
                        onClick={() => { window.location.href = MFE_URLS.client; }}
                        className="bg-secondary text-white px-8 py-3.5 rounded-xl font-black text-sm shadow-xl shadow-orange-500/30 hover:scale-[1.02] transition-transform"
                      >
                        {heroSlider.clientCta}
                      </button>
                    </div>
                  )}

                  {slide.showPlatformCtas && (
                    <div className="flex flex-wrap gap-3 items-center">
                      <button
                        type="button"
                        onClick={() => { window.location.href = MFE_URLS.client; }}
                        className="bg-white text-primary px-6 py-3 rounded-xl font-black text-sm shadow-xl hover:scale-[1.02] transition-transform"
                      >
                        {t.ctaReserve}
                      </button>
                      <button
                        type="button"
                        onClick={() => { window.location.href = MFE_URLS.organisation; }}
                        className="bg-transparent border-2 border-white/80 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-white/10 transition-colors"
                      >
                        {t.ctaManager}
                      </button>
                      <button
                        type="button"
                        onClick={onInstall}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/40 hover:border-white transition-colors"
                      >
                        <DownloadCloud size={16} className="text-white" />
                        <span className="font-black text-[10px] uppercase text-blue-100">{t.ctaInstall}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Visuel : fondu croisé, voiture agrandie sans cadre */}
          <div className="relative z-10 order-1 lg:order-2 min-h-[240px] sm:min-h-[300px] lg:min-h-[380px]">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={`visual-${slide.id}`}
                  className={`absolute inset-0 flex items-center justify-center transition-opacity ease-in-out ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                  style={{ transitionDuration: `${FADE_MS}ms` }}
                  aria-hidden={!isActive}
                >
                  {slide.fluidCar ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Ombre douce circulaire (pas de cadre rectangulaire) */}
                      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[55%] h-10 rounded-full bg-[#021a8a]/35 blur-2xl" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${slide.imageSrc}?v=2`}
                        alt={slide.imageAlt}
                        className="relative w-full max-w-[620px] lg:max-w-[700px] h-auto object-contain max-h-[320px] sm:max-h-[400px] lg:max-h-[460px] select-none [background:transparent]"
                        draggable={false}
                      />
                    </div>
                  ) : (
                    <div className="relative w-full max-w-lg px-2">
                      <Image
                        src={slide.imageSrc}
                        alt={slide.imageAlt}
                        width={720}
                        height={480}
                        className="w-full h-auto object-cover max-h-[280px] lg:max-h-[340px] rounded-2xl shadow-2xl shadow-[#021a8a]/30"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2.5 mt-4 md:mt-5">
          {slides.map((slide, index) => (
            <button
              key={`dot-${slide.id}`}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Afficher la diapositive ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

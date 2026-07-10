'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SupportChatWidget } from '@pwa-easy-rental/shared-ui';
import { LangProvider } from './LangContext';
import { fr } from '../locales/fr';
import { en } from '../locales/en';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<'FR' | 'EN'>('FR');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [mounted, setMounted] = useState(false);

  const t = lang === 'FR' ? fr : en;

  useEffect(() => {
    setMounted(true);

    const savedLang = localStorage.getItem('lang');
    if (savedLang === 'EN' || savedLang === 'FR') {
      setLang(savedLang);
    }

    const isDark = localStorage.getItem('theme') === 'dark'
      || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLang = () => {
    setLang((current) => {
      const next = current === 'FR' ? 'EN' : 'FR';
      localStorage.setItem('lang', next);
      return next;
    });
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert(t.hero.installNotice);
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen flex flex-col pt-16 bg-white dark:bg-[#0f1323]">
        {children}
      </main>
    );
  }

  return (
    <LangProvider lang={lang}>
      <Navbar
        t={t}
        lang={lang}
        onLangToggle={toggleLang}
        darkMode={darkMode}
        onThemeToggle={toggleTheme}
        onInstall={handleInstallApp}
      />
      <main className="min-h-screen flex flex-col pt-16">
        {children}
      </main>
      <Footer t={t.footer} nav={t.nav} />
      <SupportChatWidget />
    </LangProvider>
  );
}

'use client';

import React, { createContext, useContext } from 'react';
import { fr } from '../locales/fr';
import { en } from '../locales/en';

type Lang = 'FR' | 'EN';
type Locale = typeof fr;

type LangContextValue = {
  lang: Lang;
  t: Locale;
};

const LangContext = createContext<LangContextValue>({ lang: 'FR', t: fr });

export function LangProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  const t = lang === 'FR' ? fr : en;
  return <LangContext.Provider value={{ lang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

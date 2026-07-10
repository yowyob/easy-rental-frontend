'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Zap,
  Languages,
  Sun,
  Moon,
  DownloadCloud,
  Menu,
  X,
} from 'lucide-react';
import { MFE_URLS } from '../config/mfe-urls';

const actionBtn =
  'h-10 inline-flex items-center justify-center gap-2 px-3 rounded-xl text-xs font-black transition-colors';

type NavItem = {
  href: string;
  label: string;
  isActive: boolean;
};

function NavLink({ href, label, isActive, onClick }: NavItem & { onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`relative py-1 transition-colors ${
        isActive
          ? 'text-primary after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary'
          : 'text-slate-500 hover:text-primary'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </a>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Navbar = ({ t, lang, onLangToggle, darkMode, onThemeToggle, onInstall }: any) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isReviews = pathname === '/feedback';
  const isHelp = pathname === '/help';

  const navItems: NavItem[] = [
    { href: '/', label: t.nav.home, isActive: isHome },
    { href: '/feedback', label: t.nav.reviews, isActive: isReviews },
    { href: '/help', label: t.nav.help, isActive: isHelp },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] bg-white/95 dark:bg-[#0f1323]/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 h-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white hidden sm:block">
              PWA <span className="text-primary">Easy Rental</span>
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-wide">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onInstall}
              className={`${actionBtn} hidden sm:inline-flex bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white`}
            >
              <DownloadCloud size={14} /> {t.nav.install}
            </button>

            <button
              type="button"
              onClick={onLangToggle}
              className={`${actionBtn} min-w-[4.5rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900`}
              aria-label="Changer de langue"
            >
              <Languages size={14} className="text-primary" />
              <span>{lang}</span>
            </button>

            <button type="button" onClick={onThemeToggle} className={`${actionBtn} w-10 bg-slate-100 dark:bg-slate-800`}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <a href={MFE_URLS.client} className={`${actionBtn} hidden lg:inline-flex bg-primary text-white px-5 hover:bg-primary-dark`}>
              {t.nav.reserve}
            </a>

            <button type="button" onClick={() => setOpen(true)} className={`${actionBtn} lg:hidden w-10 bg-slate-100 dark:bg-slate-800`}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0f1323] flex flex-col lg:hidden">
          <div className="flex items-center justify-between px-6 h-16 border-b">
            <span className="font-black uppercase italic">Menu</span>
            <button type="button" onClick={() => setOpen(false)}><X size={24} /></button>
          </div>
          <div className="flex flex-col gap-5 px-6 py-8 text-sm font-black uppercase">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`py-2 border-b border-slate-100 dark:border-slate-800 ${
                  item.isActive ? 'text-primary' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.label}
              </a>
            ))}
            <hr className="border-slate-200 dark:border-slate-700" />
            <button type="button" onClick={onInstall}>{t.nav.install}</button>
            <a href={MFE_URLS.client} className="bg-primary text-white py-3 rounded-2xl text-center">{t.nav.reserve}</a>
          </div>
        </div>
      )}
    </>
  );
};

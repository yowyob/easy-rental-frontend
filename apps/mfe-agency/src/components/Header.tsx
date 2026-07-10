// FILE: apps/mfe-agency/src/components/Header.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { Menu, Sun, Moon, Languages, Bell, MapPin } from 'lucide-react';
import { notifService, NOTIFICATIONS_REFRESH_EVENT } from '@pwa-easy-rental/shared-services';
import { HeaderIconButton } from './HeaderIconButton';

export const Header = ({
  title,
  userData,
  agencyData,
  lang,
  setLang,
  darkMode,
  toggleTheme,
  setSidebarOpen,
  setCurrentView,
  t,
}: any) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!agencyData?.id) return;

    const fetchNotifs = (event?: Event) => {
      const ctx = (event as CustomEvent<{ context?: string }> | undefined)?.detail?.context;
      if (ctx && ctx !== 'AGENCY') return;
      notifService.countUnreadAgency(agencyData.id).then((res) => {
        if (res.ok) setUnreadCount(Number(res.data) || 0);
      });
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, fetchNotifs);
    return () => {
      clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, fetchNotifs);
    };
  }, [agencyData?.id]);

  const handleLangToggle = () => {
    const next = lang === 'FR' ? 'EN' : 'FR';
    setLang(next);
    localStorage.setItem('lang', next);
  };

  return (
    <header className="h-20 px-4 md:px-10 flex items-center justify-between shrink-0 border-b-4 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f1323]/80 backdrop-blur-lg sticky top-0 z-[50]">
      <div className="flex items-center gap-4 text-left">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu size={22} />
        </button>

        <div className="flex flex-col">
          <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none uppercase italic">
            {title}
          </h2>
          <div className="hidden sm:flex items-center gap-2 mt-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
            <MapPin size={10} className="text-[#0528d6]" /> {agencyData?.name || 'Agence...'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => setCurrentView('NOTIFICATIONS')}
          className="p-2.5 text-slate-400 hover:text-[#0528d6] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-all relative group"
          aria-label={t.header.notifications}
        >
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 size-4 bg-red-500 border-2 border-white dark:border-[#0f1323] rounded-full text-[8px] text-white flex items-center justify-center font-black animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1 px-1 py-1 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <HeaderIconButton
            onClick={handleLangToggle}
            aria-label={t.header.switchLanguage}
            title={t.header.switchLanguage}
          >
            <Languages size={18} className="text-[#0528d6] shrink-0" />
            <span className="text-[10px] font-black italic min-w-[1.25rem]">{lang}</span>
          </HeaderIconButton>

          <HeaderIconButton
            onClick={toggleTheme}
            aria-label={t.header.toggleTheme}
            title={t.header.toggleTheme}
          >
            {darkMode ? <Sun size={18} className="text-[#0528d6]" /> : <Moon size={18} className="text-[#0528d6]" />}
          </HeaderIconButton>
        </div>

        <div
          onClick={() => setCurrentView('PROFILE')}
          className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1 group-hover:text-[#0528d6] transition-colors">
              {userData?.poste?.name || t.header.adminRole}
            </p>
            <p className="text-xs font-black text-slate-700 dark:text-slate-200 max-w-[120px] truncate italic">
              {userData?.fullname}
            </p>
          </div>

          <div className="relative">
            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#0528d6] font-black border-2 border-slate-200 dark:border-slate-700 shadow-md group-hover:scale-105 group-hover:border-[#0528d6] transition-all">
              {userData?.firstname?.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 size-3 bg-green-500 border-2 border-white dark:border-[#0f1323] rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
};

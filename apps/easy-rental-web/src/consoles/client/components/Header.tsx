/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from "react";
import { Sun, Moon, LogOut, Bell, Menu } from "lucide-react";
import { notifService } from "@pwa-easy-rental/shared-services";

export const Header = ({
  isAuth,
  userData,
  currentView,
  setCurrentView,
  toggleTheme,
  darkMode,
  lang,
  setLang,
  onLogout,
  setSidebarOpen,
  t,
  onUnreadCountChange,
}: any) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (userData?.id) {
      const fetchNotifsCount = () => {
        notifService.countUnreadClient(userData.id).then(res => {
          if (res.ok) {
            setUnreadCount(res.data);
            onUnreadCountChange?.(res.data);
          }
        });
      };
      fetchNotifsCount();
      const interval = setInterval(fetchNotifsCount, 10000);
      return () => clearInterval(interval);
    }
  }, [userData?.id, onUnreadCountChange]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ease-out border-b ${
        scrolled
          ? 'h-14 bg-white/95 dark:bg-[#0f1323]/95 backdrop-blur-xl border-slate-200/80 dark:border-slate-800 shadow-sm'
          : 'h-16 md:h-18 bg-white/80 dark:bg-[#0f1323]/80 backdrop-blur-md border-transparent'
      }`}
    >
      <div className="h-full w-full px-4 md:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>
          <button type="button" className="flex items-center gap-2.5 cursor-pointer lg:hidden" onClick={() => setCurrentView("HOME")}>
            <div className={`bg-[#0528d6] rounded-xl flex items-center justify-center text-white shadow-md transition-all ${scrolled ? 'size-8' : 'size-9'}`}>
              <span className="font-semibold italic text-base">E</span>
            </div>
            <span className="text-lg font-semibold text-slate-800 dark:text-white hidden sm:block">
              Easy<span className="text-[#0528d6]">Rental</span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          <button
            type="button"
            onClick={() => {
              const next = lang === "FR" ? "EN" : "FR";
              setLang(next);
              if (typeof window !== 'undefined') localStorage.setItem('lang', next);
            }}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#0528d6] hover:text-[#0528d6] transition-colors"
            title={lang === 'FR' ? 'Switch to English' : 'Passer en français'}
          >
            {lang}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuth ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentView("NOTIFICATIONS")}
                className={`relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 ${currentView === 'NOTIFICATIONS' ? 'text-[#0528d6]' : ''}`}
              >
                <Bell size={18} />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-[1px]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </button>

              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setCurrentView("PROFILE")} className="flex items-center gap-2.5">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{userData?.firstname}</p>
                    <p className="text-xs text-slate-500">{t?.nav?.client ?? 'Client'}</p>
                  </div>
                  <div className="size-9 rounded-full bg-blue-50 dark:bg-slate-700 flex items-center justify-center font-medium text-[#0528d6]">
                    {userData?.firstname?.charAt(0)}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentView("AUTH")}
              className="px-5 py-2 bg-[#0528d6] text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition"
            >
              {t?.nav?.login ?? 'Connexion'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { Menu, Sun, Moon, Languages, Download, Bell } from 'lucide-react';
import { notifService, NOTIFICATIONS_REFRESH_EVENT } from '@pwa-easy-rental/shared-services';
import { HeaderIconButton } from './HeaderIconButton';

export const Header = ({ title, orgData, lang, setLang, darkMode, toggleTheme, setSidebarOpen, onInstall, hasPrompt, setCurrentView, t }: any) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!orgData?.id) return;

    const fetchNotifs = (event?: Event) => {
      const ctx = (event as CustomEvent<{ context?: string }> | undefined)?.detail?.context;
      if (ctx && ctx !== 'ORGANIZATION') return;
      notifService.countUnreadOrg(orgData.id).then((res) => {
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
  }, [orgData?.id]);

  return (
    <header className="h-20 px-4 md:px-10 flex items-center justify-between shrink-0 border-b-4 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f1323]/80 backdrop-blur-lg sticky top-0 z-[50]">
      <div className="flex items-center gap-4 text-left">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Menu size={22} /></button>
        <div className="flex flex-col">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">{title}</h2>
          <p className="hidden sm:block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic mt-1.5">{t.header.admin || "Console Administration"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          type="button"
          onClick={onInstall}
          className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-black text-[9px] uppercase border transition-all ${
            hasPrompt
              ? 'bg-[#F76513] text-white border-[#F76513] shadow-lg shadow-orange-500/25 animate-pulse hover:bg-orange-600'
              : 'bg-orange-50 dark:bg-orange-500/10 text-[#F76513] border-orange-100 dark:border-orange-500/20 hover:bg-orange-100'
          }`}
        >
          <Download size={14} /> {t.header.installBtn}
        </button>

        <button onClick={() => setCurrentView('NOTIFICATIONS')} className="p-2.5 text-slate-400 hover:text-[#0528d6] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-all relative group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 size-4 bg-red-500 border-2 border-white dark:border-[#0f1323] rounded-full text-[8px] text-white flex items-center justify-center font-black animate-bounce">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        <div className="flex items-center gap-1 px-1 py-1 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <HeaderIconButton
            onClick={() => setLang(lang === 'FR' ? 'EN' : 'FR')}
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

        <div onClick={() => setCurrentView('PROFILE')} className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200 dark:border-slate-800 cursor-pointer group">
           <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1 group-hover:text-[#0528d6] transition-colors italic">{t.header.adminRole}</p>
              <p className="text-xs font-black text-slate-700 dark:text-slate-200 max-w-[120px] truncate italic uppercase tracking-tighter">{orgData?.name}</p>
              {(orgData?.governanceStatus ?? orgData?.governance_status) &&
                (orgData?.governanceStatus ?? orgData?.governance_status) !== 'APPROVED' && (
                <p className="text-[8px] font-black uppercase tracking-widest mt-1 text-amber-600 dark:text-amber-400">
                  {(orgData?.governanceStatus ?? orgData?.governance_status) === 'PENDING_APPROVAL'
                    ? (t.header.pendingApproval ?? 'En attente d\'approbation')
                    : (orgData?.governanceStatus ?? orgData?.governance_status)}
                </p>
              )}
           </div>
           <div className="size-10 rounded-xl bg-gradient-to-br from-[#0528d6] to-blue-400 p-[2px] shadow-lg group-hover:scale-110 transition-all">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] overflow-hidden">
                <img src={orgData?.logoUrl || `https://ui-avatars.com/api/?name=${orgData?.name}&background=0528d6&color=fff`} alt="Logo" className="w-full h-full object-cover" />
              </div>
           </div>
        </div>
      </div>
    </header>
  );
};
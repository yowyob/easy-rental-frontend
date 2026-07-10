'use client';
import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { HeaderIconButton } from './HeaderIconButton';
import type { AdminTab } from './AdminSidebar';

const TAB_TITLES: Record<AdminTab, string> = {
  ORGS: 'Organisations',
  PLANS: 'Plans d\'abonnement',
  MESSAGES: 'Messagerie support',
  REVIEWS: 'Modération des avis',
};

type AdminHeaderProps = {
  tab: AdminTab;
  userEmail: string;
  darkMode: boolean;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
};

export const AdminHeader = ({
  tab,
  userEmail,
  darkMode,
  toggleTheme,
  setSidebarOpen,
}: AdminHeaderProps) => (
  <header className="h-20 px-4 md:px-10 flex items-center justify-between shrink-0 border-b-4 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f1323]/80 backdrop-blur-lg sticky top-0 z-[50]">
    <div className="flex items-center gap-4 text-left">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Menu size={22} />
      </button>

      <div className="flex flex-col">
        <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none uppercase italic">
          {TAB_TITLES[tab]}
        </h2>
        <p className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 italic">
          Administration plateforme Easy Rental
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 md:gap-4">
      <div className="flex items-center gap-1 px-1 py-1 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <HeaderIconButton onClick={toggleTheme} aria-label="Changer le thème" title="Changer le thème">
          {darkMode ? <Sun size={18} className="text-[#0528d6]" /> : <Moon size={18} className="text-[#0528d6]" />}
        </HeaderIconButton>
      </div>

      <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200 dark:border-slate-800">
        <div className="text-right hidden sm:block">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">
            Administrateur
          </p>
          <p className="text-xs font-black text-slate-700 dark:text-slate-200 max-w-[160px] truncate italic">
            {userEmail}
          </p>
        </div>
        <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#0528d6] font-black border-2 border-slate-200 dark:border-slate-700 shadow-md">
          {userEmail.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  </header>
);

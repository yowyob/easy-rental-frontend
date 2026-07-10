'use client';
import React from 'react';
import { Building2, CreditCard, LogOut, MessageSquare, Shield, Star, X, ChevronRight, Activity } from 'lucide-react';

export type AdminTab = 'ORGS' | 'PLANS' | 'MESSAGES' | 'REVIEWS';

type AdminSidebarProps = {
  tab: AdminTab;
  setTab: (tab: AdminTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
  supportUnread: number;
  pendingReviews: number;
};

export const AdminSidebar = ({
  tab,
  setTab,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
  supportUnread,
  pendingReviews,
}: AdminSidebarProps) => (
  <aside
    className={`
      ${sidebarOpen ? 'fixed inset-0 z-[200]' : 'hidden'}
      lg:relative lg:flex lg:w-72 flex-col h-screen shrink-0 transition-all duration-300
      bg-slate-50 border-r-2 border-slate-200
      dark:bg-[#080b14] dark:border-slate-800 shadow-xl
    `}
  >
    {sidebarOpen && (
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
    )}

    <div className="relative z-10 h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between py-10 px-6 mb-2">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setTab('ORGS'); setSidebarOpen(false); }}>
          <div className="w-10 h-10 bg-[#0528d6] rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6">
            <Shield size={20} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              Easy<span className="text-[#0528d6]">Rental</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 mt-1 italic uppercase tracking-widest">
              Console plateforme
            </span>
          </div>
        </div>
        <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-red-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-8 pb-8 text-left">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2 italic">
            Gestion
          </p>
          <div className="space-y-1">
            <SidebarItem
              icon={<Building2 size={20} />}
              label="Organisations"
              active={tab === 'ORGS'}
              onClick={() => { setTab('ORGS'); setSidebarOpen(false); }}
            />
            <SidebarItem
              icon={<CreditCard size={20} />}
              label="Plans"
              active={tab === 'PLANS'}
              onClick={() => { setTab('PLANS'); setSidebarOpen(false); }}
            />
            <SidebarItem
              icon={<MessageSquare size={20} />}
              label="Messages"
              active={tab === 'MESSAGES'}
              badge={supportUnread > 0 ? supportUnread : undefined}
              onClick={() => { setTab('MESSAGES'); setSidebarOpen(false); }}
            />
            <SidebarItem
              icon={<Star size={20} />}
              label="Avis"
              active={tab === 'REVIEWS'}
              badge={pendingReviews > 0 ? pendingReviews : undefined}
              onClick={() => { setTab('REVIEWS'); setSidebarOpen(false); }}
            />
          </div>
        </div>
      </nav>

      <div className="flex-shrink-0 mt-auto p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>

        <div className="mt-2 p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">
                Plateforme active
              </span>
            </div>
            <Activity size={12} className="text-slate-300 dark:text-slate-700" />
          </div>
        </div>
      </div>
    </div>
  </aside>
);

function SidebarItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
        ${active
          ? 'bg-[#0528d6] text-white shadow-lg shadow-blue-600/20 font-bold italic'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        }
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'text-slate-400 group-hover:text-[#0528d6] dark:group-hover:text-blue-400'}`}>
          {icon}
        </div>
        <span className="text-sm tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge != null && badge > 0 && (
          <span className={`min-w-5 h-5 px-1 rounded-full text-[10px] font-black flex items-center justify-center ${active ? 'bg-white text-[#0528d6]' : 'bg-[#F76513] text-white'}`}>
            {badge > 9 ? '9+' : badge}
          </span>
        )}
        {active && <ChevronRight size={14} className="opacity-60 animate-in slide-in-from-left-2" />}
      </div>
    </button>
  );
}

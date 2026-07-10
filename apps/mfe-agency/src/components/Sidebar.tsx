// FILE: apps/mfe-agency/src/components/Sidebar.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { 
  LayoutDashboard, Car, Users, 
  LogOut, X, ChevronRight, Activity, CalendarDays, CalendarCheck, Banknote
} from 'lucide-react';
import { hasPermission } from '@/utils/permissions';

export const Sidebar = ({ 
  currentView, 
  setCurrentView, 
  sidebarOpen, 
  setSidebarOpen, 
  handleLogout,
  parentOrg,
  userData,
  staffPermissions,
  t
}: any) => (
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
      
      {/* Branding */}
      <div className="flex-shrink-0 flex items-center justify-between py-10 px-6 mb-2">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setCurrentView('DASHBOARD')}>
          <div className="w-10 h-10 bg-[#0528d6] rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6">
            <span className="font-bold text-xl italic">E</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              Easy<span className="text-[#0528d6]">Rental</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 mt-1 italic uppercase tracking-widest">
                {t.sidebar.systemSubtitle}
            </span>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={20} />
        </button>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-8 pb-8 text-left">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2 italic">
            {t.sidebar.ops}
          </p>
          <div className="space-y-1">
            {hasPermission(userData, staffPermissions, 'stats:dashboard') && (
              <SidebarItem icon={<LayoutDashboard size={20}/>} label={t.sidebar.dash} active={currentView === 'DASHBOARD'} onClick={() => { setCurrentView('DASHBOARD'); setSidebarOpen(false); }} />
            )}
            
            {hasPermission(userData, staffPermissions, 'rental:list') && (
              <>
                <SidebarItem icon={<CalendarDays size={20}/>} label={t.sidebar.reservations} active={currentView === 'RESERVATIONS'} onClick={() => { setCurrentView('RESERVATIONS'); setSidebarOpen(false); }} />
                <SidebarItem icon={<CalendarCheck size={20}/>} label={t.sidebar.rentals} active={currentView === 'RENTALS'} onClick={() => { setCurrentView('RENTALS'); setSidebarOpen(false); }} />
              </>
            )}
            
            {hasPermission(userData, staffPermissions, 'finance:transactions') && (
                <SidebarItem icon={<Banknote size={20}/>} label={t.sidebar.transactions} active={currentView === 'TRANSACTIONS'} onClick={() => { setCurrentView('TRANSACTIONS'); setSidebarOpen(false); }} />
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2 italic">
            {t.sidebar.resources}
          </p>
          <div className="space-y-1">
            {hasPermission(userData, staffPermissions, 'vehicle:list') && (
                <SidebarItem icon={<Car size={20}/>} label={t.sidebar.fleet} active={currentView === 'VEHICLES'} onClick={() => { setCurrentView('VEHICLES'); setSidebarOpen(false); }} />
            )}
            {hasPermission(userData, staffPermissions, 'driver:list') && (
                <SidebarItem icon={<Users size={20}/>} label={t.sidebar.drivers} active={currentView === 'DRIVERS'} onClick={() => { setCurrentView('DRIVERS'); setSidebarOpen(false); }} />
            )}
          </div>
        </div>
      </nav>

      {/* Footer info & Logout */}
      <div className="flex-shrink-0 mt-auto p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {parentOrg && (
          <div className="mb-4 p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
             <div className="size-8 rounded-lg overflow-hidden shrink-0 border border-slate-100 shadow-inner">
                <img src={parentOrg.logoUrl || `https://ui-avatars.com/api/?name=${parentOrg.name}&background=0528d6&color=fff`} alt="Org" className="w-full h-full object-cover" />
             </div>
             <div className="overflow-hidden">
                <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1 italic">{t.sidebar.network}</p>
                <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate uppercase">{parentOrg.name}</p>
             </div>
          </div>
        )}

        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
          <LogOut size={18}/>
          <span>{t.sidebar.logout}</span>
        </button>

        <div className="mt-4 p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800/50">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">
                  {t.sidebar.status}
                </span>
              </div>
              <Activity size={12} className="text-slate-300 dark:text-slate-700" />
           </div>
        </div>
      </div>
    </div>
  </aside>
);

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button 
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
    {active && <ChevronRight size={14} className="opacity-60 animate-in slide-in-from-left-2" />}
  </button>
);
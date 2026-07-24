// FILE: apps/mfe-agency/src/app/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  agencyService, 
  authService, 
  clearAuthSession,
  driverService, 
  orgService, 
  persistAuthToken,
  vehicleService,
  staffService,
  initAuthSessionWatcher,
  getStoredToken,
  markFirstUsageDone,
} from '@pwa-easy-rental/shared-services';
import { PlatformFeedbackPrompt } from '@shared-ui/components/ui/PlatformFeedbackPrompt';
import { SupportChatWidget } from '@pwa-easy-rental/shared-ui';

import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { AuthView } from '../views/AuthView';
import { DashboardView } from '../views/DashboardView';
import { ProfileView } from '../views/ProfileView';
import { VehiclesView } from '../views/VehiclesView';
import { DriversView } from '../views/DriversView';
import { ReservationsView } from '../views/ReservationsView';
import { RentalsView } from '../views/RentalsView';
import { TransactionsView } from '../views/TransactionsView';
import { NotificationsView } from '../views/NotificationsView';

import { Loader2 } from 'lucide-react';
import { fr } from '../locales/fr';
import { en } from '../locales/en';
import { hasPermission } from '../utils/permissions';

function normalizeAgencyUser(raw: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  if (!raw) return null;
  return {
    ...raw,
    agencyId: raw.agencyId ?? raw.agency_id,
    organizationId: raw.organizationId ?? raw.organization_id,
    firstname: raw.firstname ?? raw.first_name,
    lastname: raw.lastname ?? raw.last_name,
    status: raw.status,
    hiredAt: raw.hiredAt ?? raw.hired_at ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
  };
}

export default function AgencyDashboard() {
  // --- ÉTATS DE L'INTERFACE ---
  const [currentView, setCurrentView] = useState<string>('DASHBOARD');
  const [lang, setLang] = useState<'FR' | 'EN'>('FR');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = lang === 'FR' ? fr : en;

  // --- ÉTATS DES DONNÉES ---
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [staffPermissions, setStaffPermissions] = useState<any[]>([]);
  const [agencyData, setAgencyData] = useState<any>(null);
  const [parentOrg, setParentOrg] = useState<any>(null);
  const [stats, setStats] = useState({ vehicles: 0, drivers: 0 });
  const [initError, setInitError] = useState<string>('');

  // --- FONCTION DE CHARGEMENT DU CONTEXTE ---
  const fetchContext = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Récupérer le profil utilisateur et ses permissions spécifiques
      const [meRes, permsRes] = await Promise.all([
        authService.getUserMe(),
        staffService.getPermissions() // Appel à /api/users/me/permissions
      ]);

      if (meRes.ok && meRes.data) {
        const user = normalizeAgencyUser(meRes.data);
        const perms = permsRes.ok ? permsRes.data : [];
        
        setUserData(user);
        setStaffPermissions(perms);

        if (user?.status === 'SUSPENDED') {
          setInitError(t.auth.suspended);
          throw new Error('User is suspended');
        }

        if (user?.agencyId) {
          // 2. Récupérer les détails de l'agence et de l'organisation
          const [agencyRes, orgRes] = await Promise.all([
            agencyService.getAgencyDetails(user.agencyId as string),
            orgService.getOrgDetails(user.organizationId as string)
          ]);
          
          if (agencyRes.ok) setAgencyData(agencyRes.data);
          if (orgRes.ok) setParentOrg(orgRes.data);

          // 3. Charger les compteurs (stats) si l'utilisateur a les permissions de liste
          const [vehRes, drivRes] = await Promise.all([
            hasPermission(user, perms, 'vehicle:list') 
              ? vehicleService.getVehiclesByAgency(user.agencyId) 
              : Promise.resolve({ ok: true, data: [] }),
            hasPermission(user, perms, 'driver:list') 
              ? driverService.getDriversByAgency(user.agencyId) 
              : Promise.resolve({ ok: true, data: [] })
          ]);
          
          setStats({
            vehicles: vehRes.data?.length || 0,
            drivers: drivRes.data?.length || 0
          });
          
          setIsAuth(true);
          markFirstUsageDone();
        } else {
          // Utilisateur sans agence assignée
          setIsAuth(false);
        }
      } else {
        clearAuthSession();
        setIsAuth(false);
      }
    } catch {
      // console.error("Erreur lors de la récupération du contexte agency", e);
      setIsAuth(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- INITIALISATION ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('lang');
    if (savedLang === 'EN' || savedLang === 'FR') {
      setLang(savedLang);
    }

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    setDarkMode(true);
  } else {
    document.documentElement.classList.remove('dark');
    setDarkMode(false);
  }


    const token = getStoredToken();
    if (token) {
      authService.setToken(token);
      fetchContext();
    } else {
      setIsLoading(false);
    }

    const stopWatcher = initAuthSessionWatcher(() => {
      clearAuthSession();
      setIsAuth(false);
      alert('Session expirée. Reconnectez-vous.');
    });

    return () => stopWatcher();
  }, [fetchContext]);

  // --- ACTIONS ---
  const handleAuth = async (form: any) => {
    try {
      setInitError('');
      const res = await authService.login(form);
      if (res.ok && 'token' in res) {
        authService.setToken(res.token);
        persistAuthToken(res.token);
        await fetchContext();
        return true;
      }
    } catch {
      // console.error(e);
    }
    return false;
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  // --- RENDUS CONDITIONNELS ---
  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#f4f7fe] dark:bg-[#080b14]">
      <Loader2 className="animate-spin text-[#0528d6] size-12" />
    </div>
  );

  if (!isAuth) return (
    <AuthView onAuth={handleAuth} lang={lang} setLang={setLang} darkMode={darkMode} toggleTheme={toggleTheme} t={t} initError={initError} />
  );

  return (
    <div className="flex h-screen bg-white dark:bg-[#080b14] overflow-hidden transition-colors duration-500">
      
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        handleLogout={() => { clearAuthSession(); window.location.reload(); }}
        parentOrg={parentOrg}
        userData={userData}
        staffPermissions={staffPermissions}
        t={t}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <PlatformFeedbackPrompt feedbackUrl="https://rental.yowyob.com/feedback" />
        <Header 
            title={currentView === 'DASHBOARD' ? t.sidebar.dash : t.sidebar[currentView.toLowerCase() as 'systemSubtitle' || 'ops' || 'dash' || 'reservations' || 'rentals' || 'transactions' || 'resources' || 'fleet' || 'drivers' || 'network' || 'logout' || 'status' || 'vehicles' || 'profile'] || currentView}
            userData={userData}
            agencyData={agencyData}
            lang={lang} 
            setLang={setLang}
            darkMode={darkMode} 
            toggleTheme={toggleTheme}
            setSidebarOpen={setSidebarOpen}
            setCurrentView={setCurrentView}
            t={t}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-[#f4f7fe] dark:bg-[#0f1323] custom-scrollbar text-left">
          <div className="max-w-[1600px] mx-auto">
            
            {currentView === 'DASHBOARD' && hasPermission(userData, staffPermissions, 'stats:dashboard') && (
                <DashboardView userData={userData} agencyData={agencyData} stats={stats} t={t} setCurrentView={setCurrentView} />
            )}

            {currentView === 'RESERVATIONS' && hasPermission(userData, staffPermissions, 'rental:list') && (
                <ReservationsView userData={userData} staffPermissions={staffPermissions} t={t} />
            )}

            {currentView === 'RENTALS' && hasPermission(userData, staffPermissions, 'rental:list') && (
                <RentalsView userData={userData} staffPermissions={staffPermissions} t={t} />
            )}

            {currentView === 'TRANSACTIONS' && hasPermission(userData, staffPermissions, 'finance:transactions') && (
                <TransactionsView userData={userData} t={t} />
            )}

            {currentView === 'VEHICLES' && hasPermission(userData, staffPermissions, 'vehicle:list') && (
                <VehiclesView userData={userData} staffPermissions={staffPermissions} t={t} />
            )}

            {currentView === 'DRIVERS' && hasPermission(userData, staffPermissions, 'driver:list') && (
                <DriversView userData={userData} staffPermissions={staffPermissions} t={t} />
            )}

            {currentView === 'NOTIFICATIONS' && (
                <NotificationsView agencyId={agencyData?.id} t={t} />
            )}

            {currentView === 'PROFILE' && (
                <ProfileView userData={userData} agencyData={agencyData} parentOrg={parentOrg} onUpdate={fetchContext} t={t} />
            )}

          </div>
        </div>
      </main>
      {isAuth && <SupportChatWidget />}
    </div>
  );
}
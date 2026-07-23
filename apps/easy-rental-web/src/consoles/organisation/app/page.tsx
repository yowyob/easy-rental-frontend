/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { authService, clearAuthSession, initAuthSessionWatcher, getStoredToken, markFirstUsageDone } from '@pwa-easy-rental/shared-services';
import { PlatformFeedbackPrompt } from '@shared-ui/components/ui/PlatformFeedbackPrompt';
import { SupportChatWidget } from '@pwa-easy-rental/shared-ui';

import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { AuthView } from '../views/AuthView';
import { DashboardView } from '../views/DashboardView';
import { AgenciesView } from '../views/AgenciesView';
import { RolesView } from '../views/RolesView';
import { StaffView } from '../views/StaffView';
import { VehiclesView } from '../views/VehiclesView';
import { VehicleCategoriesView } from '../views/VehicleCategoriesView';
import { SubscriptionView } from '../views/SubscriptionView';
import { ProfileView } from '../views/ProfileView';
import { NotificationsView } from '../views/NotificationsView';
import { OnboardingStepper } from '../components/OnboardingStepper';
import { GovernanceBanner } from '../components/GovernanceBanner';
import { ReservationsView } from '../views/ReservationsView';
import { RentalsView } from '../views/RentalsView';
import { TransactionsView } from '../views/TransactionsView';

import { Loader2 } from 'lucide-react';
import { fr } from '../locales/fr';
import { en } from '../locales/en';

export default function OrganisationDashboard() {
  const [currentView, setCurrentView] = useState<string>('DASHBOARD');
  const [lang, setLang] = useState<'FR' | 'EN'>('FR');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [orgData, setOrgData] = useState<any>(null);

  const t = lang === 'FR' ? fr : en;

  const fetchProfile = useCallback(async () => {
    try {
      const meRes = await authService.getOrgUserMe();
      if (meRes.ok && meRes.data) {
        const { user, organization } = meRes.data;
        if (user) {
          setOrgData(organization);
          setUserData(user);
          setIsOnboarded(Boolean(meRes.data.isOnboarded));
          setIsAuth(true);
          markFirstUsageDone();
          return true;
        }
      }
      // Si on arrive ici, c'est que l'appel a échoué
      clearAuthSession();
      setIsAuth(false);
      return false;
    } catch {
      // console.error("Erreur profile:", e);
      setIsAuth(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => { 
      e.preventDefault(); 
      setDeferredPrompt(e); 
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

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
      fetchProfile();
    } else {
      setIsLoading(false);
    }

    const stopWatcher = initAuthSessionWatcher(() => {
      setIsAuth(false);
      setUserData(null);
      setOrgData(null);
      alert('Session expirée. Reconnectez-vous.');
    });

    const onSessionExpired = () => {
      setIsAuth(false);
      setUserData(null);
      setOrgData(null);
    };
    window.addEventListener('auth:session-expired', onSessionExpired);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('auth:session-expired', onSessionExpired);
      stopWatcher();
    };
  }, [fetchProfile]);

  const persistTokenAndFetchProfile = async (token: string) => {
    authService.setToken(token);
    return fetchProfile();
  };

  const handleAuthAction = async (
    isSignUp: boolean,
    form: any,
    mfa?: { token: string; code: string }
  ): Promise<boolean | { mfaRequired: true; mfaToken: string; mfaChannel?: string } | { error: string }> => {
    try {
      if (mfa) {
        const mfaRes = await authService.confirmMfa(mfa.token, mfa.code);
        if (mfaRes.ok) {
          return await persistTokenAndFetchProfile(mfaRes.token);
        }
        return { error: 'Code MFA invalide' };
      }

      if (isSignUp) {
        const regRes = await authService.registerOrg(form);
        if (!regRes.ok) {
          const apiMessage = (regRes.data as { message?: string })?.message ?? '';
          // Cas email non vérifié : message user-friendly, pas de tentative de login
          if (apiMessage.includes('EMAIL_NOT_VERIFIED') || apiMessage.toLowerCase().includes('not verified')) {
            return {
              error: "Compte créé avec succès. Un email de vérification vient d'être envoyé — "
                + 'consultez votre boîte mail (et vos spams) puis revenez vous connecter.',
            };
          }
          return { error: apiMessage || 'Inscription impossible. Vérifiez vos informations.' };
        }
      }

      const loginRes = await authService.login({ email: form.email, password: form.password });
      if ('mfaRequired' in loginRes && loginRes.mfaRequired) {
        return {
          mfaRequired: true,
          mfaToken: loginRes.mfaToken,
          mfaChannel: loginRes.mfaChannel,
        };
      }
      if (loginRes.ok) {
        const profileOk = await persistTokenAndFetchProfile(loginRes.token);
        if (!profileOk) {
          return {
            error: 'Connexion réussie mais le profil organisation est inaccessible. Vérifiez que le backend local tourne sur le port 8081.',
          };
        }
        return true;
      }
      const loginErr = loginRes.error || '';
      if (isSignUp && (loginErr.includes('EMAIL_NOT_VERIFIED') || loginErr.toLowerCase().includes('not verified'))) {
        return {
          error: "Compte créé avec succès. Un email de vérification vient d'être envoyé — "
            + 'consultez votre boîte mail (et vos spams) puis revenez vous connecter.',
        };
      }
      return { error: loginErr || 'Connexion impossible. Vérifiez email et mot de passe.' };
    } catch {
      return { error: 'Erreur réseau ou serveur indisponible.' };
    }
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleSetLang = (next: 'FR' | 'EN') => {
    setLang(next);
    localStorage.setItem('lang', next);
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') setDeferredPrompt(null);
      return;
    }
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS) {
      alert(
        lang === 'FR'
          ? 'Sur iPhone/iPad : appuyez sur Partager puis « Sur l’écran d’accueil » pour installer Easy Rental.'
          : 'On iPhone/iPad: tap Share, then “Add to Home Screen” to install Easy Rental.'
      );
      return;
    }
    alert(t.installNotice || t.hero?.installNotice || 'Utilisez Chrome ou Edge pour installer l’application.');
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#f4f7fe] dark:bg-[#080b14]">
      <Loader2 className="animate-spin text-[#0528d6] size-12" />
    </div>
  );

  if (!isAuth) return (
    <AuthView onAuth={handleAuthAction} lang={lang} setLang={handleSetLang} darkMode={darkMode} toggleTheme={toggleTheme} t={t} />
  );

  if (!isOnboarded) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7fe] dark:bg-[#080b14] p-6">
      <OnboardingStepper
        orgId={orgData?.id}
        initialName={orgData?.name}
        initialOrg={orgData}
        userEmail={userData?.email}
        onComplete={() => { setIsOnboarded(true); fetchProfile(); }} 
        onLogout={() => { clearAuthSession(); window.location.reload(); }} 
        t={t} 
      />
    </div>
  );

  return (
    <div className="flex h-screen bg-white dark:bg-[#080b14] overflow-hidden transition-colors duration-500">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleInstall={handleInstallApp}
        handleLogout={() => { clearAuthSession(); window.location.reload(); }}
        userData={userData}
        accountType={orgData?.accountType}
        t={t}
      />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <PlatformFeedbackPrompt feedbackUrl="http://localhost:3000/feedback" />
        <Header 
          title={t.views[currentView as 'DASHBOARD' || 'AGENCIES' || 'ROLES' || 'STAFF' || 'SUBSCRIPTION'] || currentView} 
          setCurrentView={setCurrentView} 
          orgData={orgData} 
          lang={lang} 
          setLang={handleSetLang} 
          darkMode={darkMode} 
          toggleTheme={toggleTheme} 
          setSidebarOpen={setSidebarOpen} 
          onInstall={handleInstallApp} 
          hasPrompt={!!deferredPrompt} 
          t={t} 
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#f4f7fe] dark:bg-[#0f1323] custom-scrollbar text-left">
          <div className="max-w-[1600px] mx-auto">
            <GovernanceBanner orgData={orgData} />
            {currentView === 'DASHBOARD' && <DashboardView orgData={orgData} t={t} />}
            {currentView === 'RESERVATIONS' && <ReservationsView orgData={orgData} t={t} />}
            {currentView === 'RENTALS' && <RentalsView orgData={orgData} t={t} />}
            {currentView === 'TRANSACTIONS' && <TransactionsView orgData={orgData} t={t} />}
            {currentView === 'AGENCIES' && <AgenciesView orgData={orgData} setCurrentView={setCurrentView} t={t} />}
            {currentView === 'ROLES' && <RolesView orgData={orgData} t={t} />}
            {currentView === 'STAFF' && <StaffView orgData={orgData} t={t} />}
            {currentView === 'VEHICLES' && <VehiclesView orgData={orgData} t={t} />}
            {currentView === 'CATEGORIES' && <VehicleCategoriesView orgData={orgData} t={t} />}
            {currentView === 'SUBSCRIPTION' && <SubscriptionView orgData={orgData} t={t} />}
            {currentView === 'PROFILE' && <ProfileView orgData={orgData} userData={userData} onUpdate={fetchProfile} t={t} />}
            {currentView === 'NOTIFICATIONS' && <NotificationsView orgId={orgData?.id} t={t} />}
          </div>
        </div>
      </main>
      {isAuth && <SupportChatWidget />}
    </div>
  );
}
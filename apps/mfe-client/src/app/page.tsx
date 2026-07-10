/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Footer } from '@shared-ui/components/ui/Footer';
import { authService, initAuthSessionWatcher, getStoredToken, persistAuthToken, markFirstUsageDone } from '@pwa-easy-rental/shared-services';
import { PlatformFeedbackPrompt } from '@shared-ui/components/ui/PlatformFeedbackPrompt';
import { SupportChatWidget } from '@pwa-easy-rental/shared-ui';

import { Header } from '../components/Header';
import { AuthView } from '../views/AuthView';
import { HomeView } from '../views/HomeView';
import { CatalogView } from '../views/CatalogView';
import { VehicleDetailsView } from '../views/VehicleDetailsView';
import { MyBookingsView } from '../views/MyBookingsView';
import { ProfileView } from '../views/ProfileView';
import { NotificationsView } from '../views/NotificationsView';

import { useClientI18n } from '../hooks/useClientI18n';
import { Loader2 } from 'lucide-react';

import { MyReservationsView } from '@/views/ReservationsView';

export default function ClientDashboard() {
  const[currentView, setCurrentView] = useState<string>('HOME');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [lang, setLang] = useState<'FR' | 'EN'>('FR');
  const [darkMode, setDarkMode] = useState(false);
  const[, setDeferredPrompt] = useState<any>(null);

  // Ajout de l'état pour gérer le menu mobile du nouveau Header
  const [, setSidebarOpen] = useState(false);

  const[isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const t = useClientI18n(lang);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await authService.getUserMe();
      if (res.ok && res.data) {
        setUserData(res.data);
        setIsAuth(true);
      } else {
        localStorage.removeItem('auth_token');
        setIsAuth(false);
      }
    } catch {
      setIsAuth(false);
    } finally {
      setIsLoading(false);
    }
  },[]);

  useEffect(() => {
    const handlePrompt = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handlePrompt);

    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('lang');
    if (savedLang === 'EN' || savedLang === 'FR') setLang(savedLang);

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
    } else setIsLoading(false);

    const stopWatcher = initAuthSessionWatcher(() => {
      setIsAuth(false);
      setUserData(null);
      alert('Votre session a expiré. Veuillez vous reconnecter.');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      stopWatcher();
    };
  }, [fetchProfile]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  }

  const handleAuthAction = async (
    isSignUp: boolean,
    form: { firstname: string; lastname: string; email: string; password: string },
    mfa?: { token: string; code: string }
  ): Promise<
    | boolean
    | { mfaRequired: true; mfaToken: string; mfaChannel?: string }
    | { emailVerificationRequired: true; message: string }
    | { error: string }
  > => {
    try {
      if (mfa) {
        const mfaRes = await authService.confirmMfa(mfa.token, mfa.code);
        if (mfaRes.ok) {
          persistAuthToken(mfaRes.token);
          authService.setToken(mfaRes.token);
          await fetchProfile();
          setCurrentView('HOME');
          return true;
        }
        return { error: 'Code MFA invalide' };
      }

      if (isSignUp) {
        const regRes = await authService.registerClient(form);
        if (!regRes.ok) {
          return { error: regRes.error };
        }
        if (regRes.emailVerificationRequired) {
          return {
            emailVerificationRequired: true,
            message:
              'Inscription réussie ! Un email de vérification a été envoyé. '
              + 'Vérifiez votre boîte mail avant de vous connecter.',
          };
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
        persistAuthToken(loginRes.token);
        authService.setToken(loginRes.token);
        markFirstUsageDone();
        await fetchProfile();
        setCurrentView('HOME');
        return true;
      }
      const loginError = loginRes.error || '';
      if (
        isSignUp
        && (loginError.includes('EMAIL_NOT_VERIFIED') || loginError.toLowerCase().includes('not verified'))
      ) {
        return {
          emailVerificationRequired: true,
          message:
            'Inscription enregistrée. Un email de vérification a été envoyé — '
            + 'vérifiez votre boîte mail avant de vous connecter.',
        };
      }
      return { error: loginError || 'Connexion impossible. Verifiez email et mot de passe.' };
    } catch {
      return { error: 'Erreur reseau ou serveur indisponible.' };
    }
  };

  if (isLoading) return (
      <div className="h-screen flex items-center justify-center bg-[#f4f7fe] dark:bg-[#080b14]">
        <Loader2 className="animate-spin text-[#0528d6] size-12" />
      </div>
  );

  if (!isAuth && currentView === 'AUTH') return (
      <AuthView
        onAuth={handleAuthAction}
        onBack={() => setCurrentView('CATALOG')}
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        toggleTheme={() => toggleDarkMode()}
      />
  );

  return (
      <div className="min-h-screen bg-[#f4f7fe] dark:bg-[#0f1323] transition-colors duration-300 font-sans flex flex-col">
        <Header
            isAuth={isAuth}
            userData={userData}
            currentView={currentView}
            setCurrentView={setCurrentView}
            toggleTheme={() => toggleDarkMode()}
            darkMode={darkMode}
            lang={lang}
            setLang={setLang}
            t={t}
            setSidebarOpen={setSidebarOpen}
            onLogout={() => { localStorage.removeItem('auth_token'); window.location.reload(); }}
        />

        {isAuth && (
          <div className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-20 md:pt-[4.5rem]">
            <PlatformFeedbackPrompt feedbackUrl="http://localhost:3000/feedback" />
          </div>
        )}

        <main className={`flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pb-6 ${isAuth ? 'pt-3' : 'pt-20 md:pt-[4.5rem]'}`}>
          {currentView === 'HOME' && <HomeView lang={lang} onSearch={() => setCurrentView('CATALOG')} setViewAll={() => setCurrentView('CATALOG')} onSelectVehicle={(id: string) => { setSelectedVehicleId(id); setCurrentView('DETAILS'); }} />}
          {currentView === 'CATALOG' && <CatalogView lang={lang} userData={userData} />}
          {currentView === 'DETAILS' && selectedVehicleId && <VehicleDetailsView vehicleId={selectedVehicleId} isAuth={isAuth} onBack={() => setCurrentView('CATALOG')} onAuthRequired={() => setCurrentView('AUTH')} onStartBooking={() => setCurrentView('CATALOG')} />}
          {currentView === 'MY_BOOKINGS' && <MyBookingsView lang={lang} userData={userData} onNavigateToCatalog={() => setCurrentView('CATALOG')} />}
          {currentView === 'MY_RESERVATIONS' && <MyReservationsView lang={lang} userData={userData} onNavigateToCatalog={() => setCurrentView('CATALOG')} />}
          {currentView === 'PROFILE' && (
            <ProfileView
              lang={lang}
              userData={userData}
              onBack={() => setCurrentView('HOME')}
              onProfileUpdated={(updated) => setUserData(updated)}
              onLogout={() => { localStorage.removeItem('auth_token'); window.location.reload(); }}
            />
          )}

          {currentView === 'NOTIFICATIONS' && <NotificationsView clientId={userData?.id} />}
        </main>
        <Footer t={t.footer} nav={{ features: t.footer.features }} landingBaseUrl="http://localhost:3000" />
        {isAuth && <SupportChatWidget />}
      </div>
  );
}

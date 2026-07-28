'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Building2, CreditCard, Loader2, MessageSquare, Star } from 'lucide-react';
import {
  adminService,
  authService,
  clearAuthSession,
  getStoredToken,
  initAuthSessionWatcher,
  type NormalizedSubscriptionPlan,
} from '@pwa-easy-rental/shared-services';
import { AuthView } from '../views/AuthView';
import { OrganizationsView } from '../views/OrganizationsView';
import { PlansView } from '../views/PlansView';
import { SupportInboxView } from '../views/SupportInboxView';
import { ReviewsModerationView } from '../views/ReviewsModerationView';
import { PlatformStatsView } from '../views/PlatformStatsView';
import { AuditLogView } from '../views/AuditLogView';
import { BillingView } from '../views/BillingView';
import { ChatAuditView } from '../views/ChatAuditView';
import { AdminSidebar, type AdminTab } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { StatCard } from '../components/StatCard';

function normalizeUser(raw: Record<string, unknown> | null | undefined) {
  if (!raw) return null;
  return {
    email: String(raw.email ?? ''),
    role: String(raw.role ?? ''),
    firstname: String(raw.firstname ?? raw.first_name ?? ''),
    lastname: String(raw.lastname ?? raw.last_name ?? ''),
  };
}

export default function AdminConsole() {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [initError, setInitError] = useState('');
  const [tab, setTab] = useState<AdminTab>('ORGS');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [plans, setPlans] = useState<NormalizedSubscriptionPlan[]>([]);
  const [orgCount, setOrgCount] = useState(0);
  const [supportUnread, setSupportUnread] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);

  const loadPlans = useCallback(async () => {
    const res = await adminService.getPlans();
    if (res.ok && Array.isArray(res.data)) {
      setPlans(res.data as NormalizedSubscriptionPlan[]);
    }
  }, []);

  const loadStats = useCallback(async () => {
    const [orgsRes, threadsRes, reviewStatsRes] = await Promise.all([
      adminService.getAllOrganizations(),
      adminService.getSupportConversations(),
      adminService.getReviewModerationStats(),
    ]);
    if (orgsRes.ok && Array.isArray(orgsRes.data)) {
      setOrgCount(orgsRes.data.length);
    }
    if (threadsRes.ok && Array.isArray(threadsRes.data)) {
      setSupportUnread(
        threadsRes.data.reduce((sum, thread) => sum + (Number(thread.adminUnreadCount) || 0), 0)
      );
    }
    if (reviewStatsRes.ok && reviewStatsRes.data) {
      setPendingReviews(Number(reviewStatsRes.data.unpublishedCount) || 0);
    }
  }, []);

  const fetchContext = useCallback(async () => {
    setIsLoading(true);
    setInitError('');
    try {
      const meRes = await authService.getUserMe();
      if (!meRes.ok || !meRes.data) {
        clearAuthSession();
        setIsAuth(false);
        return;
      }
      const currentUser = normalizeUser(meRes.data as Record<string, unknown>);
      if (!currentUser || currentUser.role !== 'ADMIN') {
        clearAuthSession();
        setInitError('Ce compte n\'a pas le rôle ADMIN.');
        setIsAuth(false);
        return;
      }
      setUser({ email: currentUser.email, role: currentUser.role });
      await Promise.all([loadPlans(), loadStats()]);
      setIsAuth(true);
    } catch {
      setIsAuth(false);
    } finally {
      setIsLoading(false);
    }
  }, [loadPlans, loadStats]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
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

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleAuth = async (form: { email: string; password: string }) => {
    setInitError('');
    clearAuthSession();
    const res = await authService.login({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if ('mfaRequired' in res && res.mfaRequired) {
      return { ok: false, message: 'Connexion MFA requise — non supportée sur la console admin.' };
    }

    if (!('ok' in res) || !res.ok || !('token' in res)) {
      const message = 'error' in res ? res.error : 'Identifiants invalides';
      setInitError(message);
      return { ok: false, message };
    }

    authService.setToken(res.token);

    const meRes = await authService.getUserMe();
    if (!meRes.ok || !meRes.data) {
      clearAuthSession();
      const message = 'Session invalide après connexion. Vérifiez que le backend tourne (port 8081).';
      setInitError(message);
      return { ok: false, message };
    }

    const currentUser = normalizeUser(meRes.data as Record<string, unknown>);
    if (!currentUser || currentUser.role.toUpperCase() !== 'ADMIN') {
      clearAuthSession();
      const message = 'Ce compte n\'a pas le rôle ADMIN.';
      setInitError(message);
      return { ok: false, message };
    }

    setUser({ email: currentUser.email, role: currentUser.role });
    await Promise.all([loadPlans(), loadStats()]);
    setIsAuth(true);
    setIsLoading(false);
    return { ok: true };
  };

  const handleLogout = () => {
    clearAuthSession();
    setIsAuth(false);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f4f7fe] dark:bg-[#080b14]">
        <Loader2 className="animate-spin text-[#0528d6] size-12" />
      </div>
    );
  }

  if (!isAuth) {
    return <AuthView onAuth={handleAuth} error={initError} darkMode={darkMode} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#080b14] overflow-hidden transition-colors duration-500">
      <AdminSidebar
        tab={tab}
        setTab={setTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        supportUnread={supportUnread}
        pendingReviews={pendingReviews}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <AdminHeader
          tab={tab}
          userEmail={user?.email ?? ''}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#f4f7fe] dark:bg-[#0f1323] custom-scrollbar text-left">
          <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              <StatCard label="Organisations" value={orgCount} icon={<Building2 />} />
              <StatCard label="Plans actifs" value={plans.length} icon={<CreditCard />} />
              <StatCard label="Messages non lus" value={supportUnread} icon={<MessageSquare />} />
              <StatCard label="Avis en attente" value={pendingReviews} icon={<Star />} />
            </div>

            {tab === 'STATS' && <PlatformStatsView />}
            {tab === 'ORGS' && (
              <OrganizationsView
                plans={plans}
                onDataChanged={() => { loadStats(); }}
              />
            )}
            {tab === 'PLANS' && (
              <PlansView plans={plans} onPlansChanged={() => { loadPlans(); loadStats(); }} />
            )}
            {tab === 'MESSAGES' && (
              <SupportInboxView onActivityChange={loadStats} />
            )}
            {tab === 'REVIEWS' && (
              <ReviewsModerationView onActivityChange={loadStats} />
            )}
            {tab === 'AUDIT' && <AuditLogView />}
            {tab === 'BILLING' && <BillingView />}
            {tab === 'CHAT' && <ChatAuditView />}
          </div>
        </div>
      </main>
    </div>
  );
}

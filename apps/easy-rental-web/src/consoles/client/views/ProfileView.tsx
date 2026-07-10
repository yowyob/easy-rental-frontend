/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Mail,
  ShieldCheck,
  Clock,
  History,
  LogOut,
  ArrowLeft,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
} from 'lucide-react';
import { authService, transactionService } from '@shared-services/api';
import { TransactionCard } from './profile/TransactionsCard';
import { useClientI18n } from '../hooks/useClientI18n';

type Feedback = { type: 'success' | 'error'; message: string } | null;

export const ProfileView = ({
  userData,
  onLogout,
  onBack,
  onProfileUpdated,
  lang = 'FR',
}: {
  userData: any;
  onLogout: () => void;
  onBack?: () => void;
  onProfileUpdated?: (user: any) => void;
  lang?: 'FR' | 'EN';
}) => {
  const t = useClientI18n(lang);
  const p = t.profile;

  const [identity, setIdentity] = useState({ firstname: '', lastname: '' });
  const [passwords, setPasswords] = useState({ old: '', next: '', confirm: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (userData) {
      setIdentity({
        firstname: userData.firstname ?? '',
        lastname: userData.lastname ?? '',
      });
    }
  }, [userData]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userData) return;
      try {
        const res = await transactionService.getClientTransactions();
        if (res.ok && Array.isArray(res.data)) setTransactions(res.data);
      } catch {
        /* ignore */
      }
    };
    fetchTransactions();
  }, [userData]);

  const totals = useMemo(() => {
    const spent = transactions.reduce((sum, tx) => {
      const amount = Number(tx.amount ?? 0);
      const isCredit =
        String(tx.type ?? '').toLowerCase() === 'credit'
        || String(tx.type ?? '').toLowerCase() === 'refund';
      return isCredit ? sum : sum + amount;
    }, 0);
    const bookings = transactions.filter((tx) =>
      String(tx.description ?? '').toLowerCase().includes('location')
      || String(tx.description ?? '').toLowerCase().includes('rental')
      || String(tx.type ?? '').toLowerCase().includes('payment'),
    ).length;
    return { spent, bookings: bookings || transactions.length };
  }, [transactions]);

  const extractError = (data: unknown, fallback: string) => {
    if (!data || typeof data !== 'object') return fallback;
    const raw = data as Record<string, unknown>;
    const message = raw.message ?? raw.error ?? raw.detail;
    return typeof message === 'string' && message.trim() ? message : fallback;
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);

    const firstname = identity.firstname.trim();
    const lastname = identity.lastname.trim();
    if (!firstname || !lastname) {
      setProfileFeedback({ type: 'error', message: p.profileRequired });
      return;
    }

    setSavingProfile(true);
    const res = await authService.updateProfile({ firstname, lastname });
    setSavingProfile(false);

    if (!res.ok) {
      setProfileFeedback({
        type: 'error',
        message: extractError(res.data, p.profileError),
      });
      return;
    }

    const updated = {
      ...userData,
      ...(res.data && typeof res.data === 'object' ? res.data : {}),
      firstname,
      lastname,
      fullname: `${firstname} ${lastname}`,
    };
    onProfileUpdated?.(updated);
    setProfileFeedback({ type: 'success', message: p.profileSuccess });
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!passwords.old.trim() || !passwords.next.trim()) {
      setPasswordFeedback({ type: 'error', message: p.passwordRequired });
      return;
    }
    if (passwords.next.length < 6) {
      setPasswordFeedback({ type: 'error', message: p.passwordTooShort });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordFeedback({ type: 'error', message: p.passwordMismatch });
      return;
    }

    setSavingPassword(true);
    const res = await authService.updatePassword({
      oldPassword: passwords.old,
      newPassword: passwords.next,
    });
    setSavingPassword(false);

    if (!res.ok) {
      setPasswordFeedback({
        type: 'error',
        message: extractError(res.data, p.passwordError),
      });
      return;
    }

    setPasswords({ old: '', next: '', confirm: '' });
    setPasswordFeedback({ type: 'success', message: p.passwordSuccess });
  };

  const initials = `${userData?.firstname?.charAt(0) ?? ''}${userData?.lastname?.charAt(0) ?? ''}`.toUpperCase() || 'C';

  return (
    <div className="w-full mx-auto space-y-6 animate-in fade-in duration-500 pb-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#0528d6] transition-colors"
        >
          <ArrowLeft size={14} /> {p.backHome}
        </button>
      )}

      <section className="relative overflow-hidden rounded-2xl bg-[#0528d6] text-white shadow-xl shadow-[#0528d6]/20">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img src="/client/vehicle-placeholder.svg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute -top-16 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        <div className="relative px-6 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <div className="size-24 rounded-full bg-white p-1.5 shadow-xl shrink-0">
            <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center border-4 border-white">
              <span className="text-2xl font-black text-[#0528d6] tracking-tighter">{initials}</span>
            </div>
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-[900] italic tracking-tight truncate">
              {userData?.firstname} {userData?.lastname}
            </h1>
            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.2em] text-blue-100">
              {userData?.role || p.clientRole}
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-blue-50/90">
              <Mail size={14} /> {userData?.email}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <section className="bg-white dark:bg-[#1a1d2d] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[#0528d6] flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-lg font-[900] italic text-[#0528d6] tracking-tight">{p.accountInfo}</h2>
                <p className="text-xs text-slate-400">{p.accountHint}</p>
              </div>
            </div>

            {profileFeedback && <FeedbackBanner feedback={profileFeedback} />}

            <form onSubmit={updateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={p.firstname}>
                  <input
                    value={identity.firstname}
                    onChange={(e) => setIdentity({ ...identity, firstname: e.target.value })}
                    className={inputClass}
                    autoComplete="given-name"
                  />
                </Field>
                <Field label={p.lastname}>
                  <input
                    value={identity.lastname}
                    onChange={(e) => setIdentity({ ...identity, lastname: e.target.value })}
                    className={inputClass}
                    autoComplete="family-name"
                  />
                </Field>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 bg-[#0528d6] text-white px-5 py-3 rounded-xl text-xs font-black hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-lg shadow-[#0528d6]/20"
                >
                  {savingProfile ? <Loader2 size={14} className="animate-spin" /> : null}
                  {p.updateProfile}
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white dark:bg-[#1a1d2d] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-[#F76513] flex items-center justify-center">
                <Lock size={18} />
              </div>
              <div>
                <h2 className="text-lg font-[900] italic text-[#0528d6] tracking-tight">{p.security}</h2>
                <p className="text-xs text-slate-400">{p.securityHint}</p>
              </div>
            </div>

            {passwordFeedback && <FeedbackBanner feedback={passwordFeedback} />}

            <form onSubmit={updatePassword} className="space-y-4">
              <Field label={p.currentPassword}>
                <PasswordField
                  value={passwords.old}
                  visible={showOld}
                  onToggle={() => setShowOld((v) => !v)}
                  onChange={(v) => setPasswords({ ...passwords, old: v })}
                  autoComplete="current-password"
                  showLabel={p.showPassword}
                  hideLabel={p.hidePassword}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={p.newPassword}>
                  <PasswordField
                    value={passwords.next}
                    visible={showNext}
                    onToggle={() => setShowNext((v) => !v)}
                    onChange={(v) => setPasswords({ ...passwords, next: v })}
                    autoComplete="new-password"
                    showLabel={p.showPassword}
                    hideLabel={p.hidePassword}
                  />
                </Field>
                <Field label={p.confirmPassword}>
                  <PasswordField
                    value={passwords.confirm}
                    visible={showConfirm}
                    onToggle={() => setShowConfirm((v) => !v)}
                    onChange={(v) => setPasswords({ ...passwords, confirm: v })}
                    autoComplete="new-password"
                    showLabel={p.showPassword}
                    hideLabel={p.hidePassword}
                  />
                </Field>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 bg-[#0528d6] text-white px-5 py-3 rounded-xl text-xs font-black hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-lg shadow-[#0528d6]/20"
                >
                  {savingPassword ? <Loader2 size={14} className="animate-spin" /> : null}
                  {p.updatePassword}
                </button>
              </div>
            </form>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="relative overflow-hidden rounded-2xl bg-[#0528d6] p-5 text-white shadow-xl shadow-[#0528d6]/20">
            <ShieldCheck className="absolute -bottom-6 -right-6 opacity-10 rotate-12" size={120} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard size={18} className="text-blue-100" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">
                  {p.financialSummary}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-bold text-blue-100 mb-1">{p.totalSpent}</p>
                  <p className="text-2xl font-black italic">
                    {totals.spent.toLocaleString(lang === 'EN' ? 'en-US' : 'fr-FR')}{' '}
                    <span className="text-sm not-italic">XAF</span>
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-bold text-blue-100 mb-1">{p.operations}</p>
                  <p className="text-2xl font-black italic">{totals.bookings}</p>
                </div>
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3.5 bg-white dark:bg-[#1a1d2d] border border-red-100 dark:border-red-900/40 text-red-500 rounded-2xl text-xs font-black flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
          >
            <LogOut size={14} /> {p.logout}
          </button>
        </aside>
      </div>

      <section className="bg-white dark:bg-[#1a1d2d] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[#0528d6] flex items-center justify-center">
              <History size={18} />
            </div>
            <div>
              <h2 className="text-lg font-[900] italic text-[#0528d6] tracking-tight">
                {p.transactionsHistory}
              </h2>
              <p className="text-xs text-slate-400">{p.operationsTotal} : {transactions.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((tx) => <TransactionCard key={tx.id} tx={tx} />)
          ) : (
            <div className="py-12 text-center">
              <div className="size-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Clock size={28} />
              </div>
              <p className="text-slate-400 text-sm font-medium">{p.noActivity}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const inputClass =
  'w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white focus:border-[#0528d6] focus:ring-2 focus:ring-[#0528d6]/15 outline-none transition-all';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function PasswordField({
  value,
  visible,
  onToggle,
  onChange,
  autoComplete,
  showLabel,
  hideLabel,
}: {
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
  autoComplete?: string;
  showLabel: string;
  hideLabel: string;
}) {
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        autoComplete={autoComplete}
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0528d6]"
        aria-label={visible ? hideLabel : showLabel}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function FeedbackBanner({ feedback }: { feedback: NonNullable<Feedback> }) {
  return (
    <div
      className={`mb-4 flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm ${
        feedback.type === 'success'
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
          : 'bg-red-50 text-red-800 border border-red-100'
      }`}
    >
      {feedback.type === 'success'
        ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
        : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
      <p>{feedback.message}</p>
    </div>
  );
}

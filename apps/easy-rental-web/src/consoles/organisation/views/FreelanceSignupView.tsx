/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Lock, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { authService, extraService } from '@pwa-easy-rental/shared-services';
import { AuthInput } from '../components/AuthInput';

interface FreelancePlan {
  id: string;
  name: string;
  description?: string;
  price?: number;
  maxVehicles?: number;
  hasChat?: boolean;
  hasGeofencing?: boolean;
  targetType?: string;
}

export const FreelanceSignupView = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    planId: '',
  });
  const [plans, setPlans] = useState<FreelancePlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    extraService.getPlans().then((res: any) => {
      if (cancelled) return;
      const all: FreelancePlan[] = res.ok && Array.isArray(res.data) ? res.data : [];
      const freelanceOnly = all.filter((p) => (p.targetType || '').toUpperCase() === 'FREELANCE');
      setPlans(freelanceOnly);
      const free = freelanceOnly.find((p) => p.name === 'FREELANCE_FREE');
      if (free) setForm((f) => ({ ...f, planId: free.id }));
      setLoadingPlans(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.firstname || !form.lastname || !form.email || !form.password || !form.city) {
      setError('Tous les champs sauf téléphone sont obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authService.registerFreelance(form);
      if (!res.ok) {
        const message = res.data?.message || '';
        if (message.includes('EMAIL_NOT_VERIFIED') || message.toLowerCase().includes('not verified')) {
          setSuccess(
            'Compte créé. Un email de vérification vient d\'être envoyé. Consultez votre boîte mail '
              + '(et vos spams) puis revenez sur la page de connexion.',
          );
          return;
        }
        setError(message || 'Inscription impossible. Vérifiez vos informations.');
        return;
      }
      setSuccess('Compte freelance créé. Vous allez être redirigé vers la connexion.');
      setTimeout(() => router.push('/organisation'), 2500);
    } catch (err: any) {
      setError(err?.message || 'Une erreur inattendue est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-[#0b0e1a] dark:to-[#101425] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/organisation"
          className="inline-flex items-center gap-2 text-[11px] font-black italic tracking-widest uppercase text-slate-500 hover:text-[#0528d6] mb-6"
        >
          <ArrowLeft size={14} /> Retour à la connexion
        </Link>

        <div className="bg-white dark:bg-[#0f1323] rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-8 md:p-12">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[9px] font-black italic tracking-widest uppercase text-[#0528d6] mb-4">
              <Check size={12} /> Espace freelance
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
              Devenez loueur particulier
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold italic">
              Créez votre compte pour publier votre véhicule à louer.
              Aucune société n'est nécessaire — juste une pièce d'identité et un compte bancaire.
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 text-[11px] font-black italic uppercase tracking-widest text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-900/30 text-[11px] font-black italic uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AuthInput
                icon={<User />}
                label="Prénom"
                placeholder="Denny"
                value={form.firstname}
                onChange={(v) => setForm({ ...form, firstname: v })}
              />
              <AuthInput
                icon={<User />}
                label="Nom"
                placeholder="Passo"
                value={form.lastname}
                onChange={(v) => setForm({ ...form, lastname: v })}
              />
            </div>

            <AuthInput
              icon={<Mail />}
              label="Email"
              type="email"
              placeholder="vous@example.com"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AuthInput
                icon={<Phone />}
                label="Téléphone"
                type="tel"
                placeholder="6 78 90 12 34"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
              <AuthInput
                icon={<MapPin />}
                label="Ville"
                placeholder="Douala"
                value={form.city}
                onChange={(v) => setForm({ ...form, city: v })}
              />
            </div>

            <AuthInput
              icon={<Lock />}
              label="Mot de passe"
              type="password"
              placeholder="Au moins 8 caractères"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
            />

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-black text-slate-400 tracking-widest ml-1 italic uppercase">
                Choisissez votre offre
              </label>
              {loadingPlans ? (
                <div className="flex items-center gap-2 mt-3 text-slate-400 text-xs italic">
                  <Loader2 size={14} className="animate-spin" />
                  Chargement des plans…
                </div>
              ) : plans.length === 0 ? (
                <p className="mt-3 text-xs italic text-slate-500">
                  Aucun plan freelance disponible pour le moment. Contactez le support.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  {plans.map((plan) => {
                    const selected = form.planId === plan.id;
                    return (
                      <button
                        type="button"
                        key={plan.id}
                        onClick={() => setForm({ ...form, planId: plan.id })}
                        className={`text-left p-4 rounded-2xl border-2 transition-all ${
                          selected
                            ? 'border-[#0528d6] bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-[10px] font-black italic uppercase tracking-widest text-[#0528d6]">
                          {plan.name.replace('FREELANCE_', '')}
                        </div>
                        <div className="text-xl font-black text-slate-900 dark:text-white italic mt-1">
                          {plan.price ? `${plan.price.toLocaleString()} FCFA` : 'Gratuit'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium italic mt-2">
                          {plan.description}
                        </div>
                        <div className="text-[10px] font-bold italic uppercase tracking-widest text-slate-400 mt-3">
                          {plan.maxVehicles ?? '?'} véhicule{(plan.maxVehicles ?? 0) > 1 ? 's' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !form.planId}
              className="w-full py-4 rounded-2xl bg-[#0528d6] text-white font-black text-xs uppercase italic tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Envoi…</> : 'Créer mon compte freelance'}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] font-bold italic uppercase tracking-widest text-slate-400">
            Vous représentez une société ?{' '}
            <Link href="/organisation" className="text-[#0528d6] hover:underline">
              Inscription organisation
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

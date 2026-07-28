/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { ArrowUpCircle, Building2, Users, Store, Check, Loader2, X } from 'lucide-react';
import { orgService } from '@pwa-easy-rental/shared-services';

export const UpgradeToCompanyView = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpgrade = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await orgService.upgradeToCompany();
      if (!res.ok) {
        setError((res.data as any)?.message || 'Impossible de finaliser la bascule. Réessayez.');
        return;
      }
      setSuccess(true);
      setShowConfirm(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      setError(e?.message || 'Erreur inattendue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-[#0f1323] rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
            <ArrowUpCircle size={28} className="text-[#0528d6]" />
          </div>
          <div>
            <div className="text-[10px] font-black italic uppercase tracking-widest text-[#0528d6]">Évolution du compte</div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
              Passer en organisation
            </h1>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          Vous exercez actuellement en tant que <strong>freelance</strong> : une seule agence est rattachée à votre compte.
          Passer en compte <strong>organisation</strong> vous permet de gérer plusieurs agences, d'embaucher du personnel
          avec des rôles distincts et d'attribuer différentes permissions à votre équipe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <FeatureCard icon={<Building2 size={20} />} title="Plusieurs agences" text="Créez et gérez autant d'agences que nécessaire." />
          <FeatureCard icon={<Users size={20} />} title="Personnel & rôles" text="Invitez des agents avec des permissions précises." />
          <FeatureCard icon={<Store size={20} />} title="Catégories véhicules" text="Structurez votre flotte par catégorie." />
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 text-[11px] font-black italic uppercase tracking-widest text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-900/30 text-[11px] font-black italic uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Check size={16} /> Compte mis à jour. Rechargement en cours…
          </div>
        )}

        <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/30 p-4 mb-6">
          <p className="text-xs italic text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Bon à savoir :</strong> ce changement est <strong>irréversible</strong>. Votre agence actuelle
            reste inchangée, mais votre compte ne bénéficiera plus des tarifs et parcours simplifiés du profil
            freelance.
          </p>
        </div>

        <button
          type="button"
          disabled={success}
          onClick={() => setShowConfirm(true)}
          className="w-full py-4 rounded-2xl bg-[#0528d6] text-white font-black text-xs uppercase italic tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <ArrowUpCircle size={16} /> Passer en compte organisation
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => !submitting && setShowConfirm(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1a1d2d] rounded-[2rem] shadow-2xl border border-white/20 p-8">
            <button
              type="button"
              onClick={() => !submitting && setShowConfirm(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white mb-3">
              Confirmer la bascule
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Vous êtes sur le point de passer votre compte freelance en compte organisation.
              Cette action est <strong>irréversible</strong>. Confirmer&nbsp;?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="flex-1 py-3 text-xs font-black uppercase italic border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={submitting}
                className="flex-1 py-3 bg-[#0528d6] text-white rounded-xl font-black text-xs uppercase italic shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> En cours…
                  </>
                ) : (
                  <>Confirmer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <div className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
    <div className="flex items-center gap-2 text-[#0528d6] mb-2">{icon}</div>
    <div className="text-[11px] font-black uppercase italic tracking-widest text-slate-900 dark:text-white mb-1">{title}</div>
    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">{text}</div>
  </div>
);

'use client';
import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Save } from 'lucide-react';
import {
  adminService,
  type CreatePlanPayload,
  type NormalizedSubscriptionPlan,
} from '@pwa-easy-rental/shared-services';
import { Portal } from '../components/Portal';

const EMPTY_FORM: CreatePlanPayload = {
  name: '',
  description: '',
  price: 0,
  durationDays: 30,
  maxVehicles: 10,
  maxDrivers: 5,
  maxAgencies: 2,
  maxUsers: 5,
  hasGeofencing: false,
  hasChat: false,
  targetType: 'COMPANY',
};

type TargetFilter = 'ALL' | 'COMPANY' | 'FREELANCE';

type PlansViewProps = {
  plans: NormalizedSubscriptionPlan[];
  onPlansChanged: () => void;
};

export const PlansView = ({ plans, onPlansChanged }: PlansViewProps) => {
  const [edits, setEdits] = useState<Record<string, NormalizedSubscriptionPlan>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePlanPayload>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<TargetFilter>('ALL');

  useEffect(() => {
    const next: Record<string, NormalizedSubscriptionPlan> = {};
    plans.forEach((plan) => {
      next[plan.id] = { ...plan };
    });
    setEdits(next);
  }, [plans]);

  const handleSave = async (planId: string) => {
    const plan = edits[planId];
    if (!plan) return;
    setSavingId(planId);
    setMessage('');
    const res = await adminService.updatePlan(planId, {
      name: plan.name,
      description: plan.description,
      price: plan.price,
      durationDays: plan.durationDays,
      maxVehicles: plan.maxVehicles,
      maxDrivers: plan.maxDrivers,
      maxAgencies: plan.maxAgencies,
      maxUsers: plan.maxUsers,
      hasGeofencing: plan.hasGeofencing,
      hasChat: plan.hasChat,
      targetType: plan.targetType,
    });
    setSavingId(null);
    if (res.ok) {
      setMessage(`Plan ${plan.name} mis à jour.`);
      onPlansChanged();
    } else {
      setMessage('Échec de la mise à jour du plan.');
    }
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      setMessage('Le nom du plan est obligatoire.');
      return;
    }
    setCreating(true);
    setMessage('');
    const res = await adminService.createPlan(createForm);
    setCreating(false);
    if (res.ok) {
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      setMessage(`Plan ${createForm.name} créé.`);
      onPlansChanged();
    } else {
      setMessage('Échec de la création du plan (nom déjà utilisé ?).');
    }
  };

  const updateField = (planId: string, field: keyof NormalizedSubscriptionPlan, value: string | number | boolean) => {
    setEdits((prev) => {
      const next = { ...prev[planId], [field]: value };
      // Freelance: force 1 agence et 1 utilisateur
      if (field === 'targetType' && value === 'FREELANCE') {
        next.maxAgencies = 1;
        next.maxUsers = 1;
      }
      return { ...prev, [planId]: next };
    });
  };

  const visiblePlans = plans.filter((p) => filter === 'ALL' || p.targetType === filter);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
          Tarifs, quotas et fonctionnalités des offres SaaS
        </p>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0528d6] text-white rounded-xl text-xs font-black uppercase italic tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          <Plus size={14} /> Nouveau plan
        </button>
      </div>

      {/* Filtres par type */}
      <div className="flex gap-2">
        {(['ALL', 'COMPANY', 'FREELANCE'] as TargetFilter[]).map((f) => {
          const label = f === 'ALL' ? 'Tous' : f === 'COMPANY' ? 'Entreprises' : 'Freelances';
          const count = f === 'ALL' ? plans.length : plans.filter((p) => p.targetType === f).length;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase italic tracking-widest transition-all border ${
                filter === f
                  ? 'bg-[#0528d6] text-white border-[#0528d6] shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-[#0528d6]'
              }`}
            >
              {label} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {message && (
        <p className="text-xs font-bold text-[#0528d6] bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">{message}</p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {visiblePlans.map((plan) => {
          const edit = edits[plan.id] ?? plan;
          return (
            <div
              key={plan.id}
              className="bg-white dark:bg-[#1a1d2d] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white italic">{plan.name}</h3>
                  <span
                    className={`text-[9px] font-black uppercase italic tracking-widest px-2 py-1 rounded-full border ${
                      edit.targetType === 'FREELANCE'
                        ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/30'
                        : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30'
                    }`}
                  >
                    {edit.targetType === 'FREELANCE' ? 'Freelance' : 'Entreprise'}
                  </span>
                  {edit.durationDays >= 360 && edit.price > 0 && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      ≈ {Math.round(edit.price / 12).toLocaleString()} XAF/mois (annuel)
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleSave(plan.id)}
                  disabled={savingId === plan.id}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase italic text-[#0528d6] border border-blue-100 dark:border-blue-900/40 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
                >
                  {savingId === plan.id ? <Loader2 className="animate-spin size-3" /> : <Save size={14} />}
                  Enregistrer
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <Field label="Nom" value={edit.name} onChange={(v) => updateField(plan.id, 'name', v)} />
                <TypeSelect
                  value={edit.targetType}
                  onChange={(v) => updateField(plan.id, 'targetType', v)}
                />
                <Field label="Prix (XAF)" type="number" value={edit.price} onChange={(v) => updateField(plan.id, 'price', Number(v))} />
                <Field label="Durée (jours)" type="number" value={edit.durationDays} onChange={(v) => updateField(plan.id, 'durationDays', Number(v))} />
                {edit.targetType !== 'FREELANCE' && (
                  <Field label="Max agences" type="number" value={edit.maxAgencies} onChange={(v) => updateField(plan.id, 'maxAgencies', Number(v))} />
                )}
                <Field label="Max véhicules" type="number" value={edit.maxVehicles} onChange={(v) => updateField(plan.id, 'maxVehicles', Number(v))} />
                <Field label="Max chauffeurs" type="number" value={edit.maxDrivers} onChange={(v) => updateField(plan.id, 'maxDrivers', Number(v))} />
                {edit.targetType !== 'FREELANCE' && (
                  <Field label="Max utilisateurs" type="number" value={edit.maxUsers} onChange={(v) => updateField(plan.id, 'maxUsers', Number(v))} />
                )}
                {edit.targetType === 'FREELANCE' && (
                  <div className="col-span-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-[10px] text-orange-600 dark:text-orange-300 font-bold italic">
                    Un plan Freelance est limité à 1 agence et 1 utilisateur — ces champs sont figés.
                  </div>
                )}
                <label className="flex items-center gap-2 col-span-2 text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={edit.hasGeofencing}
                    onChange={(e) => updateField(plan.id, 'hasGeofencing', e.target.checked)}
                  />
                  Géofencing
                </label>
                <label className="flex items-center gap-2 col-span-2 text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={edit.hasChat}
                    onChange={(e) => updateField(plan.id, 'hasChat', e.target.checked)}
                  />
                  Chat support
                </label>
              </div>
              <textarea
                value={edit.description}
                onChange={(e) => updateField(plan.id, 'description', e.target.value)}
                rows={2}
                placeholder="Description"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>
          );
        })}
      </div>

      {showCreate && (
        <Portal>
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCreate(false)} />
            <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Créer un plan</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Field label="Nom *" value={createForm.name} onChange={(v) => setCreateForm({ ...createForm, name: v })} />
                <TypeSelect
                  value={createForm.targetType ?? 'COMPANY'}
                  onChange={(v) => setCreateForm({
                    ...createForm,
                    targetType: v,
                    // Freelance: 1 agence + 1 utilisateur forcés
                    ...(v === 'FREELANCE' ? { maxAgencies: 1, maxUsers: 1 } : {}),
                  })}
                />
                <Field label="Prix (XAF)" type="number" value={createForm.price} onChange={(v) => setCreateForm({ ...createForm, price: Number(v) })} />
                <Field label="Durée (jours)" type="number" value={createForm.durationDays} onChange={(v) => setCreateForm({ ...createForm, durationDays: Number(v) })} />
                {createForm.targetType !== 'FREELANCE' && (
                  <Field label="Max agences" type="number" value={createForm.maxAgencies ?? 0} onChange={(v) => setCreateForm({ ...createForm, maxAgencies: Number(v) })} />
                )}
                <Field label="Max véhicules" type="number" value={createForm.maxVehicles ?? 0} onChange={(v) => setCreateForm({ ...createForm, maxVehicles: Number(v) })} />
                <Field label="Max chauffeurs" type="number" value={createForm.maxDrivers ?? 0} onChange={(v) => setCreateForm({ ...createForm, maxDrivers: Number(v) })} />
                {createForm.targetType !== 'FREELANCE' && (
                  <Field label="Max utilisateurs" type="number" value={createForm.maxUsers ?? 0} onChange={(v) => setCreateForm({ ...createForm, maxUsers: Number(v) })} />
                )}
                {createForm.targetType === 'FREELANCE' && (
                  <div className="col-span-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-[10px] text-orange-600 dark:text-orange-300 font-bold italic">
                    Un plan Freelance est limité à 1 agence et 1 utilisateur — ces champs sont figés à 1.
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={createForm.hasGeofencing ?? false} onChange={(e) => setCreateForm({ ...createForm, hasGeofencing: e.target.checked })} />
                  Géofencing
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={createForm.hasChat ?? false} onChange={(e) => setCreateForm({ ...createForm, hasChat: e.target.checked })} />
                  Chat support
                </label>
              </div>
              <textarea
                value={createForm.description ?? ''}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={2}
                placeholder="Description"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 py-3.5 bg-[#0528d6] text-white rounded-xl font-black text-xs uppercase italic tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                >
                  {creating ? <Loader2 className="animate-spin size-4" /> : 'Créer'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-3 text-xs font-bold text-slate-400">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </section>
  );
};

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:border-[#0528d6]"
      />
    </label>
  );
}

function TypeSelect({
  value,
  onChange,
}: {
  value: 'COMPANY' | 'FREELANCE';
  onChange: (value: 'COMPANY' | 'FREELANCE') => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Type</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as 'COMPANY' | 'FREELANCE')}
        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:border-[#0528d6] text-xs font-bold"
      >
        <option value="COMPANY">Entreprise</option>
        <option value="FREELANCE">Freelance</option>
      </select>
    </label>
  );
}

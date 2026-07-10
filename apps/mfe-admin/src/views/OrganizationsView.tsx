'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { adminService } from '@pwa-easy-rental/shared-services';
import type { NormalizedSubscriptionPlan } from '@pwa-easy-rental/shared-services';

type OrgRow = {
  id: string;
  name: string;
  email: string;
  subscriptionPlanId: string;
  subscriptionExpiresAt: string | null;
  currentAgencies: number;
  currentVehicles: number;
  governanceStatus: string;
};

function normalizeOrg(raw: Record<string, unknown>): OrgRow {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? '—'),
    email: String(raw.email ?? '—'),
    subscriptionPlanId: String(raw.subscriptionPlanId ?? raw.subscription_plan_id ?? ''),
    subscriptionExpiresAt: (raw.subscriptionExpiresAt ?? raw.subscription_expires_at ?? null) as string | null,
    currentAgencies: Number(raw.currentAgencies ?? raw.current_agencies ?? 0),
    currentVehicles: Number(raw.currentVehicles ?? raw.current_vehicles ?? 0),
    governanceStatus: String(raw.governanceStatus ?? raw.governance_status ?? 'APPROVED'),
  };
}

type OrganizationsViewProps = {
  plans: NormalizedSubscriptionPlan[];
  onDataChanged?: () => void;
};

export const OrganizationsView = ({ plans, onDataChanged }: OrganizationsViewProps) => {
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const planById = useMemo(
    () => new Map(plans.map((plan) => [plan.id, plan])),
    [plans],
  );

  const loadOrgs = async () => {
    setLoading(true);
    setError('');
    const res = await adminService.getAllOrganizations();
    if (res.ok && Array.isArray(res.data)) {
      setOrgs(res.data.map((row) => normalizeOrg(row as Record<string, unknown>)));
    } else {
      setError('Impossible de charger les organisations.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const handleAssignPlan = async (orgId: string, planName: string) => {
    if (!planName) return;
    setAssigningId(orgId);
    const res = await adminService.assignPlan(orgId, planName);
    if (!res.ok) {
      setError('Échec de l\'assignation du plan.');
    } else {
      await loadOrgs();
      onDataChanged?.();
    }
    setAssigningId(null);
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0528d6] size-8" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
          Gérez les organisations partenaires et leurs abonnements
        </p>
        <button
          type="button"
          onClick={loadOrgs}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-[#0528d6] hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
        >
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {error && (
        <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1d2d] shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-400">
            <tr>
              <th className="p-4">Organisation</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Quotas</th>
              <th className="p-4">Gouvernance</th>
              <th className="p-4">Assigner plan</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => {
              const plan = planById.get(org.subscriptionPlanId);
              return (
                <tr key={org.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <p className="font-bold text-slate-800 dark:text-white">{org.name}</p>
                    <p className="text-xs text-slate-400">{org.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-[#0528d6] italic">{plan?.name ?? '—'}</span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {org.subscriptionExpiresAt
                        ? `Expire ${new Date(org.subscriptionExpiresAt).toLocaleDateString('fr-FR')}`
                        : 'Illimité'}
                    </p>
                  </td>
                  <td className="p-4 font-mono text-xs">
                    <p>Agences {org.currentAgencies}/{plan?.maxAgencies ?? '—'}</p>
                    <p>Véhicules {org.currentVehicles}/{plan?.maxVehicles ?? '—'}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                      {org.governanceStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      disabled={assigningId === org.id}
                      defaultValue=""
                      onChange={(e) => handleAssignPlan(org.id, e.target.value)}
                      className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"
                    >
                      <option value="">Changer…</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
            {orgs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                  Aucune organisation enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

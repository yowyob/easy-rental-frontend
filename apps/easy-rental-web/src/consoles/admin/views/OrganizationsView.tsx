'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, CheckCircle2, XCircle, ShieldAlert, Ban, PlayCircle } from 'lucide-react';
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
  accountType: string;
  status: string;
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
    accountType: String(raw.accountType ?? raw.account_type ?? 'COMPANY').toUpperCase(),
    status: String(raw.status ?? raw.STATUS ?? 'ACTIVE').toUpperCase(),
  };
}

type FilterTab = 'ALL' | 'COMPANY' | 'FREELANCE';

type OrganizationsViewProps = {
  plans: NormalizedSubscriptionPlan[];
  onDataChanged?: () => void;
};

export const OrganizationsView = ({ plans, onDataChanged }: OrganizationsViewProps) => {
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [governanceId, setGovernanceId] = useState<string | null>(null);
  const [suspensionId, setSuspensionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');

  const filteredOrgs = useMemo(() => {
    if (filterTab === 'ALL') return orgs;
    return orgs.filter((o) => o.accountType === filterTab);
  }, [orgs, filterTab]);

  const pendingOrgs = useMemo(
    () => filteredOrgs.filter((o) => o.governanceStatus === 'PENDING_APPROVAL'),
    [filteredOrgs],
  );

  const counts = useMemo(() => ({
    all: orgs.length,
    company: orgs.filter((o) => o.accountType === 'COMPANY').length,
    freelance: orgs.filter((o) => o.accountType === 'FREELANCE').length,
  }), [orgs]);

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

  const handleGovernance = async (orgId: string, approve: boolean) => {
    setGovernanceId(orgId);
    setError('');
    setMessage('');
    const res = approve
      ? await adminService.approveOrganization(orgId)
      : await adminService.rejectOrganization(orgId);
    if (!res.ok) {
      setError(approve ? "Échec de l'approbation." : 'Échec du rejet.');
    } else {
      setMessage(approve ? 'Organisation approuvée.' : 'Organisation rejetée.');
      await loadOrgs();
      onDataChanged?.();
    }
    setGovernanceId(null);
  };

  const handleSuspension = async (orgId: string, suspend: boolean) => {
    let reason = '';
    if (suspend) {
      const input = window.prompt('Motif de la suspension :');
      if (!input) return;
      reason = input;
    }
    setSuspensionId(orgId);
    setError('');
    setMessage('');
    const res = suspend
      ? await adminService.suspendOrganization(orgId, reason)
      : await adminService.reactivateOrganization(orgId);
    if (!res.ok) {
      setError(suspend ? "Échec de la suspension." : 'Échec de la réactivation.');
    } else {
      setMessage(suspend ? 'Organisation suspendue.' : 'Organisation réactivée.');
      await loadOrgs();
      onDataChanged?.();
    }
    setSuspensionId(null);
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
      {message && (
        <p className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/30 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
          {message}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {([
          { key: 'ALL' as FilterTab,       label: 'Toutes',    count: counts.all },
          { key: 'COMPANY' as FilterTab,   label: 'Sociétés',  count: counts.company },
          { key: 'FREELANCE' as FilterTab, label: 'Freelances', count: counts.freelance },
        ]).map((tab) => {
          const active = filterTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black italic uppercase tracking-widest transition-all ${
                active
                  ? 'bg-[#0528d6] text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-[#0528d6]'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[9px] ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {pendingOrgs.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black italic tracking-tighter text-orange-900 dark:text-orange-100">
                {pendingOrgs.length} demande{pendingOrgs.length > 1 ? 's' : ''} d&apos;approbation
              </h3>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest italic">
                Ces organisations attendent votre validation pour accéder à leur console
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {pendingOrgs.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between bg-white dark:bg-[#1a1d2d] rounded-2xl px-4 py-3 border border-orange-100 dark:border-orange-500/20"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{org.name}</p>
                  <p className="text-[10px] text-slate-400 italic truncate">{org.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={governanceId === org.id}
                    onClick={() => handleGovernance(org.id, false)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase italic tracking-widest text-red-500 border border-red-200 dark:border-red-500/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
                  >
                    <XCircle size={14} /> Rejeter
                  </button>
                  <button
                    type="button"
                    disabled={governanceId === org.id}
                    onClick={() => handleGovernance(org.id, true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase italic tracking-widest text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
                  >
                    {governanceId === org.id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    Approuver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
              <th className="p-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrgs.map((org) => {
              const plan = planById.get(org.subscriptionPlanId);
              return (
                <tr key={org.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 dark:text-white">{org.name}</p>
                      {org.accountType === 'FREELANCE' && (
                        <span className="text-[9px] font-black italic uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/30">
                          Freelance
                        </span>
                      )}
                    </div>
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
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
                        org.governanceStatus === 'APPROVED'
                          ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:border-green-500/30'
                          : org.governanceStatus === 'PENDING_APPROVAL'
                          ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/30'
                          : org.governanceStatus === 'REJECTED'
                          ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/30'
                          : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
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
                  <td className="p-4">
                    {org.status === 'SUSPENDED' ? (
                      <button
                        type="button"
                        disabled={suspensionId === org.id}
                        onClick={() => handleSuspension(org.id, false)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase italic tracking-widest text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
                      >
                        {suspensionId === org.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <PlayCircle size={14} />
                        )}
                        Réactiver
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={suspensionId === org.id}
                        onClick={() => handleSuspension(org.id, true)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase italic tracking-widest text-red-500 border border-red-200 dark:border-red-500/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
                      >
                        {suspensionId === org.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Ban size={14} />
                        )}
                        Suspendre
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredOrgs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 italic">
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

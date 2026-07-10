'use client';
import React from 'react';
import { AlertTriangle } from 'lucide-react';

type GovernanceBannerProps = {
  orgData: any;
  /** When true, companion components should disable mutating actions. */
  onBlockedChange?: (blocked: boolean) => void;
};

export function isOrgGovernanceBlocked(orgData: any): boolean {
  const status = orgData?.governanceStatus ?? orgData?.governance_status;
  return Boolean(status && status !== 'APPROVED');
}

export const GovernanceBanner = ({ orgData }: GovernanceBannerProps) => {
  const status = orgData?.governanceStatus ?? orgData?.governance_status;
  if (!status || status === 'APPROVED') {
    return null;
  }

  const messages: Record<string, string> = {
    PENDING_APPROVAL:
      'Votre organisation est en attente d\'approbation. Création d\'agences, staff et véhicules bloquée jusqu\'à APPROVED.',
    SUSPENDED: 'Votre organisation est suspendue. Contactez le support — les actions métier sont bloquées.',
  };

  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
      <AlertTriangle className="mt-0.5 shrink-0" size={20} />
      <div>
        <p className="text-xs font-black uppercase tracking-widest italic">Gouvernance</p>
        <p className="text-sm font-medium">{messages[status] || `Statut : ${status}`}</p>
      </div>
    </div>
  );
};

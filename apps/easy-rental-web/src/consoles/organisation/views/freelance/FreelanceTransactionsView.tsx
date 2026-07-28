/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { TransactionsView } from '../../../agency/views/TransactionsView';

/**
 * Wrapper freelance : réutilise la vue Transactions de la console agence,
 * en la pointant vers l'agence unique auto-créée pour ce freelance.
 */
export const FreelanceTransactionsView = ({ agencyId, organizationId, userData, t, ...rest }: any) => {
  if (!agencyId) {
    return <div className="p-6 text-slate-400 italic">Agence en cours de chargement…</div>;
  }

  const agencyUserData = {
    ...userData,
    agencyId,
    organizationId: organizationId ?? userData?.organizationId,
  };

  return <TransactionsView userData={agencyUserData} t={t} {...rest} />;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { ReservationsView } from '../../../agency/views/ReservationsView';

/**
 * Wrapper freelance : réutilise la vue Réservations de la console agence,
 * en la pointant vers l'agence unique auto-créée pour ce freelance.
 */
export const FreelanceReservationsView = ({ agencyId, organizationId, userData, t, ...rest }: any) => {
  if (!agencyId) {
    return <div className="p-6 text-slate-400 italic">Agence en cours de chargement…</div>;
  }

  const agencyUserData = {
    ...userData,
    agencyId,
    organizationId: organizationId ?? userData?.organizationId,
  };

  return <ReservationsView userData={agencyUserData} staffPermissions={[]} t={t} {...rest} />;
};

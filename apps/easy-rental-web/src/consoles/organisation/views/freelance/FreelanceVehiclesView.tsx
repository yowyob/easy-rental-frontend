/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { VehiclesView } from '../../../agency/views/VehiclesView';

/**
 * Wrapper freelance : réutilise la vue Véhicules de la console agence,
 * en la pointant vers l'agence unique auto-créée pour ce freelance.
 * Un freelance étant propriétaire de son agence, tous les contrôles de
 * permission internes à `VehiclesView` (basés sur le rôle ORGANIZATION)
 * passent automatiquement.
 */
export const FreelanceVehiclesView = ({ agencyId, organizationId, userData, t, ...rest }: any) => {
  if (!agencyId) {
    return <div className="p-6 text-slate-400 italic">Agence en cours de chargement…</div>;
  }

  const agencyUserData = {
    ...userData,
    agencyId,
    organizationId: organizationId ?? userData?.organizationId,
  };

  return <VehiclesView userData={agencyUserData} staffPermissions={[]} t={t} {...rest} />;
};

import { defaultClient as client } from './api-client';
import {
  formatRentalApiError,
  normalizeRentalDetails,
  normalizeRentalInitResponse,
  normalizeRentalList,
  normalizeRentalRecord,
  toApiAgencyRentalPayload,
  toApiPaymentPayload,
  toApiRentalInitPayload,
} from './rental.mapper';

/** Convertit le payload inspection en snake_case (Jackson backend). */
function toApiInspection(
  type: 'CHECK_IN' | 'CHECK_OUT',
  insp: {
    odometer?: number | null;
    fuelLevel?: number | null;
    notes?: string | null;
    photoUrls: string[];
    items?: Array<{ itemCode: string; status: string; note?: string | null }> | null;
  },
) {
  return {
    type,
    odometer: insp.odometer ?? null,
    fuel_level: insp.fuelLevel ?? null,
    notes: insp.notes ?? null,
    photo_urls: insp.photoUrls,
    items: insp.items
      ? insp.items.map((it) => ({ item_code: it.itemCode, status: it.status, note: it.note ?? null }))
      : null,
  };
}

export const rentalService = {
  initiateRental: async (data: Record<string, unknown>) => {
    const res = await client.post<Record<string, unknown>>(
      '/api/rentals/init',
      toApiRentalInitPayload(data)
    );
    if (!res.ok) {
      return { ...res, data: { message: formatRentalApiError(res.data) } };
    }
    return { ...res, data: normalizeRentalInitResponse(res.data) };
  },

  createAgencyRental: async (agencyId: string, data: Record<string, unknown>) => {
    const res = await client.post<Record<string, unknown>>(
      `/api/rentals/agency/${agencyId}/create`,
      toApiAgencyRentalPayload(data)
    );
    if (!res.ok) {
      return { ...res, data: { message: formatRentalApiError(res.data) } };
    }
    return { ...res, data: normalizeRentalInitResponse(res.data as Record<string, unknown>) };
  },

  payRental: async (id: string, data: { amount: number; method: 'MOMO' | 'OM' | 'CARD' | 'CASH' }) => {
    const res = await client.post<any>(`/api/rentals/${id}/pay`, toApiPaymentPayload(data));
    if (!res.ok) {
      return { ...res, data: { message: formatRentalApiError(res.data, 'Paiement impossible.') } };
    }
    return res;
  },
  
  startRental: (id: string) => client.put<any>(`/api/rentals/${id}/start`, {}),// deprecated — use checkIn (R2)

  signalEnd: (id: string) => client.put<any>(`/api/rentals/${id}/end-signal`, {}),// legacy signal-end (no body)

  validateReturn: (id: string) => client.put<any>(`/api/rentals/${id}/validate-return`, {}), // legacy validate (no caution)

  cancelRental: (id: string) => client.put<any>(`/api/rentals/${id}/cancel`, {}),// For client to cancel a reservation before it starts

  // ===== R2 — cycle location complet (inspections + caution) =====

  /** Agence : check-in (remise des clés) avec inspection CHECK_IN + km départ. */
  checkIn: async (id: string, payload: {
    startOdometer?: number | null;
    inspection: {
      odometer?: number | null;
      fuelLevel?: number | null;
      notes?: string | null;
      photoUrls: string[];
      items?: Array<{ itemCode: string; status: string; note?: string | null }> | null;
    };
  }) => {
    const res = await client.post<any>(`/api/rentals/${id}/check-in`, {
      start_odometer: payload.startOdometer ?? null,
      inspection: toApiInspection('CHECK_IN', payload.inspection),
    });
    if (!res.ok) return { ...res, data: { message: formatRentalApiError(res.data, 'Check-in impossible.') } };
    return { ...res, data: normalizeRentalDetails(res.data as Record<string, unknown>) };
  },

  /** Client/Agence : signaler la fin de la location (R2, retourne le détail). */
  signalEndR2: async (id: string) => {
    const res = await client.post<any>(`/api/rentals/${id}/signal-end`, {});
    if (!res.ok) return { ...res, data: { message: formatRentalApiError(res.data, 'Signalement impossible.') } };
    return { ...res, data: normalizeRentalDetails(res.data as Record<string, unknown>) };
  },

  /** Agence : check-out (retour du véhicule) avec inspection CHECK_OUT + km retour. */
  checkOut: async (id: string, payload: {
    endOdometer?: number | null;
    inspection: {
      odometer?: number | null;
      fuelLevel?: number | null;
      notes?: string | null;
      photoUrls: string[];
      items?: Array<{ itemCode: string; status: string; note?: string | null }> | null;
    };
  }) => {
    const res = await client.post<any>(`/api/rentals/${id}/check-out`, {
      end_odometer: payload.endOdometer ?? null,
      inspection: toApiInspection('CHECK_OUT', payload.inspection),
    });
    if (!res.ok) return { ...res, data: { message: formatRentalApiError(res.data, 'Check-out impossible.') } };
    return { ...res, data: normalizeRentalDetails(res.data as Record<string, unknown>) };
  },

  /**
   * Agence : règlement du retour. On saisit le COÛT DES DOMMAGES ; le backend
   * calcule retenue = min(dommages, caution), remboursement = le reste,
   * supplément dû = max(0, dommages − caution).
   */
  settleReturn: async (id: string, payload: { damageCost: number; reason?: string | null }) => {
    const res = await client.put<any>(`/api/rentals/${id}/settle-return`, {
      damage_cost: payload.damageCost,
      reason: payload.reason ?? null,
    });
    if (!res.ok) return { ...res, data: { message: formatRentalApiError(res.data, 'Règlement impossible.') } };
    return { ...res, data: normalizeRentalDetails(res.data as Record<string, unknown>) };
  },

  /** Dette totale du client dans l'organisation de l'agence (pour l'afficher au booking). */
  getClientDebtForAgency: async (clientId: string, agencyId: string) => {
    const res = await client.get<any>(`/api/rentals/debt/client/${clientId}/agency/${agencyId}`);
    const debt = res.ok ? Number(res.data?.debt ?? 0) : 0;
    return { ok: res.ok, debt: Number.isFinite(debt) ? debt : 0 };
  },

  /** Dettes impayées d'une agence (dossiers). */
  getAgencyDebts: (agencyId: string) => client.get<any[]>(`/api/rentals/debts/agency/${agencyId}`),

  /** Dettes impayées d'une organisation (dossiers). */
  getOrganizationDebts: (orgId: string) => client.get<any[]>(`/api/rentals/debts/organization/${orgId}`),

  /** Agence : encaisser le supplément dû (créance) par le client. */
  collectSupplement: async (id: string, amount: number) => {
    const res = await client.post<any>(`/api/rentals/${id}/collect-supplement`, { amount });
    if (!res.ok) return { ...res, data: { message: formatRentalApiError(res.data, 'Encaissement impossible.') } };
    return { ...res, data: normalizeRentalDetails(res.data as Record<string, unknown>) };
  },

  getRentalDetails: async (id: string) => {
    const res = await client.get<Record<string, unknown>>(`/api/rentals/${id}/details`);
    if (res.ok && res.data && typeof res.data === 'object') {
      return { ...res, data: normalizeRentalDetails(res.data as Record<string, unknown>) };
    }
    return {
      ...res,
      ok: false,
      data: { message: 'Dossier introuvable ou véhicule associé supprimé.' },
    };
  },

  getOrgReservations: async (orgId: string) => {
    const res = await client.get<unknown[]>(`/api/rentals/org/${orgId}/reservations`);
    return res.ok ? { ...res, data: normalizeRentalList(res.data) } : res;
  },
  
  getOrgRentals: async (orgId: string) => {
    const res = await client.get<unknown[]>(`/api/rentals/org/${orgId}/rentals`);
    return res.ok ? { ...res, data: normalizeRentalList(res.data) } : res;
  },
  
  getAgencyReservations: async (agencyId: string) => {
    const res = await client.get<unknown[]>(`/api/rentals/agency/${agencyId}/reservations`);
    return res.ok ? { ...res, data: normalizeRentalList(res.data) } : res;
  },
  
  getAgencyRentals: async (agencyId: string) => {
    const res = await client.get<unknown[]>(`/api/rentals/agency/${agencyId}/rentals`);
    return res.ok ? { ...res, data: normalizeRentalList(res.data) } : res;
  },
  
  getClientActiveReservations: async () => {
    const res = await client.get<unknown[]>('/api/rentals/client/reservations/active');
    return res.ok ? { ...res, data: normalizeRentalList(res.data) } : res;
  },
  
  getClientRentalsHistory: async () => {
    const res = await client.get<unknown[]>('/api/rentals/client/rentals/history');
    return res.ok ? { ...res, data: normalizeRentalList(res.data) } : res;
  },

  getByAgency: async (agencyId: string) => {
    const res = await client.get<unknown[]>(`/api/rentals/agency/${agencyId}/rentals`);
    return res.ok ? { ...res, data: normalizeRentalList(res.data) } : res;
  },

  /** Reservations that became rentals or were cancelled — for history tab. */
  getAgencyReservationHistory: async (agencyId: string) => {
    const [resRes, rentRes] = await Promise.all([
      client.get<unknown[]>(`/api/rentals/agency/${agencyId}/reservations`),
      client.get<unknown[]>(`/api/rentals/agency/${agencyId}/rentals`),
    ]);
    const historyStatuses = new Set(['ONGOING', 'UNDER_REVIEW', 'COMPLETED', 'CANCELLED']);
    const cancelled = resRes.ok
      ? normalizeRentalList(resRes.data).filter((r) => r.status === 'CANCELLED')
      : [];
    const rentals = rentRes.ok
      ? normalizeRentalList(rentRes.data).filter((r) => historyStatuses.has(r.status))
      : [];
    const merged = [...rentals, ...cancelled];
    merged.sort((a, b) => {
      const da = new Date(a.createdAt ?? a.updatedAt ?? 0).getTime();
      const db = new Date(b.createdAt ?? b.updatedAt ?? 0).getTime();
      return db - da;
    });
    return { ok: resRes.ok || rentRes.ok, data: merged, status: resRes.status };
  },
};
import { defaultClient as client } from './api-client';
import { deepCamelize } from '../utils/camelize';

export type Position = {
  id: string;
  rentalId: string;
  vehicleId?: string | null;
  latitude: number;
  longitude: number;
  recordedAt?: string | null;
  source?: string | null;
};

export type TrackingSummary = {
  positions: Position[];
  trackedKm: number;
  source: 'GPS' | 'ODOMETER' | string;
};

export const trackingService = {
  /** Enregistre une position (client PWA ou agence). */
  recordPosition: (rentalId: string, lat: number, lng: number, source: 'CLIENT_PWA' | 'AGENCY' | 'MANUAL' = 'CLIENT_PWA') =>
    client.post<Position>(`/api/rentals/${rentalId}/positions`, {
      latitude: lat,
      longitude: lng,
      source,
    }),

  /** Résumé du tracking : positions + km + source (GPS ou ODOMETER). */
  getSummary: async (rentalId: string) => {
    const res = await client.get<any>(`/api/rentals/${rentalId}/tracking`);
    if (res.ok && res.data) return { ...res, data: deepCamelize(res.data) as TrackingSummary };
    return res;
  },
};

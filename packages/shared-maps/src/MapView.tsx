'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
}

export interface MapViewProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

/**
 * Leaflet map component for agency and vehicle locations.
 * Leaflet is loaded dynamically — it requires `window` and breaks SSR if imported at module scope.
 */
export function MapView({ markers, center, zoom = 12, className = 'h-64 w-full rounded-lg' }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let cancelled = false;

    void import('leaflet').then(({ default: L }) => {
      if (cancelled || !mapRef.current || mapInstance.current) return;

      const defaultCenter: [number, number] = center ?? [4.0511, 9.7679];
      const map = L.map(mapRef.current).setView(defaultCenter, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      markers.forEach((marker) => {
        L.marker([marker.latitude, marker.longitude])
          .addTo(map)
          .bindPopup(marker.label ?? marker.id);
      });

      mapInstance.current = map;
    });

    return () => {
      cancelled = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [markers, center, zoom]);

  return <div ref={mapRef} className={className} />;
}

export { MapView as default };

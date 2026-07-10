'use client';

import { configureApiBaseUrl, isYowyobProdHost } from '@pwa-easy-rental/shared-services';

// Local / MFE : proxy admin. Prod Yowyob : laisser /rental-api (gateway public).
if (typeof window !== 'undefined' && !isYowyobProdHost()) {
  configureApiBaseUrl('/admin/api-rental');
}

type AdminApiProviderProps = {
  children: React.ReactNode;
};

export function AdminApiProvider({ children }: AdminApiProviderProps) {
  return children;
}

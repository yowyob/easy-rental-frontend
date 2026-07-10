'use client';

import { configureApiBaseUrl } from '@pwa-easy-rental/shared-services';

// Force le proxy admin — indépendant de la détection pathname (basePath Next.js).
configureApiBaseUrl('/admin/api-rental');

type AdminApiProviderProps = {
  children: React.ReactNode;
};

export function AdminApiProvider({ children }: AdminApiProviderProps) {
  return children;
}

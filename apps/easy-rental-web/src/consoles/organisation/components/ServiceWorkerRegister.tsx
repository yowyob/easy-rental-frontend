'use client';

import { useEffect } from 'react';

/**
 * Registers the organisation PWA service worker (required for installability).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/organisation/sw.js').catch(() => undefined);
    }
  }, []);
  return null;
}

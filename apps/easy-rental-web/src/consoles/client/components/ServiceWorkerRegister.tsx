'use client';

import { useEffect } from 'react';

/**
 * Registers the PWA service worker for offline support.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/client/sw.js').catch(() => undefined);
    }
  }, []);
  return null;
}

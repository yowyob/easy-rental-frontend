'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * React hook for local-first DuckDB sync with PostgreSQL backend.
 */
export function useLocalFirst() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { syncEngine } = await import('./sync-engine');
      await syncEngine.pull();
      setLastSync(Date.now());
    } catch {
      /* offline sync optional — catalogue works via API */
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (isOnline && process.env.NEXT_PUBLIC_OFFLINE_SYNC === 'true') {
      sync().catch(() => undefined);
    }
  }, [isOnline, sync]);

  return { isOnline, isSyncing, lastSync, sync };
}

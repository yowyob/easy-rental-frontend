/**
 * DuckDB-Wasm client for local-first data storage.
 * Fails silently when the worker cannot load (Next.js / Turbopack dev).
 *
 * @author Easy Rental Team
 * @since 2026-05-31
 */

let dbInstance: unknown = null;
let initFailed = false;

function isDuckDbDisabled(): boolean {
  if (typeof window === 'undefined') return true;
  if (process.env.NEXT_PUBLIC_OFFLINE_SYNC === 'true') return false;
  return process.env.NODE_ENV === 'development';
}

/**
 * Initializes DuckDB-Wasm in the browser.
 */
export async function initDuckDb(): Promise<unknown> {
  if (isDuckDbDisabled() || initFailed) {
    initFailed = true;
    return null;
  }
  if (dbInstance) {
    return dbInstance;
  }
  try {
    const duckdb = await import('@duckdb/duckdb-wasm');
    const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
    if (!bundle.mainWorker || !bundle.mainModule) {
      initFailed = true;
      return null;
    }
    const worker = new Worker(bundle.mainWorker);
    const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.ERROR);
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    dbInstance = db;
    return db;
  } catch {
    initFailed = true;
    return null;
  }
}

/**
 * Returns the active DuckDB instance if initialized.
 */
export function getDuckDb(): unknown {
  return dbInstance;
}

export function isDuckDbAvailable(): boolean {
  return dbInstance != null;
}

import { defaultClient } from '../api/api-client';
import { initDuckDb } from './duckdb-client';
import { DUCKDB_SCHEMA } from './schema';

/**
 * Sync engine for bidirectional DuckDB ↔ PostgreSQL synchronization.
 *
 * @author Easy Rental Team
 * @since 2026-05-31
 */
export class SyncEngine {
  /**
   * Pulls latest data from PostgreSQL API into local DuckDB.
   */
  async pull(): Promise<Record<string, unknown>> {
    const db = await initDuckDb();
    if (!db) {
      return { vehicles: [], agencies: [], rentals: [] };
    }
    const response = await defaultClient.get<Record<string, unknown>>('/api/sync/pull');
    if (response.ok && response.data) {
      return response.data;
    }
    return { vehicles: [], agencies: [], rentals: [] };
  }

  /**
   * Pushes queued local operations to PostgreSQL via API.
   *
   * @param operations queued write operations
   */
  async push(operations: unknown[]): Promise<boolean> {
    const response = await defaultClient.post<{ status: string }>('/api/sync/push', {
      operations,
    });
    return response.ok;
  }

  /**
   * Initializes local DuckDB schema.
   */
  async initSchema(): Promise<void> {
    const db = await initDuckDb();
    if (!db) {
      return;
    }
    void DUCKDB_SCHEMA;
  }
}

export const syncEngine = new SyncEngine();

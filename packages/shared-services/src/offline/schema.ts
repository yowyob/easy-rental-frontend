/**
 * DuckDB schema mirroring PostgreSQL tables for offline access.
 *
 * @author Easy Rental Team
 * @since 2026-05-31
 */

export const DUCKDB_SCHEMA = `
CREATE TABLE IF NOT EXISTS vehicles (
  id VARCHAR PRIMARY KEY,
  brand VARCHAR,
  model VARCHAR,
  agency_id VARCHAR,
  price_per_day DOUBLE,
  updated_at BIGINT
);

CREATE TABLE IF NOT EXISTS agencies (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  city VARCHAR,
  latitude DOUBLE,
  longitude DOUBLE,
  updated_at BIGINT
);

CREATE TABLE IF NOT EXISTS rentals (
  id VARCHAR PRIMARY KEY,
  client_id VARCHAR,
  vehicle_id VARCHAR,
  status VARCHAR,
  updated_at BIGINT
);
`;

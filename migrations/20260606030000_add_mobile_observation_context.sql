-- Migration: add mobile observation context to observations table
-- Date: 2026-06-06
-- Scope: additive only; no DROP, DELETE, UPDATE, or ALTER of existing columns

ALTER TABLE observations ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE observations ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE observations ADD COLUMN IF NOT EXISTS accuracy_m double precision;
ALTER TABLE observations ADD COLUMN IF NOT EXISTS altitude_m double precision;
ALTER TABLE observations ADD COLUMN IF NOT EXISTS app_version text;
ALTER TABLE observations ADD COLUMN IF NOT EXISTS build_number text;
ALTER TABLE observations ADD COLUMN IF NOT EXISTS device_model text;
ALTER TABLE observations ADD COLUMN IF NOT EXISTS android_api_level integer;
ALTER TABLE observations ADD COLUMN IF NOT EXISTS validation_status text NOT NULL DEFAULT 'raw';
ALTER TABLE observations ADD COLUMN IF NOT EXISTS client_dedupe_key text;

-- Deduplication index for mobile observation batches.
-- Lock duration is negligible on a zero-row table.
-- On a live table with concurrent load, prefer the concurrent variant run outside a transaction:
--   CREATE UNIQUE INDEX CONCURRENTLY idx_observations_dedupe ON observations (node_id, client_dedupe_key) WHERE client_dedupe_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_observations_dedupe ON observations (node_id, client_dedupe_key) WHERE client_dedupe_key IS NOT NULL;

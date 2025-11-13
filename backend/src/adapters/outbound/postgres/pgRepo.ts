/**
 * Postgres repository adapter
 * - Uses `pg` Pool
 * - Exposes functions used by the core application/use-cases
 *
 * Note: ensure `process.env.DATABASE_URL` is set (e.g. postgres://user:pass@localhost:5432/fueleu)
 */

import { Pool } from 'pg';
import { Route } from '../../../core/domain/entities';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/fueleu',
  // optional: max, idleTimeoutMillis etc.
});

/* ---------- Routes ---------- */

export async function getAllRoutes(): Promise<Route[]> {
  const { rows } = await pool.query(
    `SELECT id, route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption_t, distance_km, total_emissions_t, is_baseline
     FROM routes
     ORDER BY id`
  );
  return rows.map(mapRouteRow);
}

export async function getRouteById(id: number): Promise<Route | null> {
  const { rows } = await pool.query(
    `SELECT id, route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption_t, distance_km, total_emissions_t, is_baseline
     FROM routes WHERE id = $1 LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  return mapRouteRow(rows[0]);
}

export async function getRouteByRouteId(routeId: string): Promise<Route | null> {
  const { rows } = await pool.query(
    `SELECT id, route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption_t, distance_km, total_emissions_t, is_baseline
     FROM routes WHERE route_id = $1 LIMIT 1`,
    [routeId]
  );
  if (!rows[0]) return null;
  return mapRouteRow(rows[0]);
}

function mapRouteRow(r: any): Route {
  return {
    id: r.id,
    routeId: r.route_id,
    vesselType: r.vessel_type,
    fuelType: r.fuel_type,
    year: Number(r.year),
    ghgIntensity: Number(r.ghg_intensity),
    fuelConsumptionT: Number(r.fuel_consumption_t),
    distanceKm: Number(r.distance_km),
    totalEmissionsT: Number(r.total_emissions_t),
    isBaseline: !!r.is_baseline,
  };
}

/* Set baseline: turn off all is_baseline, set selected */
export async function setBaseline(routeIdNumeric: number): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`UPDATE routes SET is_baseline = false WHERE is_baseline = true`);
    await client.query(`UPDATE routes SET is_baseline = true WHERE id = $1`, [routeIdNumeric]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function getBaseline(): Promise<Route | null> {
  const { rows } = await pool.query(
    `SELECT id, route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption_t, distance_km, total_emissions_t, is_baseline
     FROM routes WHERE is_baseline = true LIMIT 1`
  );
  if (!rows[0]) return null;
  return mapRouteRow(rows[0]);
}

/* ---------- Bank entries ---------- */
/**
 * bank_entries:
 *   id SERIAL
 *   ship_id TEXT
 *   year INTEGER
 *   amount_t NUMERIC  -- tonnes CO2e
 *   created_at TIMESTAMP
 */

export type BankEntryRow = {
  id: number;
  shipId: string;
  year: number;
  amountT: number;
  createdAt: string;
};

export async function insertBankEntry(shipId: string, year: number, amountT: number): Promise<BankEntryRow> {
  const { rows } = await pool.query(
    `INSERT INTO bank_entries (ship_id, year, amount_t, created_at)
     VALUES ($1, $2, $3, now())
     RETURNING id, ship_id, year, amount_t, created_at`,
    [shipId, year, amountT]
  );
  const r = rows[0];
  return {
    id: r.id,
    shipId: r.ship_id,
    year: Number(r.year),
    amountT: Number(r.amount_t),
    createdAt: r.created_at,
  };
}

export async function getBankEntries(shipId?: string, year?: number): Promise<BankEntryRow[]> {
  const params: any[] = [];
  let where: string[] = [];
  if (shipId) {
    params.push(shipId);
    where.push(`ship_id = $${params.length}`);
  }
  if (year !== undefined) {
    params.push(year);
    where.push(`year = $${params.length}`);
  }
  const q = `
    SELECT id, ship_id, year, amount_t, created_at
    FROM bank_entries
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(q, params);
  return rows.map((r: any) => ({
    id: r.id,
    shipId: r.ship_id,
    year: Number(r.year),
    amountT: Number(r.amount_t),
    createdAt: r.created_at,
  }));
}

/* Get available bank total for a ship/year (sum of amount_t) */
export async function getAvailableBank(shipId: string, year: number): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(amount_t), 0) as total
     FROM bank_entries
     WHERE ship_id = $1 AND year = $2`,
    [shipId, year]
  );
  return Number(rows[0].total);
}

/* ---------- Pools ---------- */
/*
 pools:
  id SERIAL
  year INTEGER
  created_at TIMESTAMP
 pool_members:
  id SERIAL
  pool_id INTEGER REFERENCES pools(id)
  ship_id TEXT
  cb_before NUMERIC
  cb_after NUMERIC
*/

export async function createPoolRecord(year: number, members: { shipId: string; cbBefore: number; cbAfter: number }[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO pools (year, created_at) VALUES ($1, now()) RETURNING id, year, created_at`,
      [year]
    );
    const poolId = rows[0].id;
    const insertPromises = members.map((m) =>
      client.query(
        `INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after) VALUES ($1, $2, $3, $4)`,
        [poolId, m.shipId, m.cbBefore, m.cbAfter]
      )
    );
    await Promise.all(insertPromises);
    await client.query('COMMIT');
    return { poolId, year };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/* ---------- Simple helper for close pool connection (optional) ---------- */
export async function shutdown(): Promise<void> {
  await pool.end();
}

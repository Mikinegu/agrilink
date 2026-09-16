import { Pool, PoolClient } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import * as fs from 'fs';
import * as path from 'path';

export interface SqlQueryClient {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
}

declare global {
  var _salvagePgPool: Pool | undefined;
  var _salvagePglite: PGlite | undefined;
  var _salvageDbInitialized: boolean | undefined;
}

const remoteDbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

let isRemoteActive = false;

function getPool(): Pool | null {
  if (global._salvagePgPool) return global._salvagePgPool;
  if (remoteDbUrl) {
    try {
      global._salvagePgPool = new Pool({
        connectionString: remoteDbUrl,
        ssl: { rejectUnauthorized: false },
        max: 15,
        connectionTimeoutMillis: 8000,
      });
      return global._salvagePgPool;
    } catch (err) {
      console.warn('[SalvageDB] Notice initializing remote Postgres pool:', err);
    }
  }
  return null;
}

async function getPglite(): Promise<PGlite> {
  if (!global._salvagePglite) {
    global._salvagePglite = new PGlite('memory://');
    await global._salvagePglite.waitReady;
  }
  return global._salvagePglite;
}

/**
 * Execute raw SQL query returning typed rows array.
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const pool = getPool();
  if (pool) {
    try {
      const res = await pool.query(sql, params);
      isRemoteActive = true;
      return res.rows as T[];
    } catch (err: any) {
      // If remote connection failed, fallback to embedded engine
      if (!isRemoteActive) {
        // fallback
      } else {
        throw err;
      }
    }
  }

  const pglite = await getPglite();
  const res = await pglite.query(sql, params);
  return (res.rows || []) as T[];
}

/**
 * Execute atomic transaction with strict BEGIN / COMMIT / ROLLBACK semantics.
 */
export async function transaction<T>(
  callback: (tx: SqlQueryClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  if (pool) {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const txClient: SqlQueryClient = {
        query: async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
          const r = await client!.query(sql, params);
          return (r.rows || []) as T[];
        },
      };
      const result = await callback(txClient);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      if (client) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackErr) {
          console.error('[SalvageDB] Rollback error:', rollbackErr);
        }
      }
      throw err;
    } finally {
      if (client) client.release();
    }
  }

  // Embedded PostgreSQL (PGlite) transaction
  const pglite = await getPglite();
  return await pglite.transaction(async (tx) => {
    const txClient: SqlQueryClient = {
      query: async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
        const r = await tx.query(sql, params);
        return (r.rows || []) as T[];
      },
    };
    return await callback(txClient);
  });
}

/**
 * Executes migration and seeds initial Ethiopian distressed batches
 */
export async function initSalvageDatabase(): Promise<void> {
  if (global._salvageDbInitialized) return;
  global._salvageDbInitialized = true;

  try {
    const migrationPath = path.join(process.cwd(), 'scripts', 'migrate-salvage-schema.sql');
    let sql = '';
    if (fs.existsSync(migrationPath)) {
      sql = fs.readFileSync(migrationPath, 'utf8');
    }

    if (sql) {
      // Execute migration script
      const pool = getPool();
      if (pool) {
        try {
          await pool.query(sql);
          console.log('[SalvageDB] Remote PostgreSQL schema migration verified.');
          isRemoteActive = true;
          return;
        } catch (remoteErr: any) {
          console.warn('[SalvageDB] Remote DB query notice, using embedded Postgres engine:', remoteErr?.message);
        }
      }

      const pglite = await getPglite();
      await pglite.exec(sql);
      console.log('[SalvageDB] Embedded PostgreSQL engine initialized with relational schema & enums.');
    }

    // Seed default lots if empty
    const existing = await query('SELECT COUNT(*) as cnt FROM salvage_crop_lots');
    if (Number(existing[0]?.cnt) === 0) {
      console.log('[SalvageDB] Seeding baseline Ethiopian distressed harvest lots...');
      const now = Date.now();
      await query(
        `INSERT INTO salvage_crop_lots (
          farmer_id, commodity_name, target_industry, total_weight_kg, benchmark_price_per_kg,
          defect_type, defect_severity_pct, brix_level, moisture_pct, status, harvest_timestamp,
          degradation_deadline, origin_packhouse, image_url, notes
        ) VALUES
        (1, 'Roma Processing Paste Tomatoes', 'Ketchup & Paste', 18000, 85.00, 'HAIL_IMPACT', 35.00, 5.40, 93.00, 'ACTIVE_LISTED', NOW() - INTERVAL '12 hours', NOW() + INTERVAL '36 hours', 'Wonji Central Sorting Packhouse', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', 'Hail storm at ripening. 35% superficial scuffing. High solids ideal for paste.'),
        (1, 'San Marzano Canning Tomatoes', 'Ketchup & Paste', 24000, 90.00, 'TRANSIT_BRUISING', 25.00, 6.20, 91.00, 'ACTIVE_LISTED', NOW() - INTERVAL '6 hours', NOW() + INTERVAL '48 hours', 'Ziway Central Greenhouse Depot', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=600&q=80', 'Transit vibration impact. High pectin density.'),
        (1, 'Valencia Industrial Juice Oranges', 'Citrus Juice Concentrate', 12000, 65.00, 'SUNSCALD', 30.00, 11.20, 86.00, 'ACTIVE_LISTED', NOW() - INTERVAL '24 hours', NOW() + INTERVAL '72 hours', 'Awash Valley Citrus Packhouse', 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80', 'Sunscald on outer canopy. Excellent Brix-to-acid ratio for bulk FCOJ.')`
      );
      console.log('[SalvageDB] Baseline lots seeded successfully.');
    }
  } catch (err: any) {
    console.error('[SalvageDB] Initialization error:', err?.message || err);
  }
}

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const SUPABASE_URL  = process.env.SUPABASE_URL  || 'https://hkhlizasbjkdvbrcbakl.supabase.co';
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhraGxpemFzYmprZHZicmNiYWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE2MTIzMSwiZXhwIjoyMTAzNzM3MjMxfQ.Z8YMIyVRkUzB-tBeq2MCs2tRATmE1lURL6IUmh-yVBE';

// Direct Postgres connection (Supabase pooler URL or transaction pooler)
// Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
const DB_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations');

const G = '\x1b[32m'; const R = '\x1b[31m'; const Y = '\x1b[33m';
const B = '\x1b[34m'; const W = '\x1b[37m'; const X = '\x1b[0m';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyTables() {
  console.log(`\n${B}── Supabase REST Table Verification ─────────────────────${X}`);
  const tables = [
    'core_users', 'core_orders', 'escrow_ledger', 'logistics',
    'users', 'products', 'orders', 'user_surveys', 'platform_settings',
  ];
  for (const t of tables) {
    const { error, count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) console.log(`  ${R}✗${X} ${t.padEnd(25)} ${Y}${error.message}${X}`);
    else       console.log(`  ${G}✓${X} ${t.padEnd(25)} rows: ${count ?? 0}`);
  }
}

async function applyViaPg(pool: Pool) {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  const client = await pool.connect();

  try {
    for (const file of files) {
      console.log(`\n${B}▶ Applying: ${file}${X}`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      try {
        await client.query(sql);
        console.log(`  ${G}✓ Migration applied successfully${X}`);
      } catch (err: any) {
        if (
          err.message.includes('already exists') ||
          err.code === '42P07' || err.code === '42710'
        ) {
          console.log(`  ${Y}↷ Already exists — skipped${X}`);
        } else {
          console.log(`  ${R}✗ Error: ${err.message}${X}`);
          console.log(`\n  ${Y}► Run SQL manually in Supabase SQL Editor:${X}`);
          console.log(`  ${B}https://supabase.com/dashboard/project/hkhlizasbjkdvbrcbakl/sql/new${X}`);
        }
      }
    }
  } finally {
    client.release();
  }
}

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log(`${G}  AgriLink Supabase Migration Runner${X}`);
  console.log(`  Project: ${SUPABASE_URL}`);
  console.log('═'.repeat(60));

  // 1. Verify auth
  try {
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) console.warn(`${Y}Auth warning: ${error.message}${X}`);
    else       console.log(`${G}✓ Service Role authenticated${X}`);
  } catch (e: any) {
    console.warn(`${Y}Auth check: ${e.message}${X}`);
  }

  // 2. Try direct pg connection
  if (DB_URL) {
    console.log(`\n${G}✓ DATABASE_URL found — applying via direct pg connection${X}`);
    const pool = new Pool({
      connectionString: DB_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    try {
      const test = await pool.query('SELECT NOW()');
      console.log(`${G}✓ PostgreSQL connected: ${test.rows[0].now}${X}`);
      await applyViaPg(pool);
      await pool.end();
    } catch (err: any) {
      console.log(`${R}✗ PG connection failed: ${err.message}${X}`);
      printManualInstructions();
    }
  } else {
    console.log(`\n${Y}DATABASE_URL not set — cannot run DDL via pg driver.${X}`);
    printManualInstructions();
  }

  // 3. Verify tables via REST
  await verifyTables();

  console.log('\n' + '═'.repeat(60));
  console.log(`${G}  Done.${X}`);
  console.log('═'.repeat(60) + '\n');
}

function printManualInstructions() {
  const sqlFile = path.join(MIGRATIONS_DIR, '20260901000000_core_escrow_schema.sql');
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${Y}  MANUAL SETUP REQUIRED${X}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`  1. Open the Supabase SQL Editor:`);
  console.log(`     ${B}https://supabase.com/dashboard/project/hkhlizasbjkdvbrcbakl/sql/new${X}`);
  console.log(`  2. Copy and paste the contents of:`);
  console.log(`     ${B}${sqlFile}${X}`);
  console.log(`  3. Click "Run" — all statements are idempotent (safe to re-run)`);
  console.log(`\n  OR add DATABASE_URL to your .env:`);
  console.log(`     ${B}DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres${X}`);
  console.log(`${'─'.repeat(60)}\n`);
}

main().catch(console.error);
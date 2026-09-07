import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hkhlizasbjkdvbrcbakl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhraGxpemFzYmprZHZicmNiYWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE2MTIzMSwiZXhwIjoyMTAzNzM3MjMxfQ.Z8YMIyVRkUzB-tBeq2MCs2tRATmE1lURL6IUmh-yVBE';

async function checkAllConnections() {
  console.log('====================================================');
  console.log('       AGRILINK DATABASE CONNECTION DIAGNOSTIC       ');
  console.log('====================================================');
  console.log(`[Config] Supabase Project URL: ${SUPABASE_URL}`);
  console.log(`[Config] Service Key Length: ${SUPABASE_KEY.length} chars (starts with ${SUPABASE_KEY.substring(0, 15)}...)`);

  // 1. Check Supabase REST & Auth API
  console.log('\n--- 1. Testing Supabase Service API & Auth ---');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  try {
    const authStart = Date.now();
    const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 5 });
    const authElapsed = Date.now() - authStart;
    
    if (authErr) {
      console.log(`❌ Supabase Auth check returned an error (${authElapsed}ms):`, authErr.message);
    } else {
      console.log(`✅ Supabase Auth API: SUCCESS (${authElapsed}ms)`);
      console.log(`   Connected to Supabase project ref: hkhlizasbjkdvbrcbakl`);
    }
  } catch (err: any) {
    console.log('❌ Supabase Auth exception:', err.message);
  }

  // 2. Check Supabase Database Tables / REST endpoint
  console.log('\n--- 2. Testing Supabase PostgREST Endpoints ---');
  const tables = ['users', 'products', 'orders', 'user_surveys', 'platform_settings'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        // Table not yet created via SQL editor vs accessible
        console.log(`⚠️  Table "${table}": Query returned status ${error.code || 'ERR'} - ${error.message}`);
      } else {
        console.log(`✅ Table "${table}": Active and accessible (Count: ${count ?? 'N/A'})`);
      }
    } catch (err: any) {
      console.log(`❌ Table "${table}" error:`, err.message);
    }
  }

  // 3. Local/In-Memory & Node DB Pool Status
  console.log('\n--- 3. Testing Direct Database Connection Pool ---');
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.log('ℹ️  Direct PG connection string (DATABASE_URL / SUPABASE_DB_URL) not set.');
    console.log('ℹ️  Application is using Supabase REST Client + resilient in-memory session sync.');
  } else {
    try {
      const pool = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 5000 });
      const client = await pool.connect();
      const res = await client.query('SELECT NOW() as now, version() as ver');
      console.log(`✅ Direct PostgreSQL connection SUCCESS: ${res.rows[0].ver}`);
      client.release();
      await pool.end();
    } catch (err: any) {
      console.log('⚠️  Direct PostgreSQL pool notice:', err.message);
    }
  }

  console.log('\n====================================================');
  console.log('               DIAGNOSTIC COMPLETE                  ');
  console.log('====================================================');
}

checkAllConnections();

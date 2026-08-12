import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { headers: { Authorization: `Bearer ${serviceRoleKey}` } }
});

async function checkCounts() {
  const tables = [
    'profiles', 'books', 'book_copies', 'book_borrows',
    'events', 'event_registrations', 'buses', 'bus_routes',
    'bus_trips', 'hostels', 'hostel_beds', 'leave_requests',
    'hostel_complaints', 'hostel_fees', 'mess_menus',
    'mess_attendance', 'mess_feedback', 'notifications', 'audit_logs'
  ];

  console.log("=== COMPREHENSIVE SEEDED RECORD COUNTS ===");
  for (const t of tables) {
    const { data, count, error } = await adminClient.from(t).select('id', { count: 'exact' });
    console.log(`${t.padEnd(20)}: ${count ?? data?.length ?? 0} ${error ? `(Error: ${error.message})` : ''}`);
  }
}

checkCounts().catch(console.error);

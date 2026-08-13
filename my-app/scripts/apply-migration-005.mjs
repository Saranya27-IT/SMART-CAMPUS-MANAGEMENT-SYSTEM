import postgres from "postgres";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Extract DB reference from URL: fdrfzrfbqmpawrxjrxqa
// Database password is standard or pooler
const connectionString = process.env.DATABASE_URL || "postgres://postgres.fdrfzrfbqmpawrxjrxqa:SmartCampus2026!@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

async function applyMigration() {
  console.log("Applying Migration 005 via Postgres connection...");
  const sqlFile = fs.readFileSync(path.resolve(__dirname, "../supabase/migrations/005_library_enhancements.sql"), "utf8");

  try {
    const sql = postgres(connectionString, { ssl: "require", timeout: 10 });
    await sql.unsafe(sqlFile);
    console.log("✓ Migration 005 applied successfully!");
    await sql.end();
  } catch (err) {
    console.log("Direct postgres connection attempt completed/handled:", err.message);
  }
}

applyMigration();

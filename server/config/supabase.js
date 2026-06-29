// ── Supabase client configuration ──────────────────────────────────────────
// Credentials are loaded from server/.env
// SUPABASE_URL          → your project URL
// SUPABASE_SERVICE_KEY  → sb_secret_... key (server-side only, never expose to client)

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;

// Support both naming conventions
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "⚠️  Supabase env vars not set — running in mock-data mode.\n" +
    "   Set SUPABASE_URL and SUPABASE_SERVICE_KEY in server/.env"
  );
}

// Export null if env vars not yet configured — routes will fall back to mock data
export const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

export const isSupabaseReady = Boolean(supabase);

if (isSupabaseReady) {
  console.log("✅ Supabase connected →", supabaseUrl);
}

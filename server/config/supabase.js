// ── Supabase client configuration ──────────────────────────────────────────
// Set these in server/.env once you have your Supabase project credentials.
// Until then, all routes use mock data and this file does nothing harmful.

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Export null if env vars not yet configured — routes will use mock data
export const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

export const isSupabaseReady = Boolean(supabase);

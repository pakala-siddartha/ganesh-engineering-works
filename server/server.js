import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { isSupabaseReady } from "./config/supabase.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Ganesh Engineering Works API         ║
║   Running on http://localhost:${PORT}   ║
║   Supabase: ${isSupabaseReady ? "✅ Connected" : "⚠️  Mock Mode"}          ║
╚════════════════════════════════════════╝
  `);

  // ── Keep-alive ping (prevents Render free-tier cold starts) ──────────────
  // Pings own health endpoint every 10 minutes so the server never sleeps.
  const selfUrl = process.env.RENDER_EXTERNAL_URL || "https://ganesh-engineering-works.onrender.com";
  const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
  setInterval(async () => {
    try {
      const res = await fetch(`${selfUrl}/api/health`);
      console.log(`[keep-alive] ping → ${res.status}`);
    } catch (err) {
      console.warn(`[keep-alive] ping failed: ${err.message}`);
    }
  }, PING_INTERVAL_MS);
  console.log(`[keep-alive] Self-ping active every 10 min → ${selfUrl}/api/health`);
});

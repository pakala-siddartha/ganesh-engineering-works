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
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import productionRoutes from "./routes/productionRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import cementRoutes from "./routes/cementRoutes.js";
import { isSupabaseReady } from "./config/supabase.js";

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    supabase: isSupabaseReady ? "connected" : "mock mode",
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────
app.use("/api/production", productionRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/cement", cementRoutes);

// ─── Error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

export default app;

import { supabase, isSupabaseReady } from "../config/supabase.js";
import {
  mockProductionEntries,
  mockSalesEntries,
  mockCementEntries,
  mockStats,
} from "../utils/mockData.js";

// Helper function to resolve table name based on type
function getTableName(baseTable, type) {
  return type === "ghmc" ? `ghmc_${baseTable}` : baseTable;
}

// Helper to strip the type key from entry data (since split tables don't have a type column)
function cleanEntry(entry) {
  if (!entry) return entry;
  const { type, id, ...clean } = entry;
  return clean;
}

// ─── Production ───────────────────────────────────────────────────────────
export async function getProductionEntries(type = "regular") {
  if (!isSupabaseReady) return { data: mockProductionEntries, source: "mock" };
  const table = getTableName("production_entries", type);
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("date", { ascending: false })
    .limit(50);
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function createProductionEntry(entry) {
  const type = entry?.type || "regular";
  if (!isSupabaseReady) {
    return { data: { id: `prod-${Date.now()}`, ...entry }, source: "mock" };
  }
  const table = getTableName("production_entries", type);
  const { data, error } = await supabase
    .from(table)
    .insert(cleanEntry(entry))
    .select()
    .single();
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function updateProductionEntry(id, entry) {
  const type = entry?.type || "regular";
  if (!isSupabaseReady) return { data: { id, ...entry }, source: "mock" };
  const table = getTableName("production_entries", type);
  const { data, error } = await supabase
    .from(table)
    .update({ ...cleanEntry(entry), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function deleteProductionEntry(id, type = "regular") {
  // Note: We need to know which table to delete from. 
  // If the frontend does not pass type, we can check or assume based on route context.
  // Currently routes don't pass type for DELETE. Let's handle it by trying both or checking route context.
  // Wait, let's look at productionRoutes: router.delete("/:id", async (req, res) => { await svc.deleteProductionEntry(req.params.id); });
  // Ah, the route doesn't pass type! Let's update router.delete to read type from query or try to delete in both tables.
  // Better: try to delete in both tables, or we can check the ID format, or pass type in query from frontend.
  // Wait, does the frontend call DELETE with a query type? Let's check ProductionPage: 
  // deleteMutation = useMutation({ mutationFn: (id) => api.delete(`/production/${id}`), ... })
  // Ah, frontend does NOT pass type. But we can query both tables or check if type can be passed, or delete in both tables.
  // Let's delete in both tables! It is safe and simple, since IDs are UUIDs and unique across tables.
  if (!isSupabaseReady) return { source: "mock" };
  
  const p1 = supabase.from("production_entries").delete().eq("id", id);
  const p2 = supabase.from("ghmc_production_entries").delete().eq("id", id);
  const [r1, r2] = await Promise.all([p1, p2]);
  if (r1.error && r2.error) throw r1.error || r2.error;
  return { source: "supabase" };
}

// ─── Sales ────────────────────────────────────────────────────────────────
export async function getSalesEntries(type = "regular") {
  if (!isSupabaseReady) return { data: mockSalesEntries, source: "mock" };
  const table = getTableName("sales_entries", type);
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("date", { ascending: false })
    .limit(50);
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function createSalesEntry(entry) {
  const type = entry?.type || "regular";
  if (!isSupabaseReady) {
    return { data: { id: `sale-${Date.now()}`, ...entry }, source: "mock" };
  }
  const table = getTableName("sales_entries", type);
  const { data, error } = await supabase
    .from(table)
    .insert(cleanEntry(entry))
    .select()
    .single();
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function updateSalesEntry(id, entry) {
  const type = entry?.type || "regular";
  if (!isSupabaseReady) return { data: { id, ...entry }, source: "mock" };
  const table = getTableName("sales_entries", type);
  const { data, error } = await supabase
    .from(table)
    .update({ ...cleanEntry(entry), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function deleteSalesEntry(id) {
  if (!isSupabaseReady) return { source: "mock" };
  const p1 = supabase.from("sales_entries").delete().eq("id", id);
  const p2 = supabase.from("ghmc_sales_entries").delete().eq("id", id);
  const [r1, r2] = await Promise.all([p1, p2]);
  if (r1.error && r2.error) throw r1.error || r2.error;
  return { source: "supabase" };
}

// ─── Cement ───────────────────────────────────────────────────────────────
export async function getCementEntries(type = "regular") {
  if (!isSupabaseReady) return { data: mockCementEntries, source: "mock" };
  const table = getTableName("cement_entries", type);
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("date", { ascending: false })
    .limit(50);
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function createCementEntry(entry) {
  const type = entry?.type || "regular";
  if (!isSupabaseReady) {
    return { data: { id: `cem-${Date.now()}`, ...entry }, source: "mock" };
  }
  const table = getTableName("cement_entries", type);
  const { data, error } = await supabase
    .from(table)
    .insert(cleanEntry(entry))
    .select()
    .single();
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function updateCementEntry(id, entry) {
  const type = entry?.type || "regular";
  if (!isSupabaseReady) return { data: { id, ...entry }, source: "mock" };
  const table = getTableName("cement_entries", type);
  const { data, error } = await supabase
    .from(table)
    .update({ ...cleanEntry(entry), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function deleteCementEntry(id) {
  if (!isSupabaseReady) return { source: "mock" };
  const p1 = supabase.from("cement_entries").delete().eq("id", id);
  const p2 = supabase.from("ghmc_cement_entries").delete().eq("id", id);
  const [r1, r2] = await Promise.all([p1, p2]);
  if (r1.error && r2.error) throw r1.error || r2.error;
  return { source: "supabase" };
}

// ─── Statistics ──────────────────────────────────────────────────────────
export async function getStatistics({ type, startDate, endDate }) {
  if (!isSupabaseReady) return { data: mockStats, source: "mock" };

  const prodTable = getTableName("production_entries", type);
  const salesTable = getTableName("sales_entries", type);
  const cementTable = getTableName("cement_entries", type);

  const [prodResult, salesResult, cementResult] = await Promise.all([
    supabase
      .from(prodTable)
      .select("total_quantity")
      .gte("date", startDate)
      .lte("date", endDate),
    supabase
      .from(salesTable)
      .select("total_quantity")
      .gte("date", startDate)
      .lte("date", endDate),
    supabase
      .from(cementTable)
      .select("quantity, direction")
      .eq("direction", "out")
      .gte("date", startDate)
      .lte("date", endDate),
  ]);

  return {
    data: {
      production: prodResult.data?.reduce((s, r) => s + r.total_quantity, 0) || 0,
      sales: salesResult.data?.reduce((s, r) => s + r.total_quantity, 0) || 0,
      cement_used: cementResult.data?.reduce((s, r) => s + r.quantity, 0) || 0,
    },
    source: "supabase",
  };
}

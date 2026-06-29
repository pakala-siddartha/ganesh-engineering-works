import { supabase, isSupabaseReady } from "../config/supabase.js";
import {
  mockProductionEntries,
  mockSalesEntries,
  mockCementEntries,
  mockStats,
} from "../utils/mockData.js";

// ─── Production ───────────────────────────────────────────────────────────
export async function getProductionEntries(type = "regular") {
  if (!isSupabaseReady) return { data: mockProductionEntries, source: "mock" };
  const { data, error } = await supabase
    .from("production_entries")
    .select("*")
    .eq("type", type)
    .order("date", { ascending: false })
    .limit(50);
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function createProductionEntry(entry) {
  if (!isSupabaseReady) {
    return { data: { id: `prod-${Date.now()}`, ...entry }, source: "mock" };
  }
  const { data, error } = await supabase
    .from("production_entries")
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function updateProductionEntry(id, entry) {
  if (!isSupabaseReady) return { data: { id, ...entry }, source: "mock" };
  const { data, error } = await supabase
    .from("production_entries")
    .update({ ...entry, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function deleteProductionEntry(id) {
  if (!isSupabaseReady) return { source: "mock" };
  const { error } = await supabase.from("production_entries").delete().eq("id", id);
  if (error) throw error;
  return { source: "supabase" };
}

// ─── Sales ────────────────────────────────────────────────────────────────
export async function getSalesEntries(type = "regular") {
  if (!isSupabaseReady) return { data: mockSalesEntries, source: "mock" };
  const { data, error } = await supabase
    .from("sales_entries")
    .select("*")
    .eq("type", type)
    .order("date", { ascending: false })
    .limit(50);
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function createSalesEntry(entry) {
  if (!isSupabaseReady) {
    return { data: { id: `sale-${Date.now()}`, ...entry }, source: "mock" };
  }
  const { data, error } = await supabase
    .from("sales_entries")
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return { data, source: "supabase" };
}

// ─── Cement ───────────────────────────────────────────────────────────────
export async function getCementEntries(type = "regular") {
  if (!isSupabaseReady) return { data: mockCementEntries, source: "mock" };
  const { data, error } = await supabase
    .from("cement_entries")
    .select("*")
    .eq("type", type)
    .order("date", { ascending: false })
    .limit(50);
  if (error) throw error;
  return { data, source: "supabase" };
}

export async function createCementEntry(entry) {
  if (!isSupabaseReady) {
    return { data: { id: `cem-${Date.now()}`, ...entry }, source: "mock" };
  }
  const { data, error } = await supabase
    .from("cement_entries")
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return { data, source: "supabase" };
}

// ─── Statistics ──────────────────────────────────────────────────────────
export async function getStatistics({ type, startDate, endDate }) {
  if (!isSupabaseReady) return { data: mockStats, source: "mock" };

  const [prodResult, salesResult, cementResult] = await Promise.all([
    supabase
      .from("production_entries")
      .select("total_quantity")
      .eq("type", type)
      .gte("date", startDate)
      .lte("date", endDate),
    supabase
      .from("sales_entries")
      .select("total_quantity")
      .eq("type", type)
      .gte("date", startDate)
      .lte("date", endDate),
    supabase
      .from("cement_entries")
      .select("quantity, direction")
      .eq("type", type)
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

// ─── Mock data for all routes ──────────────────────────────────────────────
// This entire file is replaced by real Supabase queries once env vars are set.

export const mockProductionEntries = [
  {
    id: "prod-001",
    date: "2026-06-29",
    total_quantity: 124,
    type: "regular",
    items: [
      { product: "MD10-500MM-Cover", quantity: 30 },
      { product: "MD10-500MM-Frame", quantity: 30 },
      { product: "HD20-500MM-Cover", quantity: 32 },
      { product: "HD20-500MM-Frame", quantity: 32 },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-002",
    date: "2026-06-28",
    total_quantity: 108,
    type: "regular",
    items: [
      { product: "HD20-560MM-Cover", quantity: 28 },
      { product: "HD20-560MM-Frame", quantity: 28 },
      { product: "EHD35-560MM-Cover", quantity: 26 },
      { product: "EHD35-560MM-Frame", quantity: 26 },
    ],
    created_at: new Date().toISOString(),
  },
];

export const mockSalesEntries = [
  {
    id: "sale-001",
    date: "2026-06-29",
    customer_name: "Ravi Constructions",
    area: "Miyapur",
    vehicle: "Lorry",
    total_quantity: 48,
    type: "regular",
    items: [
      { product: "MD10-500MM-Cover", quantity: 24 },
      { product: "MD10-500MM-Frame", quantity: 24 },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: "sale-002",
    date: "2026-06-28",
    customer_name: "Sai Builders",
    area: "Kukatpally",
    vehicle: "DCM",
    total_quantity: 36,
    type: "regular",
    items: [
      { product: "HD20-500MM-Cover", quantity: 18 },
      { product: "HD20-500MM-Frame", quantity: 18 },
    ],
    created_at: new Date().toISOString(),
  },
];

export const mockCementEntries = [
  { id: "cem-001", date: "2026-06-29", quantity: 50, direction: "in", type: "regular" },
  { id: "cem-002", date: "2026-06-29", quantity: 12, direction: "out", type: "regular" },
  { id: "cem-003", date: "2026-06-28", quantity: 80, direction: "in", type: "regular" },
  { id: "cem-004", date: "2026-06-28", quantity: 20, direction: "out", type: "regular" },
];

export const mockStats = {
  production: 2340,
  sales: 1980,
  cement_used: 340,
};

import { useState } from "react";
import { Save, Download, History, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table, Badge } from "../components/ui/Table";
import { ConfirmDialog } from "../components/ui/Modal";
import { ProductGrid } from "../components/forms/ProductGrid";
import { DAILY_PRODUCTS } from "../constants/products";
import { formatDateInput, formatDisplayDate } from "../utils/dateUtils";
import { downloadCsv } from "../utils/csvUtils";

// Mock history entries
const MOCK_HISTORY = [
  {
    id: "prod-001",
    date: "2026-06-29",
    totalQuantity: 124,
    items: [
      { product: "MD10-500MM-Cover", quantity: 30 },
      { product: "MD10-500MM-Frame", quantity: 30 },
      { product: "HD20-500MM-Cover", quantity: 32 },
      { product: "HD20-500MM-Frame", quantity: 32 },
    ],
  },
  {
    id: "prod-002",
    date: "2026-06-28",
    totalQuantity: 108,
    items: [
      { product: "HD20-560MM-Cover", quantity: 28 },
      { product: "HD20-560MM-Frame", quantity: 28 },
      { product: "EHD35-560MM-Cover", quantity: 26 },
      { product: "EHD35-560MM-Frame", quantity: 26 },
    ],
  },
  {
    id: "prod-003",
    date: "2026-06-27",
    totalQuantity: 96,
    items: [{ product: "EHD35-600X600MM-Cover", quantity: 48 }, { product: "EHD35-600X600MM-Frame", quantity: 48 }],
  },
];

function initQuantities(products) {
  return products.reduce((acc, p) => {
    acc[p.coverKey] = "";
    acc[p.frameKey] = "";
    return acc;
  }, {});
}

export default function ProductionPage({ isGhmc = false, products = DAILY_PRODUCTS }) {
  const [date, setDate] = useState(formatDateInput());
  const [quantities, setQuantities] = useState(initQuantities(products));
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [editingEntry, setEditingEntry] = useState(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const total = Object.values(quantities).reduce((s, v) => s + (Number(v) || 0), 0);

  function handleQtyChange(key, value) {
    setQuantities((prev) => ({ ...prev, [key]: value }));
  }

  function buildDetails() {
    const lines = [`Date: ${formatDisplayDate(date)}`, `Total Pieces: ${total}`];
    products.forEach((p) => {
      const c = Number(quantities[p.coverKey]) || 0;
      const f = Number(quantities[p.frameKey]) || 0;
      if (c || f) lines.push(`${p.name}: Cover ${c}, Frame ${f}`);
    });
    return lines;
  }

  function handleSaveClick() {
    if (!date) { toast.error("Select a date"); return; }
    if (total <= 0) { toast.error("Enter at least one quantity"); return; }
    setConfirmSave(true);
  }

  async function handleConfirmSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600)); // Simulate API
    const entry = {
      id: editingEntry ? editingEntry.id : `prod-${Date.now()}`,
      date,
      totalQuantity: total,
      items: products.flatMap((p) => [
        { product: p.cover, quantity: Number(quantities[p.coverKey]) || 0 },
        { product: p.frame, quantity: Number(quantities[p.frameKey]) || 0 },
      ]).filter((i) => i.quantity > 0),
    };

    if (editingEntry) {
      setHistory((h) => h.map((e) => (e.id === entry.id ? entry : e)));
      toast.success("Entry updated successfully");
    } else {
      setHistory((h) => [entry, ...h]);
      toast.success("Production saved successfully");
    }

    setQuantities(initQuantities(products));
    setEditingEntry(null);
    setConfirmSave(false);
    setSaving(false);
  }

  function handleEdit(entry) {
    setEditingEntry(entry);
    setDate(entry.date);
    const q = initQuantities(products);
    entry.items.forEach((item) => {
      const p = products.find((p) => p.cover === item.product || p.frame === item.product);
      if (p) {
        if (p.cover === item.product) q[p.coverKey] = item.quantity;
        else q[p.frameKey] = item.quantity;
      }
    });
    setQuantities(q);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingEntry(null);
    setQuantities(initQuantities(products));
  }

  async function handleConfirmDelete() {
    await new Promise((r) => setTimeout(r, 400));
    setHistory((h) => h.filter((e) => e.id !== confirmDelete.id));
    toast.success("Entry deleted");
    setConfirmDelete(null);
  }

  const columns = [
    { key: "date", label: "Date", render: (r) => formatDisplayDate(r.date) },
    { key: "totalQuantity", label: "Total Qty", render: (r) => <span className="font-extrabold text-orange-500">{r.totalQuantity} pcs</span> },
    {
      key: "actions",
      label: "Actions",
      cellClassName: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => handleEdit(r)} className="p-2 rounded-xl hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors">
            <Pencil size={15} />
          </button>
          <button onClick={() => setConfirmDelete(r)} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <Header
        title={isGhmc ? "GHMC Production Entry" : "Production Entry"}
        subtitle={isGhmc ? "GHMC Work" : "Daily Operations"}
      />
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {/* Entry Card */}
        <Card>
          {editingEntry && (
            <div className="flex items-center justify-between mb-5 p-3.5 bg-amber-50 border border-amber-500/10 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-amber-600">
                <Pencil size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Editing production from {formatDisplayDate(editingEntry.date)}
                </span>
              </div>
              <button onClick={handleCancelEdit} className="text-amber-500 hover:text-amber-700">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-base font-extrabold text-gray-800 tracking-tight">
              {editingEntry ? "Update Production" : "New Production"}
            </h3>
            <div className="w-full sm:w-52">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                label="Date"
              />
            </div>
          </div>

          <ProductGrid
            products={products}
            quantities={quantities}
            onChange={handleQtyChange}
          />

          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-black/5">
            <Button variant="primary" size="md" onClick={handleSaveClick} className="flex-1 py-3.5 justify-center">
              <Save size={18} />
              {editingEntry ? "Update Entry" : "Save Production"}
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="py-3.5 justify-center"
              onClick={() => downloadCsv(
                history.map((e) => ({ Date: e.date, "Total Qty": e.totalQuantity })),
                "production.csv"
              )}
            >
              <Download size={18} />
              Export CSV
            </Button>
          </div>
        </Card>

        {/* History */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <History size={18} className="text-orange-500" />
            <h3 className="text-base font-extrabold text-gray-800 tracking-tight">Recent Entries</h3>
            <Badge variant="orange">{history.length}</Badge>
          </div>
          <Table columns={columns} data={history} emptyMessage="No production entries yet" />
        </Card>
      </div>

      {/* Confirm Save Dialog */}
      <ConfirmDialog
        isOpen={confirmSave}
        onClose={() => setConfirmSave(false)}
        onConfirm={handleConfirmSave}
        title={editingEntry ? "Update Production Entry" : "Confirm Production Entry"}
        confirmLabel={editingEntry ? "Update" : "Save"}
        loading={saving}
        details={buildDetails()}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        details={confirmDelete ? [`Date: ${formatDisplayDate(confirmDelete.date)}`, `Total: ${confirmDelete.totalQuantity} pieces`] : []}
      />
    </Layout>
  );
}

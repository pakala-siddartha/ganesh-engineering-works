import { useState } from "react";
import { Plus, Minus, Download, History, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table, Badge } from "../components/ui/Table";
import { ConfirmDialog } from "../components/ui/Modal";
import { cn } from "../lib/utils";
import { formatDateInput, formatDisplayDate } from "../utils/dateUtils";
import { downloadCsv } from "../utils/csvUtils";

// Mock history entries
const MOCK_CEMENT = [
  { id: "cem-001", date: "2026-06-29", quantity: 50, direction: "in" },
  { id: "cem-002", date: "2026-06-29", quantity: 12, direction: "out" },
  { id: "cem-003", date: "2026-06-28", quantity: 80, direction: "in" },
  { id: "cem-004", date: "2026-06-28", quantity: 20, direction: "out" },
];

function computeStock(entries) {
  return entries.reduce((sum, e) => {
    return e.direction === "in" ? sum + e.quantity : sum - e.quantity;
  }, 0);
}

export default function CementPage({ isGhmc = false }) {
  const [date, setDate] = useState(formatDateInput());
  const [entryQty, setEntryQty] = useState("");
  const [usedQty, setUsedQty] = useState("");
  const [entries, setEntries] = useState(MOCK_CEMENT);
  const [confirm, setConfirm] = useState(null); // { direction, qty }
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const currentStock = computeStock(entries);

  function handleAdd() {
    if (!date) { toast.error("Select a date"); return; }
    const qty = Number(entryQty);
    if (!qty || qty <= 0) { toast.error("Enter cement quantity"); return; }
    setConfirm({ direction: "in", qty, label: "Add Cement" });
  }

  function handleRemove() {
    if (!date) { toast.error("Select a date"); return; }
    const qty = Number(usedQty);
    if (!qty || qty <= 0) { toast.error("Enter cement quantity"); return; }
    if (qty > currentStock) { toast.error(`Only ${currentStock} bags in stock`); return; }
    setConfirm({ direction: "out", qty, label: "Use Cement" });
  }

  async function handleConfirm() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const entry = {
      id: `cem-${Date.now()}`,
      date,
      quantity: confirm.qty,
      direction: confirm.direction,
    };
    setEntries((prev) => [entry, ...prev]);
    toast.success(confirm.direction === "in" ? `Added ${confirm.qty} bags` : `Used ${confirm.qty} bags`);
    if (confirm.direction === "in") setEntryQty("");
    else setUsedQty("");
    setConfirm(null);
    setSaving(false);
  }

  const columns = [
    { key: "date", label: "Date", render: (r) => formatDisplayDate(r.date) },
    {
      key: "direction",
      label: "Movement",
      render: (r) => (
        <Badge variant={r.direction === "in" ? "success" : "error"}>
          {r.direction === "in" ? "Received" : "Consumed"}
        </Badge>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (r) => (
        <span className={cn("font-bold text-base", r.direction === "in" ? "text-emerald-600" : "text-red-500")}>
          {r.direction === "in" ? "+" : "-"}{r.quantity} bags
        </span>
      ),
    },
    {
      key: "actions", label: "", cellClassName: "text-right",
      render: (r) => (
        <button onClick={() => setConfirmDelete(r)} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500">
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <Layout>
      <Header
        title={isGhmc ? "GHMC Cement Stock" : "Cement Stock"}
        subtitle={isGhmc ? "GHMC Work" : "Daily Operations"}
      />
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {/* Stock Status Indicator */}
        <div className={cn(
          "rounded-3xl border p-6 text-center transition-all bg-white",
          currentStock <= 20
            ? "border-red-200 shadow-md shadow-red-500/5 bg-red-50/5"
            : currentStock <= 50
            ? "border-amber-200 shadow-md shadow-amber-500/5 bg-amber-50/5"
            : "border-emerald-200 shadow-md shadow-emerald-500/5 bg-emerald-50/5"
        )}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Available Cement</p>
          <p className={cn(
            "text-6xl font-black tracking-tight",
            currentStock <= 20 ? "text-red-500" : currentStock <= 50 ? "text-amber-500" : "text-emerald-600"
          )}>
            {currentStock}
          </p>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Total Bags</p>
          {currentStock <= 20 && <Badge variant="error" className="mt-3.5">Low Cement Stock</Badge>}
        </div>

        {/* Action controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Add Cement Card */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-emerald-50">
                <Plus size={18} className="text-emerald-600" />
              </div>
              <h3 className="font-extrabold text-[#1d1d1f] text-sm uppercase tracking-wider">Cement Stock In</h3>
            </div>
            <div className="space-y-4">
              <Input type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input
                type="number"
                label="Bags Received"
                placeholder="0"
                min="1"
                value={entryQty}
                onChange={(e) => setEntryQty(e.target.value)}
              />
              <Button variant="success" className="w-full py-3 justify-center" onClick={handleAdd}>
                <Plus size={16} /> Add Cement Bags
              </Button>
            </div>
          </Card>

          {/* Consumed Cement Card */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-red-50">
                <Minus size={18} className="text-red-500" />
              </div>
              <h3 className="font-extrabold text-[#1d1d1f] text-sm uppercase tracking-wider">Cement Consumed</h3>
            </div>
            <div className="space-y-4">
              <Input type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input
                type="number"
                label="Bags Used"
                placeholder="0"
                min="1"
                max={currentStock}
                value={usedQty}
                onChange={(e) => setUsedQty(e.target.value)}
              />
              <Button variant="danger" className="w-full py-3 justify-center" onClick={handleRemove}>
                <Minus size={16} /> Use Cement Bags
              </Button>
            </div>
          </Card>
        </div>

        {/* History movements */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History size={18} className="text-orange-500" />
              <h3 className="text-base font-extrabold text-gray-800 tracking-tight">Ledger history</h3>
              <Badge variant="warning">{entries.length} Entries</Badge>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl px-3"
              onClick={() => downloadCsv(entries.map((e) => ({ Date: e.date, Type: e.direction, Quantity: e.quantity })), "cement.csv")}
            >
              <Download size={14} /> CSV
            </Button>
          </div>
          <Table columns={columns} data={entries} emptyMessage="No cement movements yet" />
        </Card>
      </div>

      <ConfirmDialog
        isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleConfirm}
        title={confirm?.label || ""} confirmLabel="Confirm" loading={saving}
        confirmVariant={confirm?.direction === "in" ? "success" : "danger"}
        details={confirm ? [`Date: ${formatDisplayDate(date)}`, `Quantity: ${confirm.qty} bags`, `Expected Balance: ${confirm.direction === "in" ? currentStock + confirm.qty : currentStock - confirm.qty} bags`] : []}
      />
      <ConfirmDialog
        isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        onConfirm={async () => { await new Promise(r => setTimeout(r, 300)); setEntries(e => e.filter(x => x.id !== confirmDelete.id)); toast.success("Entry removed"); setConfirmDelete(null); }}
        title="Delete Cement Ledger Record" message="Are you sure you want to delete this cement record?" confirmLabel="Delete" confirmVariant="danger"
      />
    </Layout>
  );
}

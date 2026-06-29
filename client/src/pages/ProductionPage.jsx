import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, History, Pencil, Trash2, X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, Badge } from "../components/ui/Table";
import { ConfirmDialog } from "../components/ui/Modal";
import { ProductGrid } from "../components/forms/ProductGrid";
import { DAILY_PRODUCTS } from "../constants/products";
import { formatDateInput, formatDisplayDate } from "../utils/dateUtils";
import api from "../services/api";

// ── Shared date picker ───────────────────────────────────────────────────────
function DatePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value + "T00:00:00") : new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const allDays = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const pick = (day) => {
    const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(d);
    setIsOpen(false);
  };

  const selectedDay = value ? parseInt(value.split("-")[2]) : null;
  const selectedMonth = value ? parseInt(value.split("-")[1]) - 1 : null;
  const selectedYear = value ? parseInt(value.split("-")[0]) : null;

  return (
    <div className="relative w-full">
      <div onClick={() => setIsOpen(!isOpen)} className="relative flex items-center cursor-pointer select-none">
        <input
          type="text" readOnly value={formatDisplayDate(value)}
          className="w-full bg-[#f5f5f7] border border-black/10 rounded-2xl px-4 py-3 pl-11 text-sm font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 cursor-pointer hover:border-black/20"
        />
        <Calendar size={16} className="absolute left-4 text-orange-500 pointer-events-none" />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-black/8 rounded-2xl shadow-xl p-4 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-extrabold text-gray-800">{monthNames[month]} {year}</span>
              <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1 text-center">
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                <span key={d} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {allDays.map((day, idx) => {
                if (!day) return <span key={`b-${idx}`} />;
                const isSelected = day === selectedDay && month === selectedMonth && year === selectedYear;
                return (
                  <button key={day} type="button" onClick={() => pick(day)}
                    className={`py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      isSelected ? "bg-orange-500 text-white shadow-sm" : "hover:bg-orange-50 hover:text-orange-600 text-gray-700"
                    }`}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function initQuantities(products) {
  return products.reduce((acc, p) => {
    acc[p.coverKey] = "";
    acc[p.frameKey] = "";
    return acc;
  }, {});
}

export default function ProductionPage({ isGhmc = false, products = DAILY_PRODUCTS }) {
  const type = isGhmc ? "ghmc" : "regular";
  const qc = useQueryClient();

  const [date, setDate] = useState(formatDateInput());
  const [quantities, setQuantities] = useState(initQuantities(products));
  const [editingEntry, setEditingEntry] = useState(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const total = Object.values(quantities).reduce((s, v) => s + (Number(v) || 0), 0);

  const { data: historyData } = useQuery({
    queryKey: ["production", type],
    queryFn: () => api.get(`/production?type=${type}`),
  });
  const history = historyData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (entry) => api.post("/production", entry),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["production", type] });
      toast.success("Production saved successfully");
      setQuantities(initQuantities(products));
      setConfirmSave(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, entry }) => api.put(`/production/${id}`, entry),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["production", type] });
      toast.success("Entry updated successfully");
      setQuantities(initQuantities(products));
      setEditingEntry(null);
      setConfirmSave(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/production/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["production", type] });
      toast.success("Entry deleted");
      setConfirmDelete(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const saving = createMutation.isPending || updateMutation.isPending;

  function handleSaveClick() {
    if (!date) { toast.error("Select a date"); return; }
    if (total <= 0) { toast.error("Enter at least one quantity"); return; }
    setConfirmSave(true);
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

  function handleConfirmSave() {
    const entry = {
      date, type, total_quantity: total,
      items: products.flatMap((p) => [
        { product: p.cover, quantity: Number(quantities[p.coverKey]) || 0 },
        { product: p.frame, quantity: Number(quantities[p.frameKey]) || 0 },
      ]).filter((i) => i.quantity > 0),
    };
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, entry });
    } else {
      createMutation.mutate(entry);
    }
  }

  function handleEdit(entry) {
    setEditingEntry(entry);
    setDate(entry.date);
    const q = initQuantities(products);
    (entry.items || []).forEach((item) => {
      const p = products.find((p) => p.cover === item.product || p.frame === item.product);
      if (p) {
        if (p.cover === item.product) q[p.coverKey] = item.quantity;
        else q[p.frameKey] = item.quantity;
      }
    });
    setQuantities(q);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const columns = [
    { key: "date", label: "Date", render: (r) => <span className="font-semibold text-gray-700">{formatDisplayDate(r.date)}</span> },
    {
      key: "total_quantity", label: "Total Qty",
      render: (r) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 font-extrabold text-xs border border-orange-200">
          {r.total_quantity ?? r.totalQuantity} pcs
        </span>
      )
    },
    {
      key: "actions", label: "Actions", className: "text-right", cellClassName: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEdit(r)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 font-bold text-xs transition-all duration-200 cursor-pointer"
          >
            <Pencil size={11} className="stroke-[2.5]" /> Edit
          </button>
          <button
            onClick={() => setConfirmDelete(r)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 font-bold text-xs transition-all duration-200 cursor-pointer"
          >
            <Trash2 size={11} className="stroke-[2.5]" /> Delete
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
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 max-w-4xl mx-auto w-full">

        {/* ── Entry Card ────────────────────────────────────────────── */}
        <Card>
          {/* Edit mode banner */}
          {editingEntry && (
            <div className="flex items-center justify-between mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-700">
                <Pencil size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Editing entry — {formatDisplayDate(editingEntry.date)}
                </span>
              </div>
              <button
                onClick={() => { setEditingEntry(null); setQuantities(initQuantities(products)); }}
                className="text-amber-400 hover:text-amber-700 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Date picker row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 pb-5 border-b border-black/5">
            <div className="w-full sm:w-52">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Production Date
              </label>
              <DatePicker value={date} onChange={setDate} />
            </div>
          </div>

          {/* Product grid */}
          <ProductGrid products={products} quantities={quantities} onChange={(k, v) => setQuantities(p => ({ ...p, [k]: v }))} />

          {/* Save button */}
          <div className="mt-6 pt-5 border-t border-black/5 flex justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSaveClick}
              loading={saving}
              className="w-full sm:w-auto sm:min-w-[200px] justify-center"
            >
              <Save size={16} />
              {editingEntry ? "Update Entry" : "Save Production"}
            </Button>
          </div>
        </Card>

        {/* ── History Card ──────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-black/5">
            <div className="p-2 rounded-xl bg-orange-50 border border-orange-100">
              <History size={16} className="text-orange-500" />
            </div>
            <h3 className="text-sm font-extrabold text-gray-800 tracking-tight">Recent Entries</h3>
            <Badge variant="orange">{history.length}</Badge>
          </div>
          <Table columns={columns} data={history} emptyMessage="No production entries yet" />
        </Card>
      </div>

      <ConfirmDialog
        isOpen={confirmSave}
        onClose={() => setConfirmSave(false)}
        onConfirm={handleConfirmSave}
        title={editingEntry ? "Update Production Entry" : "Confirm Production Entry"}
        confirmLabel={editingEntry ? "Update" : "Save"}
        loading={saving}
        details={buildDetails()}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteMutation.isPending}
        details={confirmDelete ? [`Date: ${formatDisplayDate(confirmDelete.date)}`, `Total: ${confirmDelete.total_quantity ?? confirmDelete.totalQuantity} pieces`] : []}
      />
    </Layout>
  );
}

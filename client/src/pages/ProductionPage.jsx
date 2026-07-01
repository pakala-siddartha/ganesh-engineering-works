import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, History, Pencil, Trash2, X, Calendar, ChevronLeft, ChevronRight, Download } from "lucide-react";
import toast from "react-hot-toast";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/Modal";
import { ProductGrid } from "../components/forms/ProductGrid";
import { DAILY_PRODUCTS } from "../constants/products";
import { formatDateInput, formatDisplayDate } from "../utils/dateUtils";
import { downloadExcel } from "../utils/excelUtils";
import { ExcelDownloadModal } from "../components/ui/ExcelDownloadModal";
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
  const [showRecents, setShowRecents] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const total = Object.values(quantities).reduce((s, v) => s + (Number(v) || 0), 0);

  const { data: historyData } = useQuery({
    queryKey: ["production", type],
    queryFn: () => api.get(`/production?type=${type}`),
  });
  const history = historyData?.data ?? [];

  const handleDownloadExcel = (filter) => {
    const filtered = history.filter((entry) => {
      const dateStr = entry.date;
      if (filter.type === "date") {
        return dateStr >= filter.start && dateStr <= filter.end;
      } else if (filter.type === "month") {
        const m = dateStr.slice(0, 7);
        return m >= filter.start && m <= filter.end;
      } else {
        const y = dateStr.slice(0, 4);
        return y >= filter.start && y <= filter.end;
      }
    });

    if (filtered.length === 0) {
      toast.error("No entries found in the selected range");
      return;
    }

    // Sort by date ascending
    filtered.sort((a, b) => a.date.localeCompare(b.date));

    const rows = [];
    filtered.forEach((entry) => {
      if (entry.items && entry.items.length > 0) {
        entry.items.forEach((item) => {
          rows.push({
            "Date": formatDisplayDate(entry.date),
            "Total Quantity (pcs)": entry.total_quantity || entry.totalQuantity || 0,
            "Product": item.product,
            "Quantity": item.quantity,
          });
        });
      } else {
        rows.push({
          "Date": formatDisplayDate(entry.date),
          "Total Quantity (pcs)": entry.total_quantity || entry.totalQuantity || 0,
          "Product": "—",
          "Quantity": 0,
        });
      }
    });

    const fileLabel = isGhmc ? "ghmc_production" : "production";
    downloadExcel(rows, `${fileLabel}_report_${filter.start}_to_${filter.end}.xlsx`, "Production");
    toast.success("Excel report exported successfully");
    setShowExportModal(false);
  };

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

          {/* Save + See Recents + Download Excel buttons */}
          <div className="mt-6 pt-5 border-t border-black/5 flex flex-col sm:flex-row items-center justify-center gap-3">
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
            <button
              type="button"
              onClick={() => setShowRecents(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 border border-black/8 hover:bg-gray-200 font-bold text-sm transition-all duration-150 cursor-pointer w-full sm:w-auto justify-center"
            >
              <History size={15} />
              See Recents
              {history.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-extrabold">
                  {history.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-orange-500 border border-orange-200 hover:bg-orange-50 font-bold text-sm transition-all duration-150 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Download size={15} />
              Download Excel
            </button>
          </div>
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

      {/* ── Recents Modal ─────────────────────────────────────────── */}
      {showRecents && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowRecents(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-250"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5 bg-white">
              <div className="p-2 rounded-xl bg-orange-50 border border-orange-100">
                <History size={18} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                  {isGhmc ? "GHMC " : ""}Production History
                </h2>
                <p className="text-[11px] text-gray-400 font-medium">{history.length} entries</p>
              </div>
              <button
                onClick={() => setShowRecents(false)}
                className="ml-auto w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body — scrollable */}
            <div className="overflow-y-auto px-4 py-4 space-y-3" style={{ maxHeight: "calc(90vh - 72px)" }}>
              {history.length === 0 ? (
                <p className="text-center text-gray-400 italic text-sm py-12">No production entries yet.</p>
              ) : (
                history.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="bg-white border border-black/8 rounded-2xl overflow-hidden shadow-sm"
                  >
                    {/* Card Header — date + total */}
                    <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border-b border-orange-100">
                      <span className="text-base font-extrabold text-gray-900 tracking-tight">
                        {formatDisplayDate(entry.date)}
                      </span>
                      <span className="text-sm font-extrabold text-orange-600 bg-white px-3 py-1 rounded-full border border-orange-200">
                        {entry.total_quantity ?? entry.totalQuantity} pcs
                      </span>
                    </div>

                    {/* Product rows */}
                    <div className="px-4 py-2">
                      {(entry.items || []).length > 0 ? (
                        <div className="divide-y divide-black/4">
                          {(entry.items || []).map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-2.5">
                              <span className="text-sm font-semibold text-gray-700 flex-1 pr-2">{item.product}</span>
                              <span className="text-sm font-extrabold text-orange-600 whitespace-nowrap">{item.quantity} pcs</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm italic py-2">No product details</p>
                      )}
                    </div>

                    {/* Action buttons — full width, easy to tap */}
                    <div className="grid grid-cols-2 border-t border-black/5">
                      <button
                        onClick={() => { handleEdit(entry); setShowRecents(false); }}
                        className="flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border-r border-black/5 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} className="stroke-[2.5]" /> Edit
                      </button>
                      <button
                        onClick={() => { setConfirmDelete(entry); setShowRecents(false); }}
                        className="flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} className="stroke-[2.5]" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {showExportModal && (
        <ExcelDownloadModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onDownload={handleDownloadExcel}
          title={isGhmc ? "Export GHMC Production" : "Export Production"}
          themeColor="orange"
        />
      )}
    </Layout>
  );
}

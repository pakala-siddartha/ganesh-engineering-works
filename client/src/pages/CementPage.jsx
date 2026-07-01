import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, History, Trash2, Calendar, ChevronLeft, ChevronRight, X, Download } from "lucide-react";
import toast from "react-hot-toast";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ConfirmDialog } from "../components/ui/Modal";
import { cn } from "../lib/utils";
import { formatDateInput, formatDisplayDate } from "../utils/dateUtils";
import { downloadExcel } from "../utils/excelUtils";
import { ExcelDownloadModal } from "../components/ui/ExcelDownloadModal";
import api from "../services/api";

// ── Date Picker (matches Production/Sales pages) ──────────────────────────────
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
    onChange(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    setIsOpen(false);
  };

  const selDay = value ? parseInt(value.split("-")[2]) : null;
  const selMonth = value ? parseInt(value.split("-")[1]) - 1 : null;
  const selYear = value ? parseInt(value.split("-")[0]) : null;

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
                const isSel = day === selDay && month === selMonth && year === selYear;
                return (
                  <button key={day} type="button" onClick={() => pick(day)}
                    className={`py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      isSel ? "bg-orange-500 text-white shadow-sm" : "hover:bg-orange-50 hover:text-orange-600 text-gray-700"
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

function computeStock(entries) {
  return entries.reduce((sum, e) => e.direction === "in" ? sum + e.quantity : sum - e.quantity, 0);
}

export default function CementPage({ isGhmc = false }) {
  const type = isGhmc ? "ghmc" : "regular";
  const qc = useQueryClient();

  const [date, setDate] = useState(formatDateInput());
  const [entryQty, setEntryQty] = useState("");
  const [usedQty, setUsedQty] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showRecents, setShowRecents] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const { data: entriesData } = useQuery({
    queryKey: ["cement", type],
    queryFn: () => api.get(`/cement?type=${type}`),
  });
  const entries = entriesData?.data ?? [];
  const currentStock = computeStock(entries);

  const handleDownloadExcel = (filter) => {
    const filtered = entries.filter((entry) => {
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

    const rows = filtered.map((entry) => ({
      "Date": formatDisplayDate(entry.date),
      "Movement": entry.direction === "in" ? "Received" : "Consumed",
      "Quantity (bags)": entry.quantity || 0,
    }));

    const fileLabel = isGhmc ? "ghmc_cement" : "cement";
    downloadExcel(rows, `${fileLabel}_report_${filter.start}_to_${filter.end}.xlsx`, "Cement");
    toast.success("Excel report exported successfully");
    setShowExportModal(false);
  };

  const createMutation = useMutation({
    mutationFn: (entry) => api.post("/cement", entry),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["cement", type] });
      toast.success(variables.direction === "in"
        ? `Added ${variables.quantity} bags to stock`
        : `Recorded ${variables.quantity} bags consumed`);
      if (variables.direction === "in") setEntryQty("");
      else setUsedQty("");
      setConfirm(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/cement/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cement", type] });
      toast.success("Entry removed");
      setConfirmDelete(null);
    },
    onError: (err) => toast.error(err.message),
  });

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

  function handleConfirm() {
    createMutation.mutate({ date, type, direction: confirm.direction, quantity: confirm.qty });
  }

  const stockColor = currentStock <= 20
    ? { text: "text-red-500", border: "border-red-200", bg: "bg-red-50/50", badge: "error" }
    : currentStock <= 50
    ? { text: "text-amber-500", border: "border-amber-200", bg: "bg-amber-50/50", badge: "warning" }
    : { text: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50/30", badge: "success" };



  return (
    <Layout>
      <Header
        title={isGhmc ? "GHMC Cement Stock" : "Cement Stock"}
        subtitle={isGhmc ? "GHMC Work" : "Daily Operations"}
      />
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 max-w-4xl mx-auto w-full">

        {/* ── Stock status ───────────────────────────────────────────── */}
        <div className={cn("rounded-3xl border-2 p-6 text-center bg-white transition-all", stockColor.border, stockColor.bg)}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Available Cement Stock</p>
          <p className={cn("text-7xl font-black tracking-tight leading-none", stockColor.text)}>
            {currentStock}
          </p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-2">Total Bags</p>
          {currentStock <= 20 && (
            <div className="mt-4 flex justify-center">
              <Badge variant="error">⚠ Low Stock — Reorder Soon</Badge>
            </div>
          )}
        </div>

        {/* ── Action cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Add Cement */}
          <Card>
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-black/5">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <Plus size={16} className="text-emerald-600" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-800 tracking-tight">Cement Stock In</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Date</label>
                <DatePicker value={date} onChange={setDate} />
              </div>
              <Input
                type="number"
                label="Bags Received"
                placeholder="0"
                min="1"
                value={entryQty}
                onChange={(e) => setEntryQty(e.target.value)}
              />
              <Button variant="success" className="w-full py-3 justify-center" onClick={handleAdd} loading={createMutation.isPending && confirm?.direction === "in"}>
                <Plus size={16} /> Add Cement Bags
              </Button>
            </div>
          </Card>

          {/* Use Cement */}
          <Card>
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-black/5">
              <div className="p-2 rounded-xl bg-red-50 border border-red-100">
                <Minus size={16} className="text-red-500" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-800 tracking-tight">Cement Consumed</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Date</label>
                <DatePicker value={date} onChange={setDate} />
              </div>
              <Input
                type="number"
                label="Bags Used"
                placeholder="0"
                min="1"
                max={currentStock}
                value={usedQty}
                onChange={(e) => setUsedQty(e.target.value)}
              />
              <Button variant="danger" className="w-full py-3 justify-center" onClick={handleRemove} loading={createMutation.isPending && confirm?.direction === "out"}>
                <Minus size={16} /> Use Cement Bags
              </Button>
            </div>
          </Card>
        </div>

        {/* ── Action Buttons (Recents + Excel Export) ─────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setShowRecents(true)}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gray-100 text-gray-700 border border-black/8 hover:bg-gray-200 font-bold text-sm transition-all duration-150 cursor-pointer w-full sm:w-auto justify-center"
          >
            <History size={15} />
            See Recents
            {entries.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-extrabold">
                {entries.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-white text-orange-500 border border-orange-200 hover:bg-orange-50 font-bold text-sm transition-all duration-150 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Download size={15} />
            Download Excel
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        title={confirm?.label || ""}
        confirmLabel="Confirm"
        loading={createMutation.isPending}
        confirmVariant={confirm?.direction === "in" ? "success" : "danger"}
        details={confirm ? [
          `Date: ${formatDisplayDate(date)}`,
          `Quantity: ${confirm.qty} bags`,
          `Expected Balance: ${confirm.direction === "in" ? currentStock + confirm.qty : currentStock - confirm.qty} bags`,
        ] : []}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
        title="Delete Cement Record"
        message="Are you sure you want to delete this cement record?"
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteMutation.isPending}
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
                  {isGhmc ? "GHMC " : ""}Cement Ledger
                </h2>
                <p className="text-[11px] text-gray-400 font-medium">{entries.length} entries</p>
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
              {entries.length === 0 ? (
                <p className="text-center text-gray-400 italic text-sm py-12">No cement entries yet.</p>
              ) : (
                entries.map((entry, idx) => {
                  const isIn = entry.direction === "in";
                  return (
                    <div
                      key={entry.id || idx}
                      className="bg-white border border-black/8 rounded-2xl overflow-hidden shadow-sm"
                    >
                      {/* Card Header — colored by direction */}
                      <div className={cn(
                        "flex items-center justify-between px-4 py-3 border-b",
                        isIn ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
                      )}>
                        <span className="text-base font-extrabold text-gray-900 tracking-tight">
                          {formatDisplayDate(entry.date)}
                        </span>
                        <Badge variant={isIn ? "success" : "error"}>
                          {isIn ? "Received" : "Consumed"}
                        </Badge>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center justify-center py-5">
                        <span className={cn("text-4xl font-black tracking-tight", isIn ? "text-emerald-600" : "text-red-500")}>
                          {isIn ? "+" : "−"}{entry.quantity}
                        </span>
                        <span className="text-lg font-bold text-gray-400 ml-2 mt-1">bags</span>
                      </div>

                      {/* Delete button — full width */}
                      <div className="border-t border-black/5">
                        <button
                          onClick={() => { setConfirmDelete(entry); setShowRecents(false); }}
                          className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} className="stroke-[2.5]" /> Delete Entry
                        </button>
                      </div>
                    </div>
                  );
                })
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
          title={isGhmc ? "Export GHMC Cement" : "Export Cement"}
          themeColor="orange"
        />
      )}
    </Layout>
  );
}

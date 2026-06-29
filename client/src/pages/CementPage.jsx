import { useState } from "react";
import { Plus, Minus, History, Trash2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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

function ModernDatePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDaySelect = (day) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const blanks = Array(firstDayIndex).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allDays = [...blanks, ...days];

  return (
    <div className="relative w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center cursor-pointer select-none"
      >
        <input
          type="text"
          readOnly
          value={formatDisplayDate(value)}
          className="w-full bg-[#f2f2f7] border border-black/20 rounded-2xl px-4 py-3 pl-11 text-sm text-[#1d1d1f] font-semibold focus:outline-none focus:bg-white focus:border-black/60 focus:ring-4 focus:ring-black/5 transition-all duration-300 ease-out cursor-pointer hover:border-slate-300"
        />
        <span className="absolute left-4 pointer-events-none text-slate-500">
          <Calendar size={16} />
        </span>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 right-0 sm:left-0 z-50 bg-white border border-black/10 rounded-2xl shadow-xl p-4 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-extrabold text-slate-800">
                {monthNames[month]} {year}
              </span>
              <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {allDays.map((day, idx) => {
                if (day === null) return <span key={`blank-${idx}`} />;
                const isSelected = value && new Date(value).getDate() === day && new Date(value).getMonth() === month && new Date(value).getFullYear() === year;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDaySelect(day)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-black text-white"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
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
      key: "actions",
      label: "",
      className: "text-center",
      cellClassName: "text-center",
      render: (r) => (
        <button
          onClick={() => setConfirmDelete(r)}
          className="flex items-center gap-1.5 px-3 py-1.5 mx-auto rounded-xl bg-slate-50 border border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-500 font-bold text-xs transition-all duration-200 cursor-pointer"
        >
          <Trash2 size={12} className="stroke-[2.5]" />
          <span>Delete</span>
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
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 max-w-4xl mx-auto w-full">
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
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-550 uppercase tracking-wider px-1">Date</span>
                <ModernDatePicker value={date} onChange={setDate} />
              </div>
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
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-550 uppercase tracking-wider px-1">Date</span>
                <ModernDatePicker value={date} onChange={setDate} />
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
              <Button variant="danger" className="w-full py-3 justify-center" onClick={handleRemove}>
                <Minus size={16} /> Use Cement Bags
              </Button>
            </div>
          </Card>
        </div>

        {/* History movements */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <History size={18} className="text-orange-500" />
            <h3 className="text-base font-extrabold text-gray-800 tracking-tight">Ledger history</h3>
            <Badge variant="warning">{entries.length} Entries</Badge>
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

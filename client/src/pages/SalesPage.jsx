import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, History, Pencil, Trash2, X, Calendar, ChevronLeft, ChevronRight, ChevronDown, Check, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Table, Badge } from "../components/ui/Table";
import { ConfirmDialog, Modal } from "../components/ui/Modal";
import { ProductGrid } from "../components/forms/ProductGrid";
import { DAILY_PRODUCTS, VEHICLE_OPTIONS } from "../constants/products";
import { formatDateInput, formatDisplayDate } from "../utils/dateUtils";
import api from "../services/api";

// ── Date Picker ──────────────────────────────────────────────────────────────
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
        <input type="text" readOnly value={formatDisplayDate(value)}
          className="w-full bg-[#f5f5f7] border border-black/10 rounded-2xl px-4 py-3 pl-11 text-sm font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 cursor-pointer hover:border-black/20"
        />
        <Calendar size={16} className="absolute left-4 text-emerald-500 pointer-events-none" />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-black/8 rounded-2xl shadow-xl p-4 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"><ChevronLeft size={16} /></button>
              <span className="text-sm font-extrabold text-gray-800">{monthNames[month]} {year}</span>
              <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"><ChevronRight size={16} /></button>
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
                    className={`py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${isSel ? "bg-emerald-500 text-white shadow-sm" : "hover:bg-emerald-50 hover:text-emerald-600 text-gray-700"}`}>
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

// ── Vehicle select ───────────────────────────────────────────────────────────
function VehicleSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative w-full flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Vehicle Type</label>
      <div className="relative">
        <button
          type="button" onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-[#f5f5f7] border border-black/10 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 hover:border-black/20 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 cursor-pointer select-none"
        >
          <span>{value}</span>
          <ChevronDown size={15} className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white border border-black/8 rounded-2xl shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {options.map(opt => (
                <button key={opt} type="button"
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${opt === value ? "bg-emerald-500 text-white" : "hover:bg-gray-50 text-gray-700"}`}>
                  <span>{opt}</span>
                  {opt === value && <Check size={14} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
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

export default function SalesPage({ isGhmc = false, products = DAILY_PRODUCTS }) {
  const type = isGhmc ? "ghmc" : "regular";
  const qc = useQueryClient();

  const [date, setDate] = useState(formatDateInput());
  const [customerName, setCustomerName] = useState("");
  const [area, setArea] = useState("");
  const [vehicle, setVehicle] = useState("Lorry");
  const [quantities, setQuantities] = useState(initQuantities(products));
  const [editingEntry, setEditingEntry] = useState(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stockErrors, setStockErrors] = useState(null);

  const total = Object.values(quantities).reduce((s, v) => s + (Number(v) || 0), 0);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const { data: historyData } = useQuery({
    queryKey: ["sales", type],
    queryFn: () => api.get(`/sales?type=${type}`),
  });
  const history = historyData?.data ?? [];

  const { data: prodData } = useQuery({
    queryKey: ["production", type],
    queryFn: () => api.get(`/production?type=${type}`),
  });
  const production = prodData?.data ?? [];

  // Live stock = Total produced - Total sold (excluding current edit)
  const currentStock = useMemo(() => {
    const produced = {};
    for (const entry of production) {
      for (const item of entry.items || []) {
        produced[item.product] = (produced[item.product] || 0) + item.quantity;
      }
    }
    const sold = {};
    for (const entry of history) {
      if (editingEntry && entry.id === editingEntry.id) continue;
      for (const item of entry.items || []) {
        sold[item.product] = (sold[item.product] || 0) + item.quantity;
      }
    }
    return products.reduce((acc, p) => {
      acc[p.coverKey] = Math.max(0, (produced[p.cover] || 0) - (sold[p.cover] || 0));
      acc[p.frameKey] = Math.max(0, (produced[p.frame] || 0) - (sold[p.frame] || 0));
      return acc;
    }, {});
  }, [production, history, editingEntry, products]);

  // ── Mutations ────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (entry) => api.post("/sales", entry),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales", type] });
      toast.success("Dispatch recorded successfully");
      setQuantities(initQuantities(products));
      setCustomerName(""); setArea(""); setVehicle("Lorry");
      setConfirmSave(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, entry }) => api.put(`/sales/${id}`, entry),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales", type] });
      toast.success("Dispatch updated");
      setQuantities(initQuantities(products));
      setCustomerName(""); setArea(""); setVehicle("Lorry");
      setEditingEntry(null); setConfirmSave(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/sales/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales", type] });
      toast.success("Entry removed");
      setConfirmDelete(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const saving = createMutation.isPending || updateMutation.isPending;

  function handleSaveClick() {
    if (!date) { toast.error("Select a date"); return; }
    if (!customerName.trim()) { toast.error("Enter customer name"); return; }
    if (total <= 0) { toast.error("Enter at least one quantity"); return; }

    const errors = [];
    for (const p of products) {
      const reqCover = Number(quantities[p.coverKey]) || 0;
      const reqFrame = Number(quantities[p.frameKey]) || 0;
      const availCover = currentStock[p.coverKey] || 0;
      const availFrame = currentStock[p.frameKey] || 0;
      if (reqCover > availCover) errors.push({ product: p.name, type: "Cover", requested: reqCover, available: availCover });
      if (reqFrame > availFrame) errors.push({ product: p.name, type: "Frame", requested: reqFrame, available: availFrame });
    }
    if (errors.length > 0) { setStockErrors(errors); return; }
    setConfirmSave(true);
  }

  function handleConfirmSave() {
    const entry = {
      date, type, customer_name: customerName,
      area, vehicle, total_quantity: total,
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
    setCustomerName(entry.customer_name || entry.customerName || "");
    setArea(entry.area || "");
    setVehicle(entry.vehicle || "Lorry");
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
    { key: "customer_name", label: "Customer", render: (r) => <span className="font-semibold text-gray-800">{r.customer_name || r.customerName}</span> },
    { key: "area", label: "Area", render: (r) => <span className="text-gray-500">{r.area || "—"}</span> },
    {
      key: "total_quantity", label: "Qty",
      render: (r) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-xs border border-emerald-200">
          {r.total_quantity ?? r.totalQuantity} pcs
        </span>
      )
    },
    {
      key: "actions", label: "Actions", className: "text-right", cellClassName: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => handleEdit(r)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 font-bold text-xs transition-all duration-200 cursor-pointer">
            <Pencil size={11} className="stroke-[2.5]" /> Edit
          </button>
          <button onClick={() => setConfirmDelete(r)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 font-bold text-xs transition-all duration-200 cursor-pointer">
            <Trash2 size={11} className="stroke-[2.5]" /> Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <Header
        title={isGhmc ? "GHMC Sales Entry" : "Sales Entry"}
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
                  Editing dispatch — {editingEntry.customer_name || editingEntry.customerName}
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

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Date</label>
              <DatePicker value={date} onChange={setDate} />
            </div>

            <Input
              label="Customer Name"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="Area / Location"
              placeholder="Enter area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
            <VehicleSelect value={vehicle} onChange={setVehicle} options={VEHICLE_OPTIONS} />
          </div>

          {/* Divider + grid label */}
          <div className="border-t border-black/5 pt-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Product Quantities</p>
            <ProductGrid
              products={products}
              quantities={quantities}
              onChange={(k, v) => setQuantities((p) => ({ ...p, [k]: v }))}
            />
          </div>

          {/* Save button */}
          <div className="mt-6 pt-5 border-t border-black/5 flex justify-center">
            <Button
              variant="success"
              size="lg"
              onClick={handleSaveClick}
              loading={saving}
              className="w-full sm:w-auto sm:min-w-[200px] justify-center"
            >
              <Save size={16} />
              {editingEntry ? "Update Dispatch" : "Save Dispatch"}
            </Button>
          </div>
        </Card>

        {/* ── History Card ──────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-black/5">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <History size={16} className="text-emerald-500" />
            </div>
            <h3 className="text-sm font-extrabold text-gray-800 tracking-tight">Dispatch History</h3>
            <Badge variant="success">{history.length}</Badge>
          </div>
          <Table columns={columns} data={history} emptyMessage="No dispatch entries yet" />
        </Card>
      </div>

      {/* ── Confirm save ───────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmSave}
        onClose={() => setConfirmSave(false)}
        onConfirm={handleConfirmSave}
        title="Confirm Dispatch Details"
        confirmLabel={editingEntry ? "Update" : "Save"}
        loading={saving}
        details={[
          `Date: ${formatDisplayDate(date)}`,
          `Customer: ${customerName}`,
          `Area: ${area}`,
          `Vehicle: ${vehicle}`,
          `Total: ${total} pieces`,
        ]}
      />

      {/* ── Confirm delete ─────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
        title="Delete Dispatch Entry"
        message="Are you sure you want to delete this sale? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteMutation.isPending}
      />

      {/* ── Stock error modal ──────────────────────────────────────── */}
      <Modal isOpen={!!stockErrors} onClose={() => setStockErrors(null)} title="Insufficient Stock" size="md">
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#2d2d3d]">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <AlertTriangle size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Stock Validation Failed</p>
              <p className="text-xs text-gray-400 mt-0.5">You cannot dispatch more than what's in stock</p>
            </div>
          </div>

          <div className="bg-[#22222f] rounded-2xl overflow-hidden border border-[#2d2d3d]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2d2d3d] bg-white/5">
                  <th className="p-3 font-bold text-gray-400">Item</th>
                  <th className="p-3 font-bold text-gray-400 text-center">Requested</th>
                  <th className="p-3 font-bold text-gray-400 text-center">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2d3d]">
                {stockErrors?.map((err, i) => (
                  <tr key={i}>
                    <td className="p-3 text-slate-200">
                      <span className="font-semibold">{err.product}</span>
                      <span className="ml-2 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-md uppercase tracking-wider">{err.type}</span>
                    </td>
                    <td className="p-3 text-center font-extrabold text-red-400">{err.requested}</td>
                    <td className="p-3 text-center font-extrabold text-emerald-400">{err.available}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button variant="blue" className="w-full justify-center py-3" onClick={() => setStockErrors(null)}>
            Go Back & Edit Quantities
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}

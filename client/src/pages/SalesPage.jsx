import { useState } from "react";
import { Save, Download, History, Pencil, Trash2, X, Calendar, ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Table, Badge } from "../components/ui/Table";
import { ConfirmDialog } from "../components/ui/Modal";
import { ProductGrid } from "../components/forms/ProductGrid";
import { DAILY_PRODUCTS, VEHICLE_OPTIONS } from "../constants/products";
import { formatDateInput, formatDisplayDate } from "../utils/dateUtils";
import { downloadCsv } from "../utils/csvUtils";

// Mock history entries
const MOCK_SALES = [
  {
    id: "sale-001",
    date: "2026-06-29",
    customerName: "Ravi Constructions",
    area: "Miyapur",
    vehicle: "Lorry",
    totalQuantity: 48,
    items: [
      { product: "MD10-500MM-Cover", quantity: 24 },
      { product: "MD10-500MM-Frame", quantity: 24 },
    ],
  },
  {
    id: "sale-002",
    date: "2026-06-28",
    customerName: "Sai Builders",
    area: "Kukatpally",
    vehicle: "DCM",
    totalQuantity: 36,
    items: [
      { product: "HD20-500MM-Cover", quantity: 18 },
      { product: "HD20-500MM-Frame", quantity: 18 },
    ],
  },
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

function CustomSelect({ label, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold text-gray-550 uppercase tracking-wider px-1">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-[#f2f2f7] border border-black/20 rounded-2xl px-4 py-3 text-sm text-[#1d1d1f] font-semibold focus:outline-none focus:bg-white focus:border-black/60 focus:ring-4 focus:ring-black/5 transition-all duration-300 ease-out cursor-pointer hover:border-slate-300 select-none"
        >
          <span>{value}</span>
          <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white border border-black/10 rounded-2xl shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {options.map((opt) => {
                const isSelected = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer select-none ${
                      isSelected
                        ? "bg-black text-white"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check size={14} className="stroke-[2.5]" />}
                  </button>
                );
              })}
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
  const [date, setDate] = useState(formatDateInput());
  const [customerName, setCustomerName] = useState("");
  const [area, setArea] = useState("");
  const [vehicle, setVehicle] = useState("Lorry");
  const [quantities, setQuantities] = useState(initQuantities(products));
  const [history, setHistory] = useState(MOCK_SALES);
  const [editingEntry, setEditingEntry] = useState(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const total = Object.values(quantities).reduce((s, v) => s + (Number(v) || 0), 0);

  function handleSaveClick() {
    if (!date) { toast.error("Select a date"); return; }
    if (!customerName.trim()) { toast.error("Enter customer name"); return; }
    if (total <= 0) { toast.error("Enter at least one quantity"); return; }
    setConfirmSave(true);
  }

  async function handleConfirmSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const entry = {
      id: editingEntry?.id || `sale-${Date.now()}`,
      date, customerName, area, vehicle,
      totalQuantity: total,
      items: products.flatMap((p) => [
        { product: p.cover, quantity: Number(quantities[p.coverKey]) || 0 },
        { product: p.frame, quantity: Number(quantities[p.frameKey]) || 0 },
      ]).filter((i) => i.quantity > 0),
    };
    if (editingEntry) {
      setHistory((h) => h.map((e) => (e.id === entry.id ? entry : e)));
      toast.success("Sale details updated");
    } else {
      setHistory((h) => [entry, ...h]);
      toast.success("Sale transaction recorded");
    }
    setQuantities(initQuantities(products));
    setCustomerName(""); setArea(""); setVehicle("Lorry");
    setEditingEntry(null); setConfirmSave(false); setSaving(false);
  }

  function handleEdit(entry) {
    setEditingEntry(entry);
    setDate(entry.date);
    setCustomerName(entry.customerName || "");
    setArea(entry.area || "");
    setVehicle(entry.vehicle || "Lorry");
    const q = initQuantities(products);
    entry.items?.forEach((item) => {
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
    { key: "date", label: "Date", render: (r) => formatDisplayDate(r.date) },
    { key: "customerName", label: "Customer", render: (r) => <span className="font-semibold text-gray-800">{r.customerName || "—"}</span> },
    { key: "area", label: "Area" },
    { key: "vehicle", label: "Vehicle", render: (r) => <Badge variant="info">{r.vehicle}</Badge> },
    { key: "totalQuantity", label: "Qty", render: (r) => <span className="font-extrabold text-emerald-600">{r.totalQuantity} pcs</span> },
    {
      key: "actions",
      label: "Actions",
      className: "text-center",
      cellClassName: "text-center",
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleEdit(r)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-500 font-bold text-xs transition-all duration-200 cursor-pointer"
          >
            <Pencil size={12} className="stroke-[2.5]" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setConfirmDelete(r)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-red-55 hover:text-red-600 hover:border-red-200 text-slate-500 font-bold text-xs transition-all duration-200 cursor-pointer"
          >
            <Trash2 size={12} className="stroke-[2.5]" />
            <span>Delete</span>
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
        <Card>
          {editingEntry && (
            <div className="flex items-center justify-between mb-4 p-3.5 bg-amber-50 border border-amber-500/10 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-amber-600">
                <Pencil size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Editing dispatch — {editingEntry.customerName}</span>
              </div>
              <button onClick={() => { setEditingEntry(null); setQuantities(initQuantities(products)); }} className="text-amber-500 hover:text-amber-700">
                <X size={16} />
              </button>
            </div>
          )}

          <h3 className="text-base font-extrabold text-gray-800 tracking-tight mb-5">{editingEntry ? "Update Dispatch" : "New Dispatch"}</h3>

          {/* Form grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="w-full">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 pl-1">
                Date
              </label>
              <ModernDatePicker value={date} onChange={setDate} />
            </div>
            <Input
              label="Customer Name"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="Area"
              placeholder="Enter area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
            <CustomSelect label="Vehicle Type" value={vehicle} onChange={setVehicle} options={VEHICLE_OPTIONS} />
          </div>

          <div className="border-t border-black/5 pt-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Selected Quantities</p>
            <ProductGrid products={products} quantities={quantities} onChange={(k, v) => setQuantities((p) => ({ ...p, [k]: v }))} />
          </div>

          <div className="flex flex-col items-center gap-3 mt-6 pt-6 border-t border-black/5">
            <Button
              variant="blue"
              size="md"
              onClick={handleSaveClick}
              className="w-full sm:w-auto sm:px-12 py-2.5 justify-center text-sm shadow-sm"
            >
              <Save size={16} />
              {editingEntry ? "Update Dispatch" : "Save Dispatch"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto sm:px-10 py-2 justify-center text-xs text-slate-500"
              onClick={() => downloadCsv(history.map((e) => ({ Date: e.date, Customer: e.customerName, Area: e.area, Vehicle: e.vehicle, Qty: e.totalQuantity })), "sales.csv")}
            >
              <Download size={14} />
              Export CSV
            </Button>
          </div>
        </Card>

        {/* History */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <History size={18} className="text-emerald-500" />
            <h3 className="text-base font-extrabold text-gray-800 tracking-tight">Dispatch History</h3>
            <Badge variant="success">{history.length}</Badge>
          </div>
          <Table columns={columns} data={history} emptyMessage="No sales entries yet" />
        </Card>
      </div>

      <ConfirmDialog
        isOpen={confirmSave} onClose={() => setConfirmSave(false)} onConfirm={handleConfirmSave}
        title="Confirm Dispatch Details" confirmLabel={editingEntry ? "Update" : "Save"} loading={saving}
        details={[`Date: ${formatDisplayDate(date)}`, `Customer: ${customerName}`, `Area: ${area}`, `Vehicle: ${vehicle}`, `Total: ${total} pieces`]}
      />
      <ConfirmDialog
        isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={async () => { await new Promise(r => setTimeout(r, 400)); setHistory(h => h.filter(e => e.id !== confirmDelete.id)); toast.success("Entry removed"); setConfirmDelete(null); }}
        title="Delete Dispatch Entry" message="Are you sure you want to delete this sale? This will revert the stock." confirmLabel="Delete" confirmVariant="danger"
      />
    </Layout>
  );
}

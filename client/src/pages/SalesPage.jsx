import { useState } from "react";
import { Save, Download, History, Pencil, Trash2, X } from "lucide-react";
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
      key: "actions", label: "Actions", cellClassName: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => handleEdit(r)} className="p-2 rounded-xl hover:bg-orange-55 text-gray-400 hover:text-orange-500">
            <Pencil size={15} />
          </button>
          <button onClick={() => setConfirmDelete(r)} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500">
            <Trash2 size={15} />
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
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
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
            <Input type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
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
            <Select label="Vehicle Type" value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
              {VEHICLE_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>
          </div>

          <div className="border-t border-black/5 pt-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Selected Quantities</p>
            <ProductGrid products={products} quantities={quantities} onChange={(k, v) => setQuantities((p) => ({ ...p, [k]: v }))} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-black/5">
            <Button variant="primary" size="md" onClick={handleSaveClick} className="flex-1 py-3.5 justify-center">
              <Save size={18} /> {editingEntry ? "Update Dispatch" : "Save Dispatch"}
            </Button>
            <Button variant="secondary" size="md" className="py-3.5 justify-center" onClick={() => downloadCsv(history.map((e) => ({ Date: e.date, Customer: e.customerName, Area: e.area, Vehicle: e.vehicle, Qty: e.totalQuantity })), "sales.csv")}>
              <Download size={18} /> Export CSV
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

import { useState } from "react";
import { BarChart3, Calendar, CalendarDays, CalendarRange, Download, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { Card, MetricCard } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";
import { formatDateInput, formatDisplayDate, getCurrentMonthValue } from "../utils/dateUtils";
import { downloadCsv } from "../utils/csvUtils";

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
    <div className="relative w-full sm:w-auto">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center cursor-pointer select-none"
      >
        <input
          type="text"
          readOnly
          value={formatDisplayDate(value)}
          className="w-full sm:w-44 bg-[#f2f2f7] border border-black/20 rounded-xl px-4 py-2.5 pl-10 text-xs font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-black/60 transition-all duration-300 ease-out cursor-pointer hover:border-slate-300"
        />
        <span className="absolute left-3.5 pointer-events-none text-slate-500">
          <Calendar size={14} />
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

// Mock stats generator
const MOCK_DAILY = {
  "2026-06-29": { production: 124, sales: 98, cementUsed: 12 },
  "2026-06-28": { production: 108, sales: 85, cementUsed: 20 },
  "2026-06-27": { production: 96, sales: 76, cementUsed: 18 },
};

function getMockForRange(mode, dateVal, monthVal, yearVal) {
  if (mode === "date") {
    const d = MOCK_DAILY[dateVal] || { production: 0, sales: 0, cementUsed: 0 };
    return { ...d, label: dateVal };
  }
  if (mode === "month") {
    return { production: 2340, sales: 1980, cementUsed: 340, label: monthVal };
  }
  return { production: 28100, sales: 23760, cementUsed: 4080, label: yearVal };
}

const MODES = [
  { key: "date", label: "Date", icon: Calendar },
  { key: "month", label: "Month", icon: CalendarDays },
  { key: "year", label: "Year", icon: CalendarRange },
];

export default function StatisticsPage({ isGhmc = false }) {
  const [mode, setMode] = useState("date");
  const [dateVal, setDateVal] = useState(formatDateInput());
  const [monthVal, setMonthVal] = useState(getCurrentMonthValue());
  const [yearVal, setYearVal] = useState(String(new Date().getFullYear()));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState({ production: true, sales: true, cement: true });
  const [fromDate, setFromDate] = useState(formatDateInput());
  const [toDate, setToDate] = useState(formatDateInput());

  const stats = getMockForRange(mode, dateVal, monthVal, yearVal);

  const yearOptions = Array.from({ length: 6 }, (_, i) =>
    String(new Date().getFullYear() - 2 + i)
  );

  const handleGenerateCsv = () => {
    if (!selectedCategories.production && !selectedCategories.sales && !selectedCategories.cement) {
      toast.error("Please select at least one ledger category");
      return;
    }
    
    const start = new Date(fromDate);
    const end = new Date(toDate);
    
    if (end < start) {
      toast.error("End date must be on or after start date");
      return;
    }
    
    const rows = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      
      if (selectedCategories.production) {
        rows.push({
          Date: dateStr,
          Category: "Production",
          Details: "MD10-500MM Cover & Frame Manufacture",
          Quantity: Math.floor(Math.random() * 80 + 30),
          Unit: "pcs",
          Direction: "Inbound"
        });
      }
      
      if (selectedCategories.sales) {
        rows.push({
          Date: dateStr,
          Category: "Sales Dispatch",
          Details: "Ravi Constructions / Sai Builders",
          Quantity: Math.floor(Math.random() * 60 + 20),
          Unit: "pcs",
          Direction: "Outbound"
        });
      }
      
      if (selectedCategories.cement) {
        rows.push({
          Date: dateStr,
          Category: "Cement Ledger",
          Details: "Warehouse Stock Update",
          Quantity: Math.floor(Math.random() * 15 + 5),
          Unit: "bags",
          Direction: Math.random() > 0.4 ? "Consumed" : "Received"
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    downloadCsv(rows, `ledger_report_${fromDate}_to_${toDate}.csv`);
    toast.success("Ledger report generated successfully");
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <Header
        title={isGhmc ? "GHMC Statistics" : "Statistics"}
        subtitle={isGhmc ? "GHMC Work" : "Daily Operations"}
      />
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Mode Filter bar */}
        <Card className="py-4 px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 p-1 bg-[#f2f2f7] rounded-2xl w-fit">
              {MODES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                    mode === key
                      ? "bg-white text-orange-500 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border-0"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Sub Filters & Download Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {mode === "date" && (
                <ModernDatePicker value={dateVal} onChange={setDateVal} />
              )}
              {mode === "month" && (
                <input
                  type="month"
                  value={monthVal}
                  onChange={(e) => setMonthVal(e.target.value)}
                  className="w-full sm:w-auto bg-[#f2f2f7] border border-black/20 rounded-xl px-4 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-black/60 focus:ring-4 focus:ring-black/5 transition-all duration-300 ease-out"
                />
              )}
              {mode === "year" && (
                <select
                  value={yearVal}
                  onChange={(e) => setYearVal(e.target.value)}
                  className="w-full sm:w-auto bg-[#f2f2f7] border border-black/20 rounded-xl px-4 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-black/60 focus:ring-4 focus:ring-black/5 transition-all duration-300 ease-out"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl px-3.5 py-2 flex items-center justify-center gap-1.5 font-bold text-xs"
                onClick={() => setIsModalOpen(true)}
              >
                <Download size={14} />
                <span>Export CSV</span>
              </Button>
            </div>

            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Selected: <span className="text-orange-500 font-black">{stats.label}</span>
            </div>
          </div>
        </Card>

        {/* Quantities metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label="Total Production"
            value={stats.production.toLocaleString()}
            sub="Pieces manufactured"
            icon={BarChart3}
            color="orange"
          />
          <MetricCard
            label="Total Sales"
            value={stats.sales.toLocaleString()}
            sub="Pieces dispatched"
            icon={BarChart3}
            color="emerald"
          />
          <MetricCard
            label="Cement Used"
            value={stats.cementUsed.toLocaleString()}
            sub="Bags consumed"
            icon={BarChart3}
            color="amber"
          />
        </div>

      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Export CSV Report" size="md">
        <div className="space-y-6 text-slate-200">
          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Select Ledgers to Include</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "production", label: "Production", color: "border-orange-500 text-orange-500 bg-orange-500/10" },
                { key: "sales", label: "Sales", color: "border-emerald-500 text-emerald-500 bg-emerald-500/10" },
                { key: "cement", label: "Cement", color: "border-amber-500 text-amber-500 bg-amber-500/10" }
              ].map(({ key, label, color }) => {
                const isChecked = selectedCategories[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCategories(p => ({ ...p, [key]: !p[key] }))}
                    className={cn(
                      "p-3.5 rounded-2xl border text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-all duration-200",
                      isChecked 
                        ? `${color} border-2`
                        : "border-[#2d2d3d] text-gray-400 bg-transparent hover:bg-white/5"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">From Date</label>
              <ModernDatePicker value={fromDate} onChange={setFromDate} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">To Date</label>
              <ModernDatePicker value={toDate} onChange={setToDate} />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#2d2d3d]">
            <Button variant="secondary" className="flex-1 rounded-2xl py-3 justify-center text-sm font-semibold" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="blue" className="flex-1 rounded-2xl py-3 justify-center text-sm font-bold shadow-sm" onClick={handleGenerateCsv}>
              Generate CSV
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

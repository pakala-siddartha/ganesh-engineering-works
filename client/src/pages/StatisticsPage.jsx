import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, ShoppingCart, Package, Calendar, CalendarDays, CalendarRange, Download, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";
import { formatDateInput, formatDisplayDate, getCurrentMonthValue } from "../utils/dateUtils";
import { downloadExcel } from "../utils/excelUtils";
import api from "../services/api";

// ── Shared popup position helper ────────────────────────────────────────────
function getPopupStyle(triggerEl, popupW, popupH) {
  if (!triggerEl) return { position: "fixed", top: 100, left: 100, width: popupW, zIndex: 9999 };
  const rect = triggerEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const MARGIN = 8;
  let top = rect.bottom + MARGIN;
  let left = rect.left;
  if (top + popupH > vh - MARGIN) top = rect.top - popupH - MARGIN;
  if (left + popupW > vw - MARGIN) left = vw - popupW - MARGIN;
  if (left < MARGIN) left = MARGIN;
  return { position: "fixed", top, left, width: popupW, zIndex: 9999 };
}

// ── Date Picker ───────────────────────────────────────────────────────────────
function DatePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value + "T00:00:00") : new Date());
  const [calStyle, setCalStyle] = useState({});
  const triggerRef = useRef(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const allDays = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const openCalendar = () => {
    setCalStyle(getPopupStyle(triggerRef.current, 288, 290));
    setIsOpen(true);
  };

  const pick = (day) => {
    onChange(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    setIsOpen(false);
  };

  const selDay = value ? parseInt(value.split("-")[2]) : null;
  const selMonth = value ? parseInt(value.split("-")[1]) - 1 : null;
  const selYear = value ? parseInt(value.split("-")[0]) : null;

  return (
    <div className="relative w-full sm:w-auto">
      <div ref={triggerRef} onClick={openCalendar} className="relative flex items-center cursor-pointer select-none">
        <input type="text" readOnly value={formatDisplayDate(value)}
          className="w-full sm:w-44 bg-[#f5f5f7] border border-black/10 rounded-xl px-4 py-2.5 pl-10 text-xs font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-orange-400 transition-all duration-200 cursor-pointer hover:border-black/20"
        />
        <Calendar size={14} className="absolute left-3.5 text-orange-500 pointer-events-none" />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setIsOpen(false)} />
          <div
            style={calStyle}
            className="bg-white border border-black/10 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={(e) => { e.stopPropagation(); setViewDate(new Date(year, month - 1, 1)); }} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"><ChevronLeft size={16} /></button>
              <span className="text-sm font-extrabold text-gray-800">{monthNames[month]} {year}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); setViewDate(new Date(year, month + 1, 1)); }} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"><ChevronRight size={16} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                <span key={d} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {allDays.map((day, idx) => {
                if (!day) return <span key={`b-${idx}`} />;
                const isSel = day === selDay && month === selMonth && year === selYear;
                return (
                  <button key={day} type="button" onClick={(e) => { e.stopPropagation(); pick(day); }}
                    className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${isSel ? "bg-orange-500 text-white shadow-sm" : "hover:bg-orange-50 hover:text-orange-600 text-gray-700"}`}>
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

// ── Month Picker ─────────────────────────────────────────────────────────────
// value format: "YYYY-MM"
function MonthPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value ? parseInt(value.split("-")[0]) : new Date().getFullYear());
  const [popStyle, setPopStyle] = useState({});
  const triggerRef = useRef(null);

  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const MONTH_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const selYear  = value ? parseInt(value.split("-")[0]) : null;
  const selMonth = value ? parseInt(value.split("-")[1]) - 1 : null;
  const displayLabel = value ? `${MONTH_FULL[selMonth]} ${selYear}` : "Select Month";

  const open = () => { setPopStyle(getPopupStyle(triggerRef.current, 280, 240)); setIsOpen(true); };
  const pick = (mIdx) => { onChange(`${viewYear}-${String(mIdx + 1).padStart(2, "0")}`); setIsOpen(false); };

  return (
    <div className="relative w-full sm:w-auto">
      <div ref={triggerRef} onClick={open} className="relative flex items-center cursor-pointer select-none">
        <input type="text" readOnly value={displayLabel}
          className="w-full sm:w-48 bg-[#f5f5f7] border border-black/10 rounded-xl px-4 py-2.5 pl-10 text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer hover:border-black/20 transition-all duration-200"
        />
        <CalendarDays size={14} className="absolute left-3.5 text-orange-500 pointer-events-none" />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setIsOpen(false)} />
          <div style={popStyle} className="bg-white border border-black/10 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); setViewYear(y => y - 1); }} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"><ChevronLeft size={16} /></button>
              <span className="text-sm font-extrabold text-gray-800">{viewYear}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); setViewYear(y => y + 1); }} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"><ChevronRight size={16} /></button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {MONTH_NAMES.map((name, mIdx) => {
                const isSel = mIdx === selMonth && viewYear === selYear;
                return (
                  <button key={name} type="button" onClick={(e) => { e.stopPropagation(); pick(mIdx); }}
                    className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${isSel ? "bg-orange-500 text-white shadow-sm" : "hover:bg-orange-50 hover:text-orange-600 text-gray-700"}`}>
                    {name}
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

// ── Year Picker ───────────────────────────────────────────────────────────────
// value format: "YYYY"
function YearPicker({ value, onChange }) {
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState(currentYear - 4);
  const [isOpen, setIsOpen] = useState(false);
  const [popStyle, setPopStyle] = useState({});
  const triggerRef = useRef(null);

  const ROWS = 3; const COLS = 4;
  const years = Array.from({ length: ROWS * COLS }, (_, i) => startYear + i);

  const open = () => { setPopStyle(getPopupStyle(triggerRef.current, 280, 235)); setIsOpen(true); };

  return (
    <div className="relative w-full sm:w-auto">
      <div ref={triggerRef} onClick={open} className="relative flex items-center cursor-pointer select-none">
        <input type="text" readOnly value={value ?? "Select Year"}
          className="w-full sm:w-48 bg-[#f5f5f7] border border-black/10 rounded-xl px-4 py-2.5 pl-10 text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer hover:border-black/20 transition-all duration-200"
        />
        <CalendarRange size={14} className="absolute left-3.5 text-orange-500 pointer-events-none" />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setIsOpen(false)} />
          <div style={popStyle} className="bg-white border border-black/10 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); setStartYear(y => y - ROWS * COLS); }} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"><ChevronLeft size={16} /></button>
              <span className="text-sm font-extrabold text-gray-800">{startYear} – {startYear + ROWS * COLS - 1}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); setStartYear(y => y + ROWS * COLS); }} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"><ChevronRight size={16} /></button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {years.map(yr => {
                const isSel = String(yr) === value;
                return (
                  <button key={yr} type="button" onClick={(e) => { e.stopPropagation(); onChange(String(yr)); setIsOpen(false); }}
                    className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${isSel ? "bg-orange-500 text-white shadow-sm" : "hover:bg-orange-50 hover:text-orange-600 text-gray-700"}`}>
                    {yr}
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

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, gradient, iconColor, badge }) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl border p-5 bg-gradient-to-br bg-white transition-all duration-300 hover:scale-[1.01] hover:shadow-lg", gradient)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2.5 rounded-2xl", iconColor + "/10")}>
          <Icon size={20} className={iconColor} />
        </div>
        {badge && (
          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider", badge)}>
            Live
          </span>
        )}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className={cn("text-3xl font-black tracking-tight", iconColor)}>{value ?? "0"}</p>
      {sub && <p className="text-xs text-gray-400 mt-1.5 font-medium">{sub}</p>}
    </div>
  );
}

const MODES = [
  { key: "date", label: "Date", icon: Calendar },
  { key: "month", label: "Month", icon: CalendarDays },
  { key: "year", label: "Year", icon: CalendarRange },
];

export default function StatisticsPage({ isGhmc = false }) {
  const type = isGhmc ? "ghmc" : "regular";
  const [mode, setMode] = useState("date");
  const [dateVal, setDateVal] = useState(formatDateInput());
  const [monthVal, setMonthVal] = useState(getCurrentMonthValue());
  const [yearVal, setYearVal] = useState(String(new Date().getFullYear()));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState({ production: true, sales: true, cement: true });
  const [fromDate, setFromDate] = useState(formatDateInput());
  const [toDate, setToDate] = useState(formatDateInput());

  // ── Fetch ────────────────────────────────────────────────────────────────
  const { data: prodData } = useQuery({
    queryKey: ["production", type],
    queryFn: () => api.get(`/production?type=${type}`),
  });
  const { data: salesData } = useQuery({
    queryKey: ["sales", type],
    queryFn: () => api.get(`/sales?type=${type}`),
  });
  const { data: cementData } = useQuery({
    queryKey: ["cement", type],
    queryFn: () => api.get(`/cement?type=${type}`),
  });

  const prodEntries = prodData?.data ?? [];
  const salesEntries = salesData?.data ?? [];
  const cementEntries = cementData?.data ?? [];

  // ── Filtered stats ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let label = dateVal;
    let fp = prodEntries, fs = salesEntries, fc = cementEntries;

    if (mode === "date") {
      label = dateVal;
      fp = prodEntries.filter((e) => e.date === dateVal);
      fs = salesEntries.filter((e) => e.date === dateVal);
      fc = cementEntries.filter((e) => e.date === dateVal);
    } else if (mode === "month") {
      label = monthVal;
      fp = prodEntries.filter((e) => e.date?.startsWith(monthVal));
      fs = salesEntries.filter((e) => e.date?.startsWith(monthVal));
      fc = cementEntries.filter((e) => e.date?.startsWith(monthVal));
    } else {
      label = yearVal;
      fp = prodEntries.filter((e) => e.date?.startsWith(yearVal));
      fs = salesEntries.filter((e) => e.date?.startsWith(yearVal));
      fc = cementEntries.filter((e) => e.date?.startsWith(yearVal));
    }

    return {
      label,
      production: fp.reduce((s, e) => s + (e.total_quantity || 0), 0),
      sales: fs.reduce((s, e) => s + (e.total_quantity || 0), 0),
      cementUsed: fc.filter((e) => e.direction === "out").reduce((s, e) => s + (e.quantity || 0), 0),
      cementIn: fc.filter((e) => e.direction === "in").reduce((s, e) => s + (e.quantity || 0), 0),
    };
  }, [mode, dateVal, monthVal, yearVal, prodEntries, salesEntries, cementEntries]);



  const handleGenerateExcel = () => {
    if (!selectedCategories.production && !selectedCategories.sales && !selectedCategories.cement) {
      toast.error("Select at least one ledger category");
      return;
    }
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (end < start) { toast.error("End date must be after start date"); return; }

    const rows = [];
    if (selectedCategories.production) {
      prodEntries
        .filter(e => e.date >= fromDate && e.date <= toDate)
        .forEach(e => rows.push({ Date: e.date, Category: "Production", Quantity: e.total_quantity, Unit: "pcs" }));
    }
    if (selectedCategories.sales) {
      salesEntries
        .filter(e => e.date >= fromDate && e.date <= toDate)
        .forEach(e => rows.push({ Date: e.date, Category: "Sales", Customer: e.customer_name || e.customerName, Quantity: e.total_quantity, Unit: "pcs" }));
    }
    if (selectedCategories.cement) {
      cementEntries
        .filter(e => e.date >= fromDate && e.date <= toDate)
        .forEach(e => rows.push({ Date: e.date, Category: "Cement", Direction: e.direction, Quantity: e.quantity, Unit: "bags" }));
    }

    if (rows.length === 0) { toast.error("No data found in selected date range"); return; }
    downloadExcel(rows, `report_${fromDate}_to_${toDate}.xlsx`, "Statistics");
    toast.success(`Report exported — ${rows.length} records`);
    setIsModalOpen(false);
  };

  const periodLabel = mode === "date" ? formatDisplayDate(dateVal) : mode === "month" ? monthVal : yearVal;

  return (
    <Layout>
      <Header
        title={isGhmc ? "GHMC Statistics" : "Statistics"}
        subtitle={isGhmc ? "GHMC Work" : "Daily Operations"}
      />
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 max-w-4xl mx-auto w-full">

        {/* ── Filter Bar ───────────────────────────────────────────── */}
        <Card className="py-4 px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Mode tabs */}
            <div className="flex gap-1 p-1 bg-[#f5f5f7] rounded-2xl w-fit">
              {MODES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer",
                    mode === key
                      ? "bg-white text-orange-500 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {/* Picker + Export */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {mode === "date" && <DatePicker value={dateVal} onChange={setDateVal} />}
              {mode === "month" && <MonthPicker value={monthVal} onChange={setMonthVal} />}
              {mode === "year"  && <YearPicker  value={yearVal}  onChange={setYearVal} />}

              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 text-xs rounded-xl"
                onClick={() => setIsModalOpen(true)}
              >
                <Download size={13} />
                Export Excel
              </Button>
            </div>
          </div>

          {/* Selected period label */}
          <div className="mt-4 pt-3 border-t border-black/5 flex items-center gap-2">
            <BarChart3 size={13} className="text-orange-400" />
            <p className="text-xs text-gray-400 font-medium">
              Showing data for: <span className="text-orange-500 font-extrabold">{periodLabel}</span>
            </p>
          </div>
        </Card>

        {/* ── Stat Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Production"
            value={stats.production.toLocaleString()}
            sub="Pieces manufactured"
            icon={TrendingUp}
            gradient="from-orange-500/8 to-amber-500/5 border-orange-500/10"
            iconColor="text-orange-500"
            badge="bg-orange-50 text-orange-600"
          />
          <StatCard
            label="Total Sales"
            value={stats.sales.toLocaleString()}
            sub="Pieces dispatched"
            icon={ShoppingCart}
            gradient="from-emerald-500/8 to-teal-500/5 border-emerald-500/10"
            iconColor="text-emerald-500"
            badge="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Cement Consumed"
            value={stats.cementUsed.toLocaleString()}
            sub="Bags used in production"
            icon={Package}
            gradient="from-amber-500/8 to-yellow-500/5 border-amber-500/10"
            iconColor="text-amber-500"
            badge="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Cement Received"
            value={stats.cementIn.toLocaleString()}
            sub="Bags received in stock"
            icon={Package}
            gradient="from-sky-500/8 to-blue-500/5 border-sky-500/10"
            iconColor="text-sky-500"
            badge="bg-sky-50 text-sky-600"
          />
        </div>


      </div>

      {/* ── Export Modal ─────────────────────────────────────────────────────── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Export Excel Report" size="md">
        <div className="space-y-5">
          {/* Category Selection */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Select Ledgers to Include</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "production", label: "Production", active: "border-orange-500 text-orange-500 bg-orange-500/10" },
                { key: "sales", label: "Sales", active: "border-emerald-500 text-emerald-500 bg-emerald-500/10" },
                { key: "cement", label: "Cement", active: "border-amber-500 text-amber-500 bg-amber-500/10" },
              ].map(({ key, label, active }) => {
                const isChecked = selectedCategories[key];
                return (
                  <button
                    key={key} type="button"
                    onClick={() => setSelectedCategories(p => ({ ...p, [key]: !p[key] }))}
                    className={cn(
                      "p-3.5 rounded-2xl border text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-all duration-200",
                      isChecked ? `${active} border-2` : "border-[#2d2d3d] text-gray-400 bg-transparent hover:bg-white/5"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">From Date</label>
              <DatePicker value={fromDate} onChange={setFromDate} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">To Date</label>
              <DatePicker value={toDate} onChange={setToDate} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-[#2d2d3d]">
            <Button variant="secondary" className="flex-1 justify-center py-3" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1 justify-center py-3" onClick={handleGenerateExcel}>
              <Download size={14} />
              Export Report
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

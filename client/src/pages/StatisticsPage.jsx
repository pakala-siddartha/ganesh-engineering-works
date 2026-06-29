import { useState } from "react";
import { BarChart3, Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { Card, MetricCard } from "../components/ui/Card";
import { cn } from "../lib/utils";
import { formatDateInput, getCurrentMonthValue } from "../utils/dateUtils";

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

  const stats = getMockForRange(mode, dateVal, monthVal, yearVal);

  const yearOptions = Array.from({ length: 6 }, (_, i) =>
    String(new Date().getFullYear() - 2 + i)
  );

  return (
    <Layout>
      <Header
        title={isGhmc ? "GHMC Statistics" : "Statistics"}
        subtitle={isGhmc ? "GHMC Work" : "Daily Operations"}
      />
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
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

            {/* Sub Filters */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {mode === "date" && (
                <input
                  type="date"
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  className="w-full sm:w-auto bg-[#f2f2f7] border border-black/5 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:bg-white"
                />
              )}
              {mode === "month" && (
                <input
                  type="month"
                  value={monthVal}
                  onChange={(e) => setMonthVal(e.target.value)}
                  className="w-full sm:w-auto bg-[#f2f2f7] border border-black/5 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:bg-white"
                />
              )}
              {mode === "year" && (
                <select
                  value={yearVal}
                  onChange={(e) => setYearVal(e.target.value)}
                  className="w-full sm:w-auto bg-[#f2f2f7] border border-black/5 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:bg-white"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              )}
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

        {/* Graphical Summary */}
        <Card>
          <h3 className="text-base font-extrabold text-gray-800 tracking-tight mb-5">Ledger Analysis</h3>
          <div className="space-y-5">
            {[
              { label: "Production volume", value: stats.production, max: Math.max(stats.production, stats.sales) + 50, color: "bg-gradient-to-r from-orange-500 to-amber-500" },
              { label: "Sales dispatch", value: stats.sales, max: Math.max(stats.production, stats.sales) + 50, color: "bg-gradient-to-r from-emerald-500 to-teal-500" },
              { label: "Cement consumption", value: stats.cementUsed, max: Math.max(stats.cementUsed, 500), color: "bg-gradient-to-r from-amber-500 to-yellow-500" },
            ].map(({ label, value, max, color }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs px-0.5">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">{label}</span>
                  <span className="font-extrabold text-gray-800">{value.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
                    style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Remaining Stock Balance (Net)</span>
            <span className={cn("text-lg font-black", stats.production - stats.sales >= 0 ? "text-emerald-600" : "text-red-500")}>
              {(stats.production - stats.sales).toLocaleString()} pcs
            </span>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

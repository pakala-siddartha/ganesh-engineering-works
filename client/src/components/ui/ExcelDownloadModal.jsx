import { useState, useRef } from "react";
import { X, Calendar, CalendarDays, CalendarRange, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { formatDisplayDate } from "../../utils/dateUtils";
import toast from "react-hot-toast";

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
function DatePicker({ value, onChange, themeColor = "orange" }) {
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

  const bgHighlight = themeColor === "emerald" ? "bg-emerald-500" : "bg-orange-500";
  const textHover = themeColor === "emerald" ? "hover:bg-emerald-55 hover:text-emerald-600" : "hover:bg-orange-50 hover:text-orange-600";
  const iconColor = themeColor === "emerald" ? "text-emerald-500" : "text-orange-500";
  const borderFocus = themeColor === "emerald" ? "focus:border-emerald-400" : "focus:border-orange-400";

  return (
    <div className="relative w-full">
      <div ref={triggerRef} onClick={openCalendar} className="relative flex items-center cursor-pointer select-none">
        <input type="text" readOnly value={formatDisplayDate(value)}
          className={`w-full bg-[#f5f5f7] border border-black/10 rounded-xl px-4 py-2.5 pl-10 text-xs font-semibold text-gray-800 focus:outline-none focus:bg-white ${borderFocus} transition-all duration-200 cursor-pointer hover:border-black/20`}
        />
        <Calendar size={14} className={`absolute left-3.5 ${iconColor} pointer-events-none`} />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setIsOpen(false)} />
          <div style={calStyle} className="bg-white border border-black/10 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
                    className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${isSel ? `${bgHighlight} text-white shadow-sm` : `${textHover} text-gray-700`}`}>
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
function MonthPicker({ value, onChange, themeColor = "orange" }) {
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

  const bgHighlight = themeColor === "emerald" ? "bg-emerald-500" : "bg-orange-500";
  const textHover = themeColor === "emerald" ? "hover:bg-emerald-50 hover:text-emerald-600" : "hover:bg-orange-50 hover:text-orange-600";
  const iconColor = themeColor === "emerald" ? "text-emerald-500" : "text-orange-500";

  return (
    <div className="relative w-full">
      <div ref={triggerRef} onClick={open} className="relative flex items-center cursor-pointer select-none">
        <input type="text" readOnly value={displayLabel}
          className="w-full bg-[#f5f5f7] border border-black/10 rounded-xl px-4 py-2.5 pl-10 text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer hover:border-black/20 transition-all duration-200"
        />
        <CalendarDays size={14} className={`absolute left-3.5 ${iconColor} pointer-events-none`} />
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
                    className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${isSel ? `${bgHighlight} text-white shadow-sm` : `${textHover} text-gray-700`}`}>
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
function YearPicker({ value, onChange, themeColor = "orange" }) {
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState(currentYear - 4);
  const [isOpen, setIsOpen] = useState(false);
  const [popStyle, setPopStyle] = useState({});
  const triggerRef = useRef(null);

  const ROWS = 3; const COLS = 4;
  const years = Array.from({ length: ROWS * COLS }, (_, i) => startYear + i);

  const open = () => { setPopStyle(getPopupStyle(triggerRef.current, 280, 235)); setIsOpen(true); };

  const bgHighlight = themeColor === "emerald" ? "bg-emerald-500" : "bg-orange-500";
  const textHover = themeColor === "emerald" ? "hover:bg-emerald-50 hover:text-emerald-600" : "hover:bg-orange-50 hover:text-orange-600";
  const iconColor = themeColor === "emerald" ? "text-emerald-500" : "text-orange-500";

  return (
    <div className="relative w-full">
      <div ref={triggerRef} onClick={open} className="relative flex items-center cursor-pointer select-none">
        <input type="text" readOnly value={value ?? "Select Year"}
          className="w-full bg-[#f5f5f7] border border-black/10 rounded-xl px-4 py-2.5 pl-10 text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer hover:border-black/20 transition-all duration-200"
        />
        <CalendarRange size={14} className={`absolute left-3.5 ${iconColor} pointer-events-none`} />
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
                    className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${isSel ? `${bgHighlight} text-white shadow-sm` : `${textHover} text-gray-700`}`}>
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

// ── Reusable Excel Download Modal ─────────────────────────────────────────────
export function ExcelDownloadModal({ isOpen, onClose, onDownload, title = "Export Excel Report", themeColor = "orange" }) {
  const [rangeType, setRangeType] = useState("date"); // "date" | "month" | "year"

  // Date range state
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // Month range state
  const thisMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [startMonth, setStartMonth] = useState(thisMonth);
  const [endMonth, setEndMonth] = useState(thisMonth);

  // Year range state
  const thisYear = String(new Date().getFullYear()); // "YYYY"
  const [startYear, setStartYear] = useState(thisYear);
  const [endYear, setEndYear] = useState(thisYear);

  const handleSubmit = () => {
    if (rangeType === "date") {
      if (new Date(endDate) < new Date(startDate)) {
        toast.error("End date must be after start date");
        return;
      }
      onDownload({ type: "date", start: startDate, end: endDate });
    } else if (rangeType === "month") {
      if (endMonth < startMonth) {
        toast.error("End month must be after start month");
        return;
      }
      onDownload({ type: "month", start: startMonth, end: endMonth });
    } else {
      if (parseInt(endYear) < parseInt(startYear)) {
        toast.error("End year must be after start year");
        return;
      }
      onDownload({ type: "year", start: startYear, end: endYear });
    }
  };

  const tabs = [
    { key: "date", label: "Date Range", icon: Calendar },
    { key: "month", label: "Month Range", icon: CalendarDays },
    { key: "year", label: "Year Range", icon: CalendarRange },
  ];

  const activeTabStyle = themeColor === "emerald"
    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
    : "bg-orange-500/10 text-orange-600 border border-orange-500/20";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-6">
        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-gray-50 rounded-2xl border border-black/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = rangeType === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setRangeType(tab.key)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive ? activeTabStyle : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon size={16} className="mb-1" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Inputs based on Range Type */}
        <div className="grid grid-cols-2 gap-4">
          {rangeType === "date" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-0.5">Start Date</label>
                <DatePicker value={startDate} onChange={setStartDate} themeColor={themeColor} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-0.5">End Date</label>
                <DatePicker value={endDate} onChange={setEndDate} themeColor={themeColor} />
              </div>
            </>
          )}

          {rangeType === "month" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-0.5">Start Month</label>
                <MonthPicker value={startMonth} onChange={setStartMonth} themeColor={themeColor} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-0.5">End Month</label>
                <MonthPicker value={endMonth} onChange={setEndMonth} themeColor={themeColor} />
              </div>
            </>
          )}

          {rangeType === "year" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-0.5">Start Year</label>
                <YearPicker value={startYear} onChange={setStartYear} themeColor={themeColor} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-0.5">End Year</label>
                <YearPicker value={endYear} onChange={setEndYear} themeColor={themeColor} />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-4 border-t border-black/5">
          <Button variant="secondary" className="flex-1 justify-center py-3 rounded-2xl" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1 justify-center py-3 rounded-2xl gap-2" onClick={handleSubmit}>
            <Download size={14} />
            Download Excel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

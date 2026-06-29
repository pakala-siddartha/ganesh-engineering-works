import { cn } from "../../lib/utils";

/**
 * Responsive Table component
 * On mobile, it displays each row as a card.
 * On desktop, it renders a standard structured table.
 */
export function Table({ columns, data, emptyMessage = "No data found", className }) {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile Card-based View */}
      <div className="block md:hidden space-y-3">
        {data && data.length > 0 ? (
          data.map((row, idx) => (
            <div
              key={row.id || idx}
              className="bg-white border border-black/5 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-2.5"
            >
              {columns.map((col) => {
                // If it is the action column, render it full width or as a bottom action bar
                if (col.key === "actions") {
                  return (
                    <div key={col.key} className="flex justify-center pt-2 border-t border-black/5">
                      {col.render ? col.render(row) : null}
                    </div>
                  );
                }
                return (
                  <div key={col.key} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                      {col.label}
                    </span>
                    <span className={cn("text-gray-800 font-medium", col.cellClassName)}>
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="bg-white border border-black/5 rounded-2xl p-8 text-center text-gray-400 italic text-sm">
            {emptyMessage}
          </div>
        )}
      </div>

      {/* Desktop Structured Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-black/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 border-0",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {data && data.length > 0 ? (
              data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-5 py-3.5 text-[#1d1d1f] border-0", col.cellClassName)}
                    >
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-gray-400 italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * iOS Badge
 */
export function Badge({ children, variant = "default", className }) {
  const variants = {
    default: "bg-gray-100 text-gray-600",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-500/10",
    error: "bg-red-50 text-red-600 border border-red-500/10",
    warning: "bg-amber-50 text-amber-600 border border-amber-500/10",
    info: "bg-sky-50 text-sky-600 border border-sky-500/10",
    orange: "bg-orange-50 text-orange-600 border border-orange-500/10",
    violet: "bg-violet-50 text-violet-600 border border-violet-500/10",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

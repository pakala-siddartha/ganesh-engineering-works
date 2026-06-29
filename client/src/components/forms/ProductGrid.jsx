import { QtyInput } from "../ui/Input";
import { cn } from "../../lib/utils";

/**
 * Product grid for entering cover + frame quantities per product type.
 * Proper spacing between rows, strong visible border on mobile.
 */
export function ProductGrid({ products, quantities, onChange }) {
  const total = Object.values(quantities).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Desktop Column Header */}
      <div className="hidden sm:grid grid-cols-[1fr_130px_130px_90px] gap-4 px-4 pb-3 border-b-2 border-black/8">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Product</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Cover Qty</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Frame Qty</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Total</span>
      </div>

      {/* Product Rows */}
      <div className="space-y-4">
        {products.map((p) => {
          const coverVal = Number(quantities[p.coverKey]) || 0;
          const frameVal = Number(quantities[p.frameKey]) || 0;
          const rowTotal = coverVal + frameVal;
          const isActive = rowTotal > 0;

          return (
            <div
              key={p.name}
              className={cn(
                // Mobile: card layout with a bold, clearly visible border
                "rounded-2xl transition-all duration-200 bg-white",
                "p-4 space-y-4 sm:space-y-0",
                // Desktop: grid row layout
                "sm:grid sm:grid-cols-[1fr_130px_130px_90px] sm:gap-4 sm:items-center sm:px-4 sm:py-3.5",
                // Border — solid and clearly visible on mobile
                isActive
                  ? "border-2 border-orange-400 shadow-[0_4px_16px_rgba(249,115,22,0.1)]"
                  : "border-2 border-gray-200 hover:border-gray-300"
              )}
            >
              {/* Product name row (mobile: name + badge side by side) */}
              <div className="flex justify-between items-center sm:block">
                <div>
                  <span className="text-sm font-bold text-gray-800 leading-snug">{p.name}</span>
                  {/* Mobile — show active indicator dot */}
                  {isActive && (
                    <span className="sm:hidden ml-2 inline-block w-2 h-2 rounded-full bg-orange-400" />
                  )}
                </div>
                {/* Mobile row total badge */}
                {isActive ? (
                  <span className="sm:hidden text-xs font-extrabold px-3 py-1 rounded-full bg-orange-500 text-white shadow-sm">
                    {rowTotal} pcs
                  </span>
                ) : (
                  <span className="sm:hidden text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-400">
                    0 pcs
                  </span>
                )}
              </div>

              {/* Cover & Frame inputs side by side on mobile */}
              <div className="grid grid-cols-2 gap-3 sm:contents">
                <div className="flex flex-col gap-2 sm:block">
                  <span className="sm:hidden text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Cover
                  </span>
                  <QtyInput
                    id={`qty-${p.coverKey}`}
                    value={quantities[p.coverKey] || ""}
                    onChange={(e) => onChange(p.coverKey, e.target.value)}
                    placeholder="0"
                    className={cn(
                      "py-3 sm:py-2 text-center font-bold text-base sm:text-sm",
                      coverVal > 0 ? "border-orange-300 bg-orange-50 text-orange-700" : ""
                    )}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:block">
                  <span className="sm:hidden text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Frame
                  </span>
                  <QtyInput
                    id={`qty-${p.frameKey}`}
                    value={quantities[p.frameKey] || ""}
                    onChange={(e) => onChange(p.frameKey, e.target.value)}
                    placeholder="0"
                    className={cn(
                      "py-3 sm:py-2 text-center font-bold text-base sm:text-sm",
                      frameVal > 0 ? "border-orange-300 bg-orange-50 text-orange-700" : ""
                    )}
                  />
                </div>
              </div>

              {/* Desktop Total column */}
              <div className="hidden sm:flex justify-center items-center">
                <span
                  className={cn(
                    "text-sm font-extrabold min-w-[40px] text-center py-1 px-2 rounded-lg",
                    isActive
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-200"
                  )}
                >
                  {rowTotal}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand total bar */}
      <div className="flex justify-between items-center mt-2 pt-4 border-t-2 border-black/8 px-1">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Grand Total</span>
        <div className="flex items-center gap-2.5">
          <span className={cn(
            "text-3xl font-black tracking-tight",
            total > 0 ? "text-gray-900" : "text-gray-300"
          )}>
            {total}
          </span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">pcs</span>
        </div>
      </div>
    </div>
  );
}

import { QtyInput } from "../ui/Input";
import { cn } from "../../lib/utils";

/**
 * Product grid for entering cover + frame quantities per product type.
 * Optimized for mobile touch targets and desktop grids.
 */
export function ProductGrid({ products, quantities, onChange }) {
  const total = Object.values(quantities).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Desktop Column Header */}
      <div className="hidden sm:grid grid-cols-[1fr_120px_120px_100px] gap-3 px-4 pb-1 border-b border-black/5">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Product</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Cover Quantity</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Frame Quantity</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Row Total</span>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {products.map((p) => {
          const coverVal = Number(quantities[p.coverKey]) || 0;
          const frameVal = Number(quantities[p.frameKey]) || 0;
          const rowTotal = coverVal + frameVal;

          return (
            <div
              key={p.name}
              className={cn(
                "transition-all duration-300 rounded-2xl border bg-white",
                "sm:grid sm:grid-cols-[1fr_120px_120px_100px] sm:gap-3 sm:items-center sm:px-4 sm:py-3",
                "p-4 space-y-3 sm:space-y-0",
                rowTotal > 0
                  ? "border-orange-500/20 shadow-[0_4px_16px_rgba(249,115,22,0.04)]"
                  : "border-black/5"
              )}
            >
              {/* Product Label */}
              <div className="flex justify-between items-center sm:block">
                <span className="text-sm font-semibold text-gray-800">{p.name}</span>
                {/* Mobile Row Total Badge */}
                {rowTotal > 0 && (
                  <span className="sm:hidden text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-500/10">
                    {rowTotal} pcs
                  </span>
                )}
              </div>

              {/* Cover & Frame Inputs (Side-by-side on mobile, grid on desktop) */}
              <div className="grid grid-cols-2 gap-3 sm:contents">
                <div className="flex flex-col gap-1 sm:block">
                  <span className="sm:hidden text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Cover</span>
                  <QtyInput
                    id={`qty-${p.coverKey}`}
                    value={quantities[p.coverKey] || ""}
                    onChange={(e) => onChange(p.coverKey, e.target.value)}
                    placeholder="0"
                    className="py-3 sm:py-2"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:block">
                  <span className="sm:hidden text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Frame</span>
                  <QtyInput
                    id={`qty-${p.frameKey}`}
                    value={quantities[p.frameKey] || ""}
                    onChange={(e) => onChange(p.frameKey, e.target.value)}
                    placeholder="0"
                    className="py-3 sm:py-2"
                  />
                </div>
              </div>

              {/* Desktop Total Column */}
              <div className="hidden sm:block text-center">
                <span
                  className={cn(
                    "text-sm font-extrabold",
                    rowTotal > 0 ? "text-orange-500" : "text-gray-300"
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
      <div className="flex justify-end pt-3">
        <div className="flex items-center gap-3 px-5 py-2.5 bg-orange-500/5 rounded-2xl border border-orange-500/10 shadow-sm shadow-orange-500/5">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Grand Total</span>
          <span className="text-2xl font-black text-orange-500">{total}</span>
        </div>
      </div>
    </div>
  );
}

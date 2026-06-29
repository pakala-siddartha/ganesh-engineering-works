import { forwardRef } from "react";
import { cn } from "../../lib/utils";

/**
 * iOS-style Input component with rounded corners, focus shadows, and proper sizing
 */
export const Input = forwardRef(function Input(
  { label, error, className, id, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          "w-full bg-[#f2f2f7] border border-black/5 rounded-2xl px-4 py-3 text-sm text-[#1d1d1f]",
          "placeholder:text-gray-400",
          "focus:outline-none focus:bg-white focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/5",
          "transition-all duration-300 ease-out",
          error && "bg-red-50 border-red-200 focus:border-red-500 focus:ring-red-500/10",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-semibold px-1">{error}</p>
      )}
    </div>
  );
});

/**
 * iOS-style Select component
 */
export const Select = forwardRef(function Select(
  { label, error, className, id, children, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={cn(
          "w-full bg-[#f2f2f7] border border-black/5 rounded-2xl px-4 py-3 text-sm text-[#1d1d1f] appearance-none",
          "focus:outline-none focus:bg-white focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/5",
          "transition-all duration-300 ease-out",
          error && "bg-red-50 border-red-200",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500 font-semibold px-1">{error}</p>}
    </div>
  );
});

/**
 * iOS-style QtyInput for product lists
 */
export function QtyInput({ className, ...props }) {
  return (
    <input
      type="number"
      min="0"
      className={cn(
        "w-full bg-[#f2f2f7] border border-black/5 rounded-xl px-3 py-2 text-sm text-center text-[#1d1d1f]",
        "focus:outline-none focus:bg-white focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/5",
        "transition-all duration-300 ease-out",
        className
      )}
      {...props}
    />
  );
}

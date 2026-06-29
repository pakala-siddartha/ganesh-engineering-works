import { cn } from "../../lib/utils";

/**
 * Premium iOS Spring Button component
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-2xl cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-[0.97] hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0";

  const variants = {
    primary:
      "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-[0_8px_20px_rgba(249,115,22,0.2)] shadow-md shadow-orange-500/10",
    secondary:
      "bg-[#e8e8ed] text-[#1d1d1f] hover:bg-[#d2d2d7]",
    danger:
      "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-[0_8px_20px_rgba(239,68,68,0.2)] shadow-md shadow-red-500/10",
    ghost: "text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5",
    success:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-[0_8px_20px_rgba(16,185,129,0.2)] shadow-md shadow-emerald-500/10",
  };

  const sizes = {
    sm: "text-xs px-3.5 py-2",
    md: "text-sm px-4.5 py-2.5",
    lg: "text-base px-6 py-3.5",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

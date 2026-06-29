import { cn } from "../../lib/utils";

/**
 * Reusable Card container component (iOS Light style)
 */
export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-white border border-black/5 rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Metric Card for iOS dashboard stats
 */
export function MetricCard({ label, value, sub, icon: Icon, color = "orange", trend }) {
  const colorMap = {
    orange: {
      bg: "from-orange-500/10 to-amber-500/5",
      icon: "text-orange-500",
      iconBg: "bg-orange-50",
      border: "border-orange-500/10",
      badge: "bg-orange-50 text-orange-600",
      value: "text-orange-600",
    },
    emerald: {
      bg: "from-emerald-500/10 to-teal-500/5",
      icon: "text-emerald-500",
      iconBg: "bg-emerald-50",
      border: "border-emerald-500/10",
      badge: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-600",
    },
    sky: {
      bg: "from-sky-500/10 to-blue-500/5",
      icon: "text-sky-500",
      iconBg: "bg-sky-50",
      border: "border-sky-500/10",
      badge: "bg-sky-50 text-sky-600",
      value: "text-sky-600",
    },
    violet: {
      bg: "from-violet-500/10 to-fuchsia-500/5",
      icon: "text-violet-500",
      iconBg: "bg-violet-50",
      border: "border-violet-500/10",
      badge: "bg-violet-50 text-violet-600",
      value: "text-violet-600",
    },
    amber: {
      bg: "from-amber-500/10 to-yellow-500/5",
      icon: "text-amber-500",
      iconBg: "bg-amber-50",
      border: "border-amber-500/10",
      badge: "bg-amber-50 text-amber-600",
      value: "text-amber-600",
    },
  };

  const c = colorMap[color] || colorMap.orange;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border p-5 bg-gradient-to-br bg-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)]",
        c.bg,
        c.border
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
          <p className={cn("text-3xl font-extrabold tracking-tight", c.value)}>
            {value ?? "0"}
          </p>
          {sub && <p className="text-xs text-gray-400 mt-1 font-medium">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-2xl", c.iconBg, c.icon)}>
            <Icon size={20} />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className={cn("mt-3 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full", c.badge)}>
          {trend}
        </div>
      )}
    </div>
  );
}

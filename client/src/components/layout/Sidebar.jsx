import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Factory,
  ShoppingCart,
  Package,
  Layers,
  BarChart3,
  Building2,
  ChevronRight,
} from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { cn } from "../../lib/utils";

const dailyNav = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Production", href: ROUTES.PRODUCTION, icon: Factory },
  { label: "Sales", href: ROUTES.SALES, icon: ShoppingCart },
  { label: "Stock", href: ROUTES.STOCK, icon: Package },
  { label: "Cement", href: ROUTES.CEMENT, icon: Layers },
  { label: "GHMC Work", href: ROUTES.GHMC, icon: Building2 },
  { label: "Statistics", href: ROUTES.STATISTICS, icon: BarChart3 },
];

function NavItem({ href, icon: Icon, label, exact, isGhmcSection }) {
  return (
    <NavLink
      to={href}
      end={exact}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out active:scale-[0.98]",
          isActive
            ? isGhmcSection
              ? "bg-violet-500/10 text-violet-600 shadow-[0_4px_12px_rgba(139,92,246,0.12)] border-0"
              : "bg-orange-500/10 text-orange-600 shadow-[0_4px_12px_rgba(249,115,22,0.12)] border-0"
            : "text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5"
        )
      }
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-white border-r border-black/5 min-h-screen sticky top-0">
      {/* Brand Logo & Name */}
      <div className="px-5 py-6 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-black/5 flex items-center justify-center bg-white shrink-0 shadow-md shadow-orange-500/10">
            <img src="/favicon.jpeg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1d1d1f] leading-tight">
              Ganesh Engineering Works
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Daily section */}
        <div>
          <p className="px-3.5 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#86868b]">
            Daily Operations
          </p>
          <div className="space-y-1">
            {dailyNav.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                exact={item.href === ROUTES.DASHBOARD}
                isGhmcSection={item.href === ROUTES.GHMC}
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}

import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Factory,
  ShoppingCart,
  Package,
  Menu,
  X,
  Layers,
  BarChart3,
  Building2,
  ChevronRight,
  LogOut
} from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

export function BottomNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const moreLinks = [
    { label: "Cement Stock", href: ROUTES.CEMENT, icon: Layers },
    { label: "Statistics", href: ROUTES.STATISTICS, icon: BarChart3 },
    { label: "GHMC Dashboard", href: ROUTES.GHMC, icon: Building2 },
    { label: "GHMC Production", href: ROUTES.GHMC_PRODUCTION, icon: Factory },
    { label: "GHMC Sales", href: ROUTES.GHMC_SALES, icon: ShoppingCart },
    { label: "GHMC Stock", href: ROUTES.GHMC_STOCK, icon: Package },
    { label: "GHMC Cement", href: ROUTES.GHMC_CEMENT, icon: Layers },
    { label: "GHMC Statistics", href: ROUTES.GHMC_STATISTICS, icon: BarChart3 },
  ];

  return (
    <>
      {/* Bottom Bar Container */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/80 backdrop-blur-xl border-t border-black/5 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] px-2 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          <NavLink
            to={ROUTES.DASHBOARD}
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1.5 gap-0.5 transition-colors ${
                isActive ? "text-orange-500 font-semibold" : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px]">Home</span>
          </NavLink>

          <NavLink
            to={ROUTES.PRODUCTION}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1.5 gap-0.5 transition-colors ${
                isActive ? "text-orange-500 font-semibold" : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            <Factory size={20} />
            <span className="text-[10px]">Production</span>
          </NavLink>

          <NavLink
            to={ROUTES.SALES}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1.5 gap-0.5 transition-colors ${
                isActive ? "text-orange-500 font-semibold" : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            <ShoppingCart size={20} />
            <span className="text-[10px]">Sales</span>
          </NavLink>

          <NavLink
            to={ROUTES.STOCK}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1.5 gap-0.5 transition-colors ${
                isActive ? "text-orange-500 font-semibold" : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            <Package size={20} />
            <span className="text-[10px]">Stock</span>
          </NavLink>

          <button
            onClick={() => setIsOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 gap-0.5 transition-colors text-gray-400 hover:text-gray-600`}
          >
            <Menu size={20} />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>

      {/* Slide-up iOS Bottom Drawer / Sheet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[#f5f5f7] rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Drag Handle Area */}
            <div className="flex flex-col items-center pt-3 pb-2 border-b border-black/5 bg-white">
              <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-3" />
              <div className="flex items-center justify-between w-full px-5">
                <span className="text-base font-bold text-gray-900">All Operations</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Daily Sections */}
              <div className="bg-white rounded-2xl p-2 shadow-sm space-y-1">
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Daily Work
                </p>
                <NavLink
                  to={ROUTES.CEMENT}
                  onClick={handleLinkClick}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <Layers size={18} className="text-orange-500" />
                    <span className="text-sm font-medium">Cement Stock</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </NavLink>
                <NavLink
                  to={ROUTES.STATISTICS}
                  onClick={handleLinkClick}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 size={18} className="text-orange-500" />
                    <span className="text-sm font-medium">Statistics</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </NavLink>
              </div>

              {/* GHMC Sections */}
              <div className="bg-white rounded-2xl p-2 shadow-sm space-y-1">
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  GHMC Work
                </p>
                {moreLinks.slice(2).map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="text-violet-500" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </NavLink>
                ))}
              </div>

              {/* Logout Button */}
              <div className="pt-2">
                <Button
                  variant="danger"
                  className="w-full justify-center py-3 rounded-2xl"
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

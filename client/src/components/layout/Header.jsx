import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getHeaderDate } from "../../utils/dateUtils";
import { Button } from "../ui/Button";

export function Header({ title, subtitle }) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-white/70 backdrop-blur-md border-b border-black/5">
      <div>
        {subtitle && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500 mb-0.5">
            {subtitle}
          </p>
        )}
        <h2 className="text-lg font-extrabold text-[#1d1d1f] tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-xs text-gray-500 hidden md:block font-medium">{getHeaderDate()}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="gap-2 text-[#86868b] hover:text-red-500 hover:bg-red-50/50 rounded-xl"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

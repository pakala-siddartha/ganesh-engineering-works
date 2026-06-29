import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function Layout({ children }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      {/* Sidebar - Desktop Only */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Nav - Mobile Only */}
      <BottomNav />
    </div>
  );
}

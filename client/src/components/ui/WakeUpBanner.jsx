import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

/**
 * Automatically shows when the API is slow to respond (Render cold start).
 * Listens for the custom "api:slow" and "api:ready" events fired by api.js.
 */
export function WakeUpBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    window.addEventListener("api:slow", show);
    window.addEventListener("api:ready", hide);
    return () => {
      window.removeEventListener("api:slow", show);
      window.removeEventListener("api:ready", hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top-2 duration-300">
      {/* Progress bar */}
      <div className="h-1 bg-amber-200 overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full"
          style={{
            animation: "wakeup-progress 50s linear forwards",
          }}
        />
      </div>

      {/* Banner body */}
      <div className="flex items-center justify-center gap-3 bg-amber-50 border-b border-amber-200 px-4 py-2.5">
        {/* Spinning icon */}
        <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex-shrink-0" />
        <div className="text-center">
          <p className="text-xs font-bold text-amber-800">
            ⚡ Server is waking up — please wait a moment…
          </p>
          <p className="text-[10px] text-amber-600 mt-0.5">
            First visit takes ~30–60 seconds. Won't happen again until the site is idle for 15 min.
          </p>
        </div>
        <Zap size={14} className="text-amber-500 flex-shrink-0" />
      </div>

      <style>{`
        @keyframes wakeup-progress {
          from { width: 5%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

/**
 * Accessible modal/dialog component
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md",
}) {
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "relative w-full bg-[#1a1a24] border border-[#2d2d3d] rounded-2xl shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200",
          sizes[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2d3d]">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white rounded-lg p-1 hover:bg-[#22222f] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/**
 * Confirm dialog for destructive / important actions
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  loading = false,
  details = [],
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        {message && <p className="text-gray-300 text-sm">{message}</p>}

        {details.length > 0 && (
          <div className="bg-[#22222f] rounded-lg px-4 py-3 space-y-1">
            {details.map((d, i) => (
              <p key={i} className="text-sm text-gray-400">
                {d}
              </p>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

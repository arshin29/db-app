"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { RotateCcw, AlertTriangle, CheckCircle2, Database, Sparkles, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { resetAndSeedDatabase, clearDatabase } from "@/lib/actions";

const emptySubscribe = () => () => {};

interface ResetDatabaseButtonProps {
  className?: string;
  variant?: "subnav" | "footer" | "nav" | "banner";
  label?: string;
}

export function ResetDatabaseButton({
  className = "",
  variant = "subnav",
  label,
}: ResetDatabaseButtonProps) {
  const router = useRouter();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<"seed" | "clear" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !actionType) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, actionType]);

  const handleSeed = async () => {
    setActionType("seed");
    try {
      const res = await resetAndSeedDatabase();
      if (res.success) {
        setIsOpen(false);
        setToastMessage("Database reset & seeded with 5 demo jobs");
        router.refresh();
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(res.error || "Failed to reset and seed database");
      }
    } catch (err) {
      console.error("Reset and seed error:", err);
      alert("Error resetting database. Please try again.");
    } finally {
      setActionType(null);
    }
  };

  const handleClear = async () => {
    setActionType("clear");
    try {
      const res = await clearDatabase();
      if (res.success) {
        setIsOpen(false);
        setToastMessage("Database wiped clean (0 jobs)");
        router.refresh();
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(res.error || "Failed to clear database");
      }
    } catch (err) {
      console.error("Clear database error:", err);
      alert("Error clearing database. Please try again.");
    } finally {
      setActionType(null);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {variant === "subnav" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-[#1d1d1f] hover:text-[#0066cc] bg-white border border-[#e5e5ea] hover:border-[#0066cc]/40 transition-all cursor-pointer active:scale-95 shadow-xs select-none shrink-0 ${className}`}
          title="Reset & Seed Database with calibrated demo jobs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#0066cc]" />
          <span>
            {label || (
              <>
                <span className="hidden sm:inline">Reset &amp; Seed Database</span>
                <span className="sm:hidden">Reset &amp; Seed</span>
              </>
            )}
          </span>
        </button>
      ) : variant === "nav" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 text-[11px] text-[#86868b] hover:text-white transition-colors cursor-pointer ${className}`}
          title="Reset & Seed Database"
        >
          <RotateCcw className="w-3 h-3 text-[#34c759]" />
          <span>{label || "Reset & Seed DB"}</span>
        </button>
      ) : variant === "banner" ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(true)}
          className={className}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{label || "Reset & Seed Database"}</span>
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 text-[12px] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer ${className}`}
        >
          <RotateCcw className="w-3 h-3" />
          <span>{label || "Reset & Seed Database"}</span>
        </button>
      )}

      {/* Apple-style Confirmation Dialog portaled to body */}
      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => {
                if (!actionType) setIsOpen(false);
              }}
            />

            {/* Dialog Box */}
            <div className="relative z-10 w-full max-w-[500px] overflow-hidden rounded-[24px] bg-white p-6 sm:p-7 shadow-2xl border border-[#e5e5ea] animate-in fade-in zoom-in-95 duration-200 space-y-6">
              {/* Header */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0f4f9] text-[#0066cc]">
                  <RotateCcw className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[18px] font-semibold text-[#1d1d1f] tracking-tight">
                    Reset &amp; Seed Database
                  </h3>
                  <p className="text-[13.5px] text-[#6e6e73] leading-relaxed">
                    Manage your SQLite demo data. Choose an action below:
                  </p>
                </div>
              </div>

              {/* Action Cards */}
              <div className="space-y-3">
                {/* Primary Card: Reset & Seed */}
                <div className="p-4 rounded-[16px] bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#0066cc]/50 transition-all flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-[#e0f2fe] text-[#0284c7]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-[14px] font-semibold text-[#1d1d1f]">
                        Reset &amp; Seed Demo Data (Recommended)
                      </span>
                    </div>
                    <span className="text-[11px] font-medium bg-[#dbeafe] text-[#1e40af] px-2 py-0.5 rounded-full">
                      5 Curated Jobs
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#64748b] leading-relaxed">
                    Wipes existing entries and seeds 5 realistic 3D print jobs (Phone Stand, Laptop Stand, Desk Organizer, Vase, Jewelry Box) with calibrated Bambu Lab P2S material costs and Indian Rupee (₹) pricing.
                  </p>
                  <div className="pt-1 flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSeed}
                      isLoading={actionType === "seed"}
                      disabled={!!actionType}
                      className="px-4 text-[13px] shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset &amp; Seed Database</span>
                    </Button>
                  </div>
                </div>

                {/* Secondary Card: Wipe to Empty */}
                <div className="p-4 rounded-[16px] bg-[#fafafc] border border-[#e5e5ea] hover:border-[#d2d2d7] transition-all flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-[#fee2e2] text-[#dc2626]">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <span className="text-[14px] font-semibold text-[#1d1d1f]">
                      Wipe Database to Empty (0 Jobs)
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#64748b] leading-relaxed">
                    Deletes all print job records completely to test empty state flows and fresh order creation from zero.
                  </p>
                  <div className="pt-1 flex justify-end">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={handleClear}
                      isLoading={actionType === "clear"}
                      disabled={!!actionType}
                      className="px-4 text-[13px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Wipe to 0 Jobs</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end pt-1 border-t border-[#f0f0f2]">
                <Button
                  type="button"
                  variant="pearl"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={!!actionType}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Floating Success Toast portaled to body */}
      {toastMessage &&
        mounted &&
        createPortal(
          <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#1d1d1f] text-white text-[13px] font-medium shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
            <span>{toastMessage}</span>
          </div>,
          document.body
        )}
    </>
  );
}

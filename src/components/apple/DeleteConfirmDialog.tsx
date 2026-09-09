"use client";

import { useEffect } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  jobTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  jobTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isDeleting) onCancel();
        }}
      />

      {/* Dialog Box */}
      <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[20px] bg-white p-6 shadow-2xl border border-[#e5e5ea] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff2f2] text-[#d70015]">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">
              Delete Print Job?
            </h3>
            <p className="mt-1 text-[14px] text-[#6e6e73] leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-medium text-[#1d1d1f]">&quot;{jobTitle}&quot;</span>?
              This action cannot be undone and will remove all cost and profit records for this job.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="pearl"
            size="sm"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
          >
            Delete Job
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  formatINR,
  formatDate,
  formatPrintTime,
  calculateProfitMargin,
  JobStatus,
} from "@/lib/calculations";
import { StatusBadge } from "@/components/apple/StatusBadge";
import { Button } from "@/components/apple/Button";
import { Card } from "@/components/apple/Card";
import { DeleteConfirmDialog } from "@/components/apple/DeleteConfirmDialog";
import { updateJobStatus, deletePrintJob } from "@/lib/actions";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Printer,
  Clock,
  Layers,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  User,
  IndianRupee,
  Share2,
} from "lucide-react";

interface JobDetailsClientProps {
  job: {
    id: string;
    customerName: string;
    productName: string;
    quantity: number;
    filamentUsedGrams: number;
    printTimeMinutes: number;
    filamentCost: number;
    electricityCost: number;
    otherCost: number;
    totalCost: number;
    sellingPrice: number;
    profit: number;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
}

export function JobDetailsClient({ job }: JobDetailsClientProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<string>(job.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const profitMargin = calculateProfitMargin(job.profit, job.sellingPrice);

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (newStatus === currentStatus || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await updateJobStatus(job.id, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
        router.refresh();
      } else {
        alert(res.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deletePrintJob(job.id);
      if (res.success) {
        router.push("/jobs");
        router.refresh();
      } else {
        alert(res.error || "Failed to delete job");
        setIsDeleting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting print job");
      setIsDeleting(false);
    }
  };

  const statusOptions: {
    value: JobStatus;
    label: string;
    activeStyle: string;
    dotColor: string;
  }[] = [
    { value: "PENDING", label: "Pending", activeStyle: "bg-[#0071e3] text-white shadow-sm", dotColor: "bg-[#0071e3]" },
    { value: "PRINTING", label: "Printing", activeStyle: "bg-[#d97706] text-white shadow-sm", dotColor: "bg-[#f59e0b]" },
    { value: "COMPLETED", label: "Completed", activeStyle: "bg-[#16a34a] text-white shadow-sm", dotColor: "bg-[#16a34a]" },
    { value: "CANCELLED", label: "Cancelled", activeStyle: "bg-[#dc2626] text-white shadow-sm", dotColor: "bg-[#dc2626]" },
  ];

  return (
    <div className="space-y-8">
      {/* Top Bar: Back & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5ea] pb-5">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0066cc] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Print Jobs</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href={`/jobs/${job.id}/edit`}>
            <Button variant="pearl" size="sm" className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Job</span>
            </Button>
          </Link>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Hero Product Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[14px] text-[#86868b]">
              Job #{job.id.slice(-4).toUpperCase()}
            </span>
            <StatusBadge status={currentStatus} size="md" />
          </div>

          <h1 className="mt-2 text-[32px] sm:text-[40px] font-semibold text-[#1d1d1f] tracking-tight">
            {job.productName}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#6e6e73]">
            <span className="flex items-center gap-1 text-[#1d1d1f] font-medium">
              <User className="w-4 h-4 text-[#86868b]" />
              {job.customerName}
            </span>
            <span>•</span>
            <span>Ordered: {formatDate(job.createdAt)}</span>
            <span>•</span>
            <span>Batch Quantity: {job.quantity} units</span>
          </div>
        </div>

        {/* Quick status segmented bar */}
        <div className="rounded-[16px] bg-white border border-[#e5e5ea] p-2 sm:p-2.5 shadow-sm overflow-hidden">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] px-1 mb-1.5">
            Workflow Status
          </div>
          <div className="overflow-x-auto no-scrollbar -mx-1 px-1 py-0.5">
            <div className="inline-flex items-center gap-1 sm:gap-1.5 min-w-full sm:min-w-0 justify-between sm:justify-start">
              {statusOptions.map((s) => {
                const isActive = currentStatus === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(s.value)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all shrink-0 active:scale-95 ${
                      isActive
                        ? s.activeStyle
                        : "text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f2f2f7]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? "bg-white" : s.dotColor
                      }`}
                    />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Specs and Technical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Quantity Card */}
        <Card className="flex items-center gap-4" padding="md">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#fafafc] border border-[#e5e5ea] text-[#1d1d1f]">
            <Sparkles className="w-5 h-5 text-[#0066cc]" />
          </div>
          <div>
            <div className="text-[12px] text-[#86868b]">Quantity</div>
            <div className="text-[20px] font-semibold text-[#1d1d1f]">
              {job.quantity} {job.quantity === 1 ? "unit" : "units"}
            </div>
          </div>
        </Card>

        {/* Filament Usage */}
        <Card className="flex items-center gap-4" padding="md">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#fafafc] border border-[#e5e5ea] text-[#1d1d1f]">
            <Layers className="w-5 h-5 text-[#0066cc]" />
          </div>
          <div>
            <div className="text-[12px] text-[#86868b]">Filament Used</div>
            <div className="text-[20px] font-semibold text-[#1d1d1f]">
              {job.filamentUsedGrams}g
            </div>
            {job.quantity > 1 && (
              <div className="text-[11px] text-[#0066cc] font-medium mt-0.5">
                {Math.round(job.filamentUsedGrams / job.quantity)}g per print
              </div>
            )}
          </div>
        </Card>

        {/* Print Time */}
        <Card className="flex items-center gap-4" padding="md">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#fafafc] border border-[#e5e5ea] text-[#1d1d1f]">
            <Clock className="w-5 h-5 text-[#0066cc]" />
          </div>
          <div>
            <div className="text-[12px] text-[#86868b]">Print Time</div>
            <div className="text-[20px] font-semibold text-[#1d1d1f]">
              {formatPrintTime(job.printTimeMinutes)}
            </div>
            {job.quantity > 1 && (
              <div className="text-[11px] text-[#0066cc] font-medium mt-0.5">
                {formatPrintTime(Math.round(job.printTimeMinutes / job.quantity))} per print
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Financial Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cost Breakdown (6 cols) */}
        <Card className="lg:col-span-6 space-y-5" padding="lg">
          <div className="border-b border-[#f0f0f2] pb-3 flex items-center justify-between">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-[#0066cc]" />
              Production Cost
            </h3>
            <span className="text-[13px] font-medium text-[#86868b]">
              {job.quantity > 1 ? `Batch of ${job.quantity} units` : "Direct Expenses"}
            </span>
          </div>

          <div className="divide-y divide-[#f0f0f2] text-[14px]">
            <div className="py-3 flex items-center justify-between">
              <span className="text-[#6e6e73]">Filament Material Cost</span>
              <span className="font-medium text-[#1d1d1f]">{formatINR(job.filamentCost)}</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-[#6e6e73]">Electricity &amp; Heating Cost</span>
              <span className="font-medium text-[#1d1d1f]">{formatINR(job.electricityCost)}</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-[#6e6e73]">Other / Post-processing Hardware</span>
              <span className="font-medium text-[#1d1d1f]">{formatINR(job.otherCost)}</span>
            </div>
            <div className="py-4 flex items-center justify-between bg-[#fafafc] -mx-6 px-6 border-y border-[#f0f0f2]">
              <span className="font-semibold text-[#1d1d1f]">Total Production Cost</span>
              <span className="font-bold text-[18px] text-[#1d1d1f]">
                {formatINR(job.totalCost)}
              </span>
            </div>
          </div>

          <div className="text-[12px] text-[#86868b] leading-relaxed pt-1 flex items-center justify-between">
            <span>Unit Production Expense:</span>
            <span className="font-semibold text-[#1d1d1f]">
              {formatINR(job.quantity > 0 ? job.totalCost / job.quantity : 0)} / unit
            </span>
          </div>
        </Card>

        {/* Pricing & Profitability (6 cols) */}
        <Card className="lg:col-span-6 space-y-5 flex flex-col justify-between" padding="lg">
          <div>
            <div className="border-b border-[#f0f0f2] pb-3 flex items-center justify-between">
              <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#1e7832]" />
                Pricing &amp; Net Profit
              </h3>
              <span className="text-[13px] font-medium text-[#1e7832] bg-[#eaf6eb] px-2.5 py-0.5 rounded-full">
                {profitMargin}% Margin
              </span>
            </div>

            <div className="divide-y divide-[#f0f0f2] text-[14px] mt-2">
              <div className="py-3 flex items-center justify-between">
                <span className="text-[#6e6e73]">Selling Price Quoted</span>
                <span className="font-bold text-[16px] text-[#1d1d1f]">
                  {formatINR(job.sellingPrice)}
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-[#6e6e73]">Less: Total Cost</span>
                <span className="font-medium text-[#d70015]">
                  - {formatINR(job.totalCost)}
                </span>
              </div>
              <div className="py-4 flex items-baseline justify-between bg-[#fafafc] -mx-6 px-6 border-y border-[#f0f0f2]">
                <span className="font-semibold text-[#1d1d1f]">Net Business Profit</span>
                <span
                  className={`text-[26px] font-bold tracking-tight ${
                    job.profit >= 0 ? "text-[#1e7832]" : "text-[#d70015]"
                  }`}
                >
                  {formatINR(job.profit)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#f0f0f2]">
            <div className="flex items-center justify-between text-[12px] text-[#86868b] mb-1.5">
              <span>Profit Share of Revenue</span>
              <span className="font-medium text-[#1d1d1f]">{profitMargin}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#f0f0f2] overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  job.profit >= 0 ? "bg-[#34c759]" : "bg-[#ff3b30]"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, profitMargin))}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={showDeleteModal}
        jobTitle={job.productName}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

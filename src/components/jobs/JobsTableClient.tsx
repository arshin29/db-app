"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  formatINR,
  formatDate,
  formatPrintTime,
  formatJobId,
  JobStatus,
} from "@/lib/calculations";
import { StatusBadge } from "@/components/apple/StatusBadge";
import { Button } from "@/components/apple/Button";
import { DeleteConfirmDialog } from "@/components/apple/DeleteConfirmDialog";
import { ResetDatabaseButton } from "@/components/apple/ResetDatabaseButton";
import { deletePrintJob, updateJobStatus } from "@/lib/actions";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
  Clock,
  Coins,
  Package,
  Plus,
} from "lucide-react";

export interface JobItem {
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
}

interface JobsTableClientProps {
  initialJobs: JobItem[];
}

export function JobsTableClient({ initialJobs }: JobsTableClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "profit-desc" | "time-desc">(
    "date-desc"
  );

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<JobItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status updating state
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    return initialJobs
      .filter((job) => {
        const matchesQuery =
          searchQuery.trim() === "" ||
          job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.productName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "ALL" || job.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "date-asc") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "profit-desc") {
          return b.profit - a.profit;
        }
        if (sortBy === "time-desc") {
          return b.printTimeMinutes - a.printTimeMinutes;
        }
        return 0;
      });
  }, [initialJobs, searchQuery, statusFilter, sortBy]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deletePrintJob(deleteTarget.id);
      if (res.success) {
        setDeleteTarget(null);
        router.refresh();
      } else {
        alert(res.error || "Failed to delete job");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting print job");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: JobStatus) => {
    setUpdatingId(id);
    try {
      await updateJobStatus(id, newStatus);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Printing", value: "PRINTING" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="space-y-6">
      {/* Controls Bar: Apple-style Search & Filter Chips */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input (Apple pill input) */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
          <input
            type="text"
            placeholder="Search by customer or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[44px] rounded-full bg-white pl-11 pr-4 text-[14px] text-[#1d1d1f] placeholder:text-[#86868b] border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#86868b] hover:text-[#1d1d1f]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Horizontally scrollable status filters on mobile */}
          <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-0.5">
            <div className="inline-flex items-center rounded-full bg-[#e8e8ed] p-1 text-[13px] shrink-0">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`rounded-full px-3.5 py-1 font-medium transition-all shrink-0 ${
                    statusFilter === s.value
                      ? "bg-white text-[#1d1d1f] shadow-sm"
                      : "text-[#6e6e73] hover:text-[#1d1d1f]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Selector */}
          <div className="relative inline-flex items-center self-start sm:self-auto shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-[36px] appearance-none rounded-full bg-white pl-3.5 pr-8 text-[13px] font-medium text-[#1d1d1f] border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="profit-desc">Highest Profit</option>
              <option value="time-desc">Longest Print</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-3 w-3 h-3 text-[#86868b]" />
          </div>
        </div>
      </div>

      {/* Results Count & Summary */}
      <div className="flex items-center justify-between text-[13px] text-[#6e6e73] px-1">
        <span>
          Showing <span className="font-medium text-[#1d1d1f]">{filteredJobs.length}</span> of{" "}
          {initialJobs.length} jobs
        </span>
        {statusFilter !== "ALL" && (
          <span className="text-[12px] bg-[#e8e8ed] text-[#48484a] px-2.5 py-0.5 rounded-full">
            Filtered: {statusFilter}
          </span>
        )}
      </div>

      {/* Jobs Presentation */}
      {initialJobs.length === 0 ? (
        <div className="rounded-[18px] border border-[#e5e5ea] bg-white p-12 sm:p-16 text-center">
          <Package className="mx-auto h-12 w-12 text-[#a1a1a6] stroke-[1.5]" />
          <h3 className="mt-3 text-[18px] font-semibold text-[#1d1d1f]">
            Database is Empty
          </h3>
          <p className="mt-1 text-[14px] text-[#6e6e73] max-w-md mx-auto">
            You currently have 0 print jobs tracked. Add your first custom job or restore the calibrated demo jobs.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/jobs/new">
              <Button variant="primary" size="sm" className="gap-1.5">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add First Job</span>
              </Button>
            </Link>
            <ResetDatabaseButton variant="banner" label="Reset & Seed Database" />
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-[18px] border border-[#e5e5ea] bg-white p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-[#a1a1a6] stroke-[1.5]" />
          <h3 className="mt-3 text-[17px] font-semibold text-[#1d1d1f]">
            No matching jobs found
          </h3>
          <p className="mt-1 text-[14px] text-[#6e6e73]">
            Try adjusting your search query or status filter.
          </p>
          {(searchQuery || statusFilter !== "ALL") && (
            <div className="mt-4">
              <Button
                variant="pearl"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-[#e5e5ea] bg-white">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-[#e5e5ea] bg-[#fafafc] text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Product &amp; Qty</th>
                  <th className="py-3.5 px-5">Print Time</th>
                  <th className="py-3.5 px-5">Cost</th>
                  <th className="py-3.5 px-5">Selling Price</th>
                  <th className="py-3.5 px-5">Profit</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f2]">
                {filteredJobs.map((job, idx) => (
                  <tr
                    key={job.id}
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="hover:bg-[#f5f5f7] transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-5 font-mono text-[13px] font-medium text-[#1d1d1f]">
                      {formatJobId(idx + 1)}
                    </td>

                    <td className="py-4 px-5 font-medium text-[#1d1d1f]">
                      {job.customerName}
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-medium text-[#1d1d1f]">
                        {job.productName}
                      </div>
                      <div className="text-[12px] text-[#86868b]">
                        Qty: {job.quantity} • {job.filamentUsedGrams}g filament
                      </div>
                    </td>

                    <td className="py-4 px-5 text-[13px] text-[#1d1d1f]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#86868b]" />
                        {formatPrintTime(job.printTimeMinutes)}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-[13px] text-[#6e6e73]">
                      {formatINR(job.totalCost)}
                    </td>

                    <td className="py-4 px-5 font-medium text-[#1d1d1f]">
                      {formatINR(job.sellingPrice)}
                    </td>

                    <td className="py-4 px-5 font-medium text-[#1e7832]">
                      <div>{formatINR(job.profit)}</div>
                      <div className="text-[11px] text-[#28a745]">
                        {job.sellingPrice > 0
                          ? `${((job.profit / job.sellingPrice) * 100).toFixed(0)}% margin`
                          : "0%"}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <StatusBadge status={job.status} size="sm" />
                    </td>

                    <td className="py-4 px-5 text-[12px] text-[#86868b] whitespace-nowrap">
                      {formatDate(job.createdAt)}
                    </td>

                    <td
                      className="py-4 px-5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center justify-end gap-1">
                        <Link
                          href={`/jobs/${job.id}/edit`}
                          title="Edit Job"
                          className="p-1.5 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#e8e8ed] transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(job)}
                          title="Delete Job"
                          className="p-1.5 rounded-full text-[#86868b] hover:text-[#d70015] hover:bg-[#fff2f2] transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card List */}
          <div className="lg:hidden divide-y divide-[#f0f0f2]">
            {filteredJobs.map((job, idx) => (
              <div
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="p-4 sm:p-5 hover:bg-[#fafafc] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[12px] text-[#86868b]">
                      {formatJobId(idx + 1)}
                    </span>
                    <h4 className="text-[16px] font-semibold text-[#1d1d1f] mt-0.5">
                      {job.productName}
                    </h4>
                    <p className="text-[13px] text-[#6e6e73]">
                      Customer: <span className="text-[#1d1d1f]">{job.customerName}</span> • Qty: {job.quantity}
                    </p>
                  </div>
                  <StatusBadge status={job.status} size="sm" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-[12px] bg-[#fafafc] p-2.5 text-center text-[12px] border border-[#f0f0f2]">
                  <div>
                    <div className="text-[#86868b]">Time</div>
                    <div className="font-medium text-[#1d1d1f] mt-0.5">
                      {formatPrintTime(job.printTimeMinutes)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#86868b]">Total Cost</div>
                    <div className="font-medium text-[#1d1d1f] mt-0.5">
                      {formatINR(job.totalCost)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#86868b]">Profit</div>
                    <div className="font-semibold text-[#1e7832] mt-0.5">
                      {formatINR(job.profit)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#f0f0f2]">
                  <span className="text-[12px] text-[#86868b]">
                    {formatDate(job.createdAt)}
                  </span>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/jobs/${job.id}/edit`}
                      className="text-[13px] font-medium text-[#1d1d1f] px-2.5 py-1 rounded-full hover:bg-black/5"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(job)}
                      className="text-[13px] font-medium text-[#d70015] px-2.5 py-1 rounded-full hover:bg-[#fff2f2]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        jobTitle={deleteTarget?.productName || ""}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR, formatDate, formatJobId } from "@/lib/calculations";
import { StatusBadge } from "@/components/apple/StatusBadge";
import { Card } from "@/components/apple/Card";
import { RecentJobsTable } from "@/components/dashboard/RecentJobsTable";
import {
  Plus,
  ArrowRight,
  TrendingUp,
  Printer,
  Clock,
  CheckCircle2,
  Package,
} from "lucide-react";

export const revalidate = 0; // Dynamic data directly from SQLite

export default async function DashboardPage() {
  const jobs = await prisma.printJob.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter((j) => j.status === "PENDING").length;
  const printingJobs = jobs.filter((j) => j.status === "PRINTING").length;
  const completedJobs = jobs.filter((j) => j.status === "COMPLETED").length;
  const cancelledJobs = jobs.filter((j) => j.status === "CANCELLED").length;

  const totalRevenue = jobs.reduce((sum, j) => sum + (j.sellingPrice || 0), 0);
  const totalCost = jobs.reduce((sum, j) => sum + (j.totalCost || 0), 0);
  const totalProfit = jobs.reduce((sum, j) => sum + (j.profit || 0), 0);
  const overallMargin =
    totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  const recentJobs = jobs.slice(0, 5);

  const currentDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e5e5ea] pb-6">
        <div>
          <span className="text-[13px] font-medium tracking-wide uppercase text-[#86868b]">
            {currentDate}
          </span>
          <h1 className="mt-1 text-[28px] sm:text-[36px] font-semibold text-[#1d1d1f] tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-[15px] sm:text-[17px] text-[#6e6e73]">
            Track printing operations, filament expenditures, and business profit.
          </p>
        </div>

        <div>
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-5 py-2.5 text-[14px] font-medium text-white shadow-sm transition-all active:scale-[0.96]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Print Job</span>
          </Link>
        </div>
      </div>

      {/* Main Financial & Operation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Financial Health (7 columns) */}
        <Card className="lg:col-span-7 flex flex-col justify-between" padding="lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium tracking-wide text-[#86868b] uppercase">
                Financial Summary
              </span>
              <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1e7832] bg-[#eaf6eb] px-2.5 py-0.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                {overallMargin}% Net Margin
              </span>
            </div>

            <div className="mt-4">
              <div className="text-[13px] text-[#6e6e73]">Total Net Profit</div>
              <div className="text-[36px] sm:text-[42px] font-semibold tracking-tight text-[#1d1d1f]">
                {formatINR(totalProfit)}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#f0f0f2] grid grid-cols-2 gap-4">
            <div>
              <div className="text-[12px] font-medium text-[#86868b]">Gross Revenue</div>
              <div className="mt-1 text-[20px] sm:text-[22px] font-semibold text-[#1d1d1f]">
                {formatINR(totalRevenue)}
              </div>
              <div className="text-[12px] text-[#86868b] mt-0.5">Across {totalJobs} jobs</div>
            </div>
            <div>
              <div className="text-[12px] font-medium text-[#86868b]">Production Cost</div>
              <div className="mt-1 text-[20px] sm:text-[22px] font-semibold text-[#6e6e73]">
                {formatINR(totalCost)}
              </div>
              <div className="text-[12px] text-[#86868b] mt-0.5">Filament, energy, other</div>
            </div>
          </div>
        </Card>

        {/* Right: Job Status Distribution (5 columns) */}
        <Card className="lg:col-span-5 flex flex-col justify-between" padding="lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium tracking-wide text-[#86868b] uppercase">
                Queue &amp; Production
              </span>
              <span className="text-[13px] font-medium text-[#1d1d1f]">
                {totalJobs} Total Jobs
              </span>
            </div>

            {/* Status counts */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-[14px] bg-[#fafafc] border border-[#e5e5ea] p-3">
                <div className="flex items-center justify-center text-[#9c5800] mb-1">
                  <Printer className="w-4 h-4 animate-pulse" />
                </div>
                <div className="text-[22px] font-semibold text-[#1d1d1f]">
                  {printingJobs}
                </div>
                <div className="text-[11px] font-medium text-[#6e6e73]">Printing</div>
              </div>

              <div className="rounded-[14px] bg-[#fafafc] border border-[#e5e5ea] p-3">
                <div className="flex items-center justify-center text-[#48484a] mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-[22px] font-semibold text-[#1d1d1f]">
                  {pendingJobs}
                </div>
                <div className="text-[11px] font-medium text-[#6e6e73]">Pending</div>
              </div>

              <div className="rounded-[14px] bg-[#fafafc] border border-[#e5e5ea] p-3">
                <div className="flex items-center justify-center text-[#1e7832] mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-[22px] font-semibold text-[#1d1d1f]">
                  {completedJobs}
                </div>
                <div className="text-[11px] font-medium text-[#6e6e73]">Completed</div>
              </div>
            </div>
          </div>

          {/* Clean Apple distribution bar */}
          <div className="mt-6 pt-4 border-t border-[#f0f0f2]">
            <div className="flex items-center justify-between text-[11px] text-[#86868b] mb-2">
              <span>Status Ratio</span>
              <span>
                {printingJobs} Active • {pendingJobs} Queued • {completedJobs} Done
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#f0f0f2] overflow-hidden flex">
              {totalJobs > 0 ? (
                <>
                  <div
                    style={{ width: `${(printingJobs / totalJobs) * 100}%` }}
                    className="bg-[#e68a00] h-full"
                    title="Printing"
                  />
                  <div
                    style={{ width: `${(pendingJobs / totalJobs) * 100}%` }}
                    className="bg-[#8e8e93] h-full"
                    title="Pending"
                  />
                  <div
                    style={{ width: `${(completedJobs / totalJobs) * 100}%` }}
                    className="bg-[#34c759] h-full"
                    title="Completed"
                  />
                  <div
                    style={{ width: `${(cancelledJobs / totalJobs) * 100}%` }}
                    className="bg-[#d2d2d7] h-full"
                    title="Cancelled"
                  />
                </>
              ) : (
                <div className="w-full bg-[#e5e5ea] h-full" />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Jobs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[21px] font-semibold text-[#1d1d1f] tracking-tight">
              Recent Jobs
            </h2>
            <p className="text-[14px] text-[#6e6e73]">
              The latest print jobs and their real-time status.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-[14px] font-medium text-[#0066cc] hover:text-[#0071e3] transition-colors group"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <Card className="text-center py-12" padding="lg">
            <Package className="w-10 h-10 mx-auto text-[#a1a1a6] stroke-[1.5]" />
            <h3 className="mt-3 text-[17px] font-semibold text-[#1d1d1f]">
              No print jobs yet
            </h3>
            <p className="mt-1 text-[14px] text-[#6e6e73]">
              Get started by adding your first 3D printing project.
            </p>
            <div className="mt-5">
              <Link
                href="/jobs/new"
                className="inline-flex items-center gap-2 rounded-full bg-[#0066cc] px-5 py-2 text-[14px] font-medium text-white hover:bg-[#0071e3] transition-all active:scale-[0.96]"
              >
                <Plus className="w-4 h-4" />
                Add Print Job
              </Link>
            </div>
          </Card>
        ) : (
          <RecentJobsTable jobs={recentJobs} />
        )}
      </div>
    </div>
  );
}

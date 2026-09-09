import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { JobsTableClient } from "@/components/jobs/JobsTableClient";
import { Plus } from "lucide-react";

export const revalidate = 0; // Fresh data directly from SQLite

export default async function PrintJobsPage() {
  const jobs = await prisma.printJob.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e5e5ea] pb-6">
        <div>
          <span className="text-[13px] font-medium tracking-wide uppercase text-[#86868b]">
            Production Registry
          </span>
          <h1 className="mt-1 text-[28px] sm:text-[36px] font-semibold text-[#1d1d1f] tracking-tight">
            Print Jobs
          </h1>
          <p className="mt-1 text-[15px] sm:text-[17px] text-[#6e6e73]">
            Manage client orders, inspect production costs, and maintain job statuses.
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

      {/* Main Table & Filter Client */}
      <JobsTableClient initialJobs={jobs} />
    </div>
  );
}

import Link from "next/link";
import { JobForm } from "@/components/jobs/JobForm";
import { ArrowLeft } from "lucide-react";

export default function NewJobPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#e5e5ea] pb-6">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0066cc] hover:underline w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Print Jobs</span>
        </Link>
        <div>
          <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#1d1d1f] tracking-tight">
            Add Print Job
          </h1>
          <p className="mt-1 text-[15px] sm:text-[17px] text-[#6e6e73]">
            Record client specs, filament usage, and pricing. Calculations update in real time.
          </p>
        </div>
      </div>

      {/* Form */}
      <JobForm mode="create" />
    </div>
  );
}

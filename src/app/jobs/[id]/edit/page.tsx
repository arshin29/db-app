import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { JobForm } from "@/components/jobs/JobForm";
import { ArrowLeft } from "lucide-react";
import { JobStatus } from "@/lib/calculations";

export const revalidate = 0;

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;

  const job = await prisma.printJob.findUnique({
    where: { id },
  });

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#e5e5ea] pb-6">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0066cc] hover:underline w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Job Details</span>
        </Link>
        <div>
          <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#1d1d1f] tracking-tight">
            Edit Print Job
          </h1>
          <p className="mt-1 text-[15px] sm:text-[17px] text-[#6e6e73]">
            Update customer requirements, filament parameters, or pricing for{" "}
            <span className="text-[#1d1d1f] font-medium">{job.productName}</span>.
          </p>
        </div>
      </div>

      {/* Form with initialData */}
      <JobForm
        mode="edit"
        initialData={{
          id: job.id,
          customerName: job.customerName,
          productName: job.productName,
          quantity: job.quantity,
          filamentUsedGrams: job.filamentUsedGrams,
          printTimeMinutes: job.printTimeMinutes,
          filamentCost: job.filamentCost,
          electricityCost: job.electricityCost,
          otherCost: job.otherCost,
          sellingPrice: job.sellingPrice,
          status: job.status as JobStatus,
        }}
      />
    </div>
  );
}

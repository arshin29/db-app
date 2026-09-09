"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR, formatDate, formatJobId } from "@/lib/calculations";
import { StatusBadge } from "@/components/apple/StatusBadge";

interface RecentJobItem {
  id: string;
  customerName: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  profit: number;
  status: string;
  createdAt: Date | string;
}

interface RecentJobsTableProps {
  jobs: RecentJobItem[];
}

export function RecentJobsTable({ jobs }: RecentJobsTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#e5e5ea] bg-white">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-[#e5e5ea] bg-[#fafafc] text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-6">Job ID</th>
              <th className="py-3.5 px-6">Customer</th>
              <th className="py-3.5 px-6">Product</th>
              <th className="py-3.5 px-6">Selling Price</th>
              <th className="py-3.5 px-6">Profit</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f2]">
            {jobs.map((job, idx) => (
              <tr
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="hover:bg-[#f5f5f7] transition-colors cursor-pointer"
              >
                <td className="py-4 px-6 font-mono text-[13px] font-medium text-[#1d1d1f]">
                  {formatJobId(idx + 1)}
                </td>
                <td className="py-4 px-6 font-medium text-[#1d1d1f]">
                  {job.customerName}
                </td>
                <td className="py-4 px-6 text-[#1d1d1f]">
                  <div className="font-medium">
                    {job.productName}
                  </div>
                  <div className="text-[12px] text-[#86868b]">
                    Qty: {job.quantity}
                  </div>
                </td>
                <td className="py-4 px-6 font-medium text-[#1d1d1f]">
                  {formatINR(job.sellingPrice)}
                </td>
                <td className="py-4 px-6 font-medium text-[#1e7832]">
                  {formatINR(job.profit)}
                </td>
                <td className="py-4 px-6">
                  <StatusBadge status={job.status} size="sm" />
                </td>
                <td className="py-4 px-6 text-[13px] text-[#86868b] text-right">
                  {formatDate(job.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden divide-y divide-[#f0f0f2]">
        {jobs.map((job, idx) => (
          <div
            key={job.id}
            onClick={() => router.push(`/jobs/${job.id}`)}
            className="block p-4 hover:bg-[#fafafc] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] text-[#86868b]">
                {formatJobId(idx + 1)}
              </span>
              <StatusBadge status={job.status} size="sm" />
            </div>
            <div className="mt-2 font-medium text-[15px] text-[#1d1d1f]">
              {job.productName}
            </div>
            <div className="text-[13px] text-[#6e6e73]">
              {job.customerName} • Qty {job.quantity}
            </div>
            <div className="mt-3 flex items-center justify-between text-[13px] pt-2 border-t border-[#f0f0f2]">
              <span className="text-[#6e6e73]">Price: {formatINR(job.sellingPrice)}</span>
              <span className="font-semibold text-[#1e7832]">
                Profit: {formatINR(job.profit)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

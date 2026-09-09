import { JobStatus } from "@/lib/calculations";

interface StatusBadgeProps {
  status: JobStatus | string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normStatus = status.toUpperCase();

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3 py-1 text-[12px]",
    lg: "px-3.5 py-1.5 text-[13px]",
  }[size];

  if (normStatus === "PRINTING") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-tight bg-[#fff3db] text-[#9c5800] border border-[#f5dfb8] ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#e68a00] animate-ping" />
        Printing
      </span>
    );
  }

  if (normStatus === "COMPLETED") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-medium tracking-tight bg-[#eaf6eb] text-[#1e7832] border border-[#d2ead4] ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#28a745]" />
        Completed
      </span>
    );
  }

  if (normStatus === "CANCELLED") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-tight bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
        Cancelled
      </span>
    );
  }

  // Default: PENDING
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-tight bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
      Pending
    </span>
  );
}

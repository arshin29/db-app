"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, Plus, ExternalLink, Calculator } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const isDashboard = pathname === "/";
  const isJobs = pathname.startsWith("/jobs") && pathname !== "/jobs/new";
  const isNewJob = pathname === "/jobs/new";

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#e5e5ea] px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Dashboard Tab */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            isDashboard
              ? "text-[#0066cc]"
              : "text-[#86868b] hover:text-[#1d1d1f]"
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${isDashboard ? "stroke-[2.2]" : "stroke-[1.7]"}`} />
          <span className={`text-[11px] ${isDashboard ? "font-semibold" : "font-medium"}`}>
            Dashboard
          </span>
        </Link>

        {/* Print Jobs Tab */}
        <Link
          href="/jobs"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            isJobs
              ? "text-[#0066cc]"
              : "text-[#86868b] hover:text-[#1d1d1f]"
          }`}
        >
          <Layers className={`w-5 h-5 ${isJobs ? "stroke-[2.2]" : "stroke-[1.7]"}`} />
          <span className={`text-[11px] ${isJobs ? "font-semibold" : "font-medium"}`}>
            Print Jobs
          </span>
        </Link>

        {/* Center Prominent Add Job CTA */}
        <Link
          href="/jobs/new"
          className="flex flex-col items-center justify-center gap-1 py-0.5 px-3 -mt-3 active:scale-95 transition-transform"
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all ${
              isNewJob
                ? "bg-[#0071e3] text-white ring-4 ring-[#0071e3]/20"
                : "bg-[#0066cc] text-white hover:bg-[#0071e3]"
            }`}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span
            className={`text-[10.5px] ${
              isNewJob ? "font-semibold text-[#0066cc]" : "font-medium text-[#6e6e73]"
            }`}
          >
            Add Job
          </span>
        </Link>

        {/* Calculator Link */}
        <a
          href="https://3d-print-calculator-pink.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl text-[#86868b] hover:text-[#0066cc] transition-all active:scale-95"
        >
          <div className="relative">
            <Calculator className="w-5 h-5 stroke-[1.7]" />
            <ExternalLink className="w-2.5 h-2.5 absolute -top-0.5 -right-1.5 text-[#86868b]" />
          </div>
          <span className="text-[11px] font-medium">
            Calculator
          </span>
        </a>
      </div>
    </nav>
  );
}

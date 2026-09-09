"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ResetDatabaseButton } from "./ResetDatabaseButton";

export function SubNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-[44px] z-40 w-full border-b border-[#e5e5ea]/80 bg-[#f5f5f7]/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-[52px] max-w-[1200px] items-center justify-between px-4 sm:px-8">
        {/* Title */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-[17px] sm:text-[19px] font-semibold text-[#1d1d1f] tracking-tight hover:opacity-85 transition-opacity"
          >
            3D Job Tracker
          </Link>

          {/* Sub tabs */}
          <div className="hidden sm:flex items-center gap-1 text-[13px]">
            <Link
              href="/"
              className={`px-3 py-1 rounded-full transition-all ${
                pathname === "/"
                  ? "bg-white text-[#1d1d1f] shadow-sm font-medium"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/jobs"
              className={`px-3 py-1 rounded-full transition-all ${
                pathname === "/jobs"
                  ? "bg-white text-[#1d1d1f] shadow-sm font-medium"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              All Jobs
            </Link>
          </div>
        </div>

        {/* Database Management Action */}
        <div className="flex items-center gap-2">
          <ResetDatabaseButton variant="subnav" />
        </div>
      </div>
    </nav>
  );
}

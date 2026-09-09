"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

export function GlobalNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-black text-white">
      <div className="mx-auto flex h-[44px] max-w-[1200px] items-center justify-between px-4 sm:px-8 text-[12px] tracking-tight text-[#cccccc]">
        {/* Apple-style minimalist Studio Mark */}
        <Link
          href="/"
          className="flex items-center gap-2 font-medium text-white hover:text-white transition-opacity active:opacity-75"
        >
          {/* Stylized Apple-inspired minimalist 3D precision cube glyph */}
          <svg
            className="w-4 h-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span className="font-semibold text-white tracking-normal text-[13px]">
            Additive Studio
          </span>
        </Link>

        {/* Global links */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/"
            className={`transition-colors hover:text-white ${
              pathname === "/" ? "text-white font-medium" : "text-[#a1a1a6]"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/jobs"
            className={`transition-colors hover:text-white ${
              pathname.startsWith("/jobs") && pathname !== "/jobs/new"
                ? "text-white font-medium"
                : "text-[#a1a1a6]"
            }`}
          >
            Print Jobs
          </Link>
          <Link
            href="/jobs/new"
            className={`transition-colors hover:text-white ${
              pathname === "/jobs/new" ? "text-white font-medium" : "text-[#a1a1a6]"
            }`}
          >
            Add Job
          </Link>
          <a
            href="https://3d-print-calculator-pink.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#a1a1a6] hover:text-white transition-colors"
          >
            <span>Cost Calculator</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </nav>

        {/* Status indicator */}
        <div className="flex items-center gap-3 text-[11px] text-[#86868b]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse"></span>
            <span className="hidden sm:inline">Prisma SQLite</span> Connected
          </span>
          <span className="text-[#424245]">|</span>
          <span>INR (₹)</span>
        </div>
      </div>
    </header>
  );
}

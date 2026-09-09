import type { Metadata } from "next";
import "./globals.css";
import { GlobalNav } from "@/components/apple/GlobalNav";
import { SubNav } from "@/components/apple/SubNav";
import { BottomNav } from "@/components/apple/BottomNav";
import { ResetDatabaseButton } from "@/components/apple/ResetDatabaseButton";

export const metadata: Metadata = {
  title: "3D Printing Job Tracker — Additive Studio",
  description:
    "A refined Apple-designed 3D printing job tracker for production management, filament calculation, costs, and profit tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0066cc]/20 selection:text-[#0066cc]">
        <GlobalNav />
        <SubNav />
        <main className="flex-1 w-full mx-auto max-w-[1200px] px-4 sm:px-8 py-6 sm:py-10 pb-28 md:pb-10">
          {children}
        </main>
        <footer className="mt-auto border-t border-[#e5e5ea] bg-[#f5f5f7] py-8 sm:py-10 pb-28 md:pb-10 text-[12px] text-[#86868b]">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1d1d1f]">Additive Studio</span>
              <span>•</span>
              <span>3D Printing Job Tracker</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Built with Next.js, SQLite &amp; Prisma</span>
              <span>•</span>
              <ResetDatabaseButton variant="footer" />
            </div>
          </div>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}

"use client";

import QuickActions from "@/components/admin/quick-actions";
import CommandSearch, { useCommandSearch } from "@/components/admin/command-search";

export default function AdminDashboardClient({ children }: { children: React.ReactNode }) {
  const { open } = useCommandSearch();

  return (
    <>
      <CommandSearch />
      <div className="space-y-6">
        <QuickActions onOpenSearch={open} />
        {children}
      </div>
    </>
  );
}

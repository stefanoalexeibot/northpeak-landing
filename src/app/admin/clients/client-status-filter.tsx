"use client";

import Link from "next/link";

const filters = [
  { label: "Todos", value: "all" },
  { label: "Activos", value: "active" },
  { label: "Pausados", value: "paused" },
  { label: "Completados", value: "completed" },
];

export default function ClientStatusFilter({ current }: { current?: string }) {
  const active = current || "all";

  return (
    <div className="flex gap-2">
      {filters.map((f) => (
        <Link
          key={f.value}
          href={f.value === "all" ? "/admin/clients" : `/admin/clients?status=${f.value}`}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            active === f.value
              ? "bg-northpeak-green/10 text-northpeak-green"
              : "text-northpeak-text-muted hover:bg-northpeak-surface hover:text-northpeak-text"
          }`}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}

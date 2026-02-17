"use client";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Activo", className: "bg-green-500/10 text-green-400 border-green-500/20" },
  paused: { label: "Pausado", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  completed: { label: "Completado", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
};

export default function ClientStatusBadge({ status }: { status?: string }) {
  const config = statusConfig[status || "active"] || statusConfig.active;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

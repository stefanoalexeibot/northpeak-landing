"use client";

import Link from "next/link";
import { UserPlus, MessageSquare, FileText, Search } from "lucide-react";

const actions = [
  { label: "Nuevo cliente", href: "/admin/clients/new", icon: UserPlus, color: "text-northpeak-green" },
  { label: "Mensajes", href: "/admin/messages", icon: MessageSquare, color: "text-cyan-400" },
  { label: "Documentos", href: "/admin/documents", icon: FileText, color: "text-blue-400" },
];

export default function QuickActions({ onOpenSearch }: { onOpenSearch?: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex items-center gap-2 rounded-lg bg-northpeak-surface px-4 py-2.5 text-sm font-medium text-northpeak-text hover:bg-northpeak-card-hover transition-colors"
        >
          <action.icon className={`h-4 w-4 ${action.color}`} />
          {action.label}
        </Link>
      ))}
      {onOpenSearch && (
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-lg bg-northpeak-surface px-4 py-2.5 text-sm font-medium text-northpeak-text hover:bg-northpeak-card-hover transition-colors"
        >
          <Search className="h-4 w-4 text-yellow-400" />
          Buscar
          <kbd className="ml-1 text-[10px] text-northpeak-text-dim bg-northpeak-bg px-1.5 py-0.5 rounded font-mono">
            Ctrl+K
          </kbd>
        </button>
      )}
    </div>
  );
}

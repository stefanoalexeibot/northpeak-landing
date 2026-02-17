"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, FileText, MessageSquare, Image, CreditCard } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotificationItem {
  type: "files" | "messages" | "contracts" | "payments";
  label: string;
  count: number;
  href: string;
  icon: typeof Bell;
}

export default function NotificationBell({ clientId }: { clientId: string }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const totalCount = items.reduce((sum, i) => sum + i.count, 0);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();

      const [
        { count: unseenFiles },
        { count: unreadMessages },
        { count: unsignedContracts },
        { count: pendingPayments },
      ] = await Promise.all([
        supabase
          .from("media")
          .select("*", { count: "exact", head: true })
          .eq("client_id", clientId)
          .eq("seen_by_client", false),
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("client_id", clientId)
          .eq("sender_role", "admin")
          .eq("read", false),
        supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("client_id", clientId)
          .eq("type", "contract")
          .or("signed.is.null,signed.eq.false"),
        supabase
          .from("payments")
          .select("*", { count: "exact", head: true })
          .eq("client_id", clientId)
          .eq("status", "pending"),
      ]);

      const notifications: NotificationItem[] = [];
      if ((unseenFiles ?? 0) > 0)
        notifications.push({ type: "files", label: "Archivos nuevos", count: unseenFiles ?? 0, href: "/portal/files", icon: Image });
      if ((unreadMessages ?? 0) > 0)
        notifications.push({ type: "messages", label: "Mensajes sin leer", count: unreadMessages ?? 0, href: "/portal/support", icon: MessageSquare });
      if ((unsignedContracts ?? 0) > 0)
        notifications.push({ type: "contracts", label: "Contratos por firmar", count: unsignedContracts ?? 0, href: "/portal/contract", icon: FileText });
      if ((pendingPayments ?? 0) > 0)
        notifications.push({ type: "payments", label: "Pagos pendientes", count: pendingPayments ?? 0, href: "/portal/payments", icon: CreditCard });

      setItems(notifications);
    }
    fetch();
  }, [clientId]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-northpeak-text-muted hover:text-northpeak-text transition-colors"
        title="Notificaciones"
      >
        <Bell className="h-4 w-4" />
        {totalCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-northpeak-surface bg-northpeak-card shadow-xl z-50">
          <div className="p-3 border-b border-northpeak-surface">
            <p className="text-sm font-medium text-northpeak-text">Notificaciones</p>
          </div>
          {items.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-northpeak-text-muted">Todo al día</p>
            </div>
          ) : (
            <div className="py-1">
              {items.map((item) => (
                <Link
                  key={item.type}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-northpeak-surface transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-northpeak-green/10">
                    <item.icon className="h-4 w-4 text-northpeak-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-northpeak-text">{item.label}</p>
                  </div>
                  <span className={cn(
                    "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white",
                    item.type === "contracts" ? "bg-yellow-500" : "bg-red-500"
                  )}>
                    {item.count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

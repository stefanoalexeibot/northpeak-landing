"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, FileText, MessageSquare, Gift, Star, AlertTriangle, Upload, Check } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  client_id?: string;
  read: boolean;
  link?: string;
  created_at: string;
  clients?: { name: string } | null;
}

const iconMap: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  contract_signed: { icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
  message_received: { icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  referral_submitted: { icon: Gift, color: "text-orange-400", bg: "bg-orange-400/10" },
  testimonial_submitted: { icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  payment_overdue: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10" },
  file_uploaded: { icon: Upload, color: "text-purple-400", bg: "bg-purple-400/10" },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `hace ${diffD}d`;
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(
          data.map((n: NotificationItem) => ({
            ...n,
            clients: n.clients && typeof n.clients === "object" && !Array.isArray(n.clients)
              ? n.clients
              : null,
          }))
        );
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllRead() {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-lg text-northpeak-text-muted hover:text-northpeak-text hover:bg-northpeak-surface transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 sm:left-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 rounded-lg border border-northpeak-surface bg-northpeak-card shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-northpeak-surface">
            <span className="text-sm font-medium text-northpeak-text">Notificaciones</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-northpeak-text-muted hover:text-northpeak-green transition-colors"
              >
                <Check className="h-3 w-3" />
                Marcar todo leído
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-northpeak-text-muted p-4 text-center">
                Sin notificaciones
              </p>
            ) : (
              notifications.map((n) => {
                const { icon: Icon, color, bg } = iconMap[n.type] || iconMap.contract_signed;
                const content = (
                  <div
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-northpeak-surface transition-colors cursor-pointer ${
                      !n.read ? "bg-northpeak-green/5" : ""
                    }`}
                    onClick={() => {
                      if (!n.read) markRead(n.id);
                      setOpen(false);
                    }}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bg} shrink-0 mt-0.5`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${!n.read ? "font-medium text-northpeak-text" : "text-northpeak-text-muted"}`}>
                        {n.title}
                      </p>
                      {n.description && (
                        <p className="text-xs text-northpeak-text-dim truncate mt-0.5">
                          {n.description}
                        </p>
                      )}
                      <p className="text-xs text-northpeak-text-dim mt-1">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="h-2 w-2 rounded-full bg-northpeak-green shrink-0 mt-2" />
                    )}
                  </div>
                );

                if (n.link) {
                  return (
                    <Link key={n.id} href={n.link}>
                      {content}
                    </Link>
                  );
                }
                return <div key={n.id}>{content}</div>;
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

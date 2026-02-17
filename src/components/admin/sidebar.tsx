"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Gift,
  MessageSquare,
  LogOut,
  Star,
  Search,
} from "lucide-react";
import NotificationBell from "./notification-bell";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Clientes", href: "/admin/clients", icon: Users },
  { label: "Documentos", href: "/admin/documents", icon: FileText },
  { label: "Referidos", href: "/admin/referrals", icon: Gift },
  { label: "Mensajes", href: "/admin/messages", icon: MessageSquare },
  { label: "Reseñas", href: "/admin/testimonials", icon: Star },
  { label: "Analizador", href: "/admin/analizador", icon: Search },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-northpeak-surface bg-northpeak-card">
      <div className="flex h-16 items-center justify-between px-6 border-b border-northpeak-surface">
        <div className="flex items-center">
          <img src="/logo.png" alt="NorthPeak" className="h-7" />
          <span className="ml-2 text-xs font-mono text-northpeak-text-muted uppercase tracking-widest">
            Admin
          </span>
        </div>
        <NotificationBell />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-northpeak-green/10 text-northpeak-green"
                  : "text-northpeak-text-muted hover:bg-northpeak-surface hover:text-northpeak-text"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-northpeak-surface p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-northpeak-text-muted hover:bg-northpeak-surface hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

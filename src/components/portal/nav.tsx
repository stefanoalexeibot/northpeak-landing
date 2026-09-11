"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Client } from "@/lib/types";
import {
  LayoutDashboard,
  FileText,
  HandHeart,
  Receipt,
  FolderOpen,
  Image,
  Gift,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Settings,
  CreditCard,
  CalendarDays,
  TrendingUp,
  FileSearch,
} from "lucide-react";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/portal/theme-toggle";
import NotificationBell from "@/components/portal/notification-bell";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badgeKey?: string;
}

const navItems: NavItem[] = [
  { label: "Inicio", href: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Contrato", href: "/portal/contract", icon: FileText, badgeKey: "contracts" },
  { label: "Bienvenida", href: "/portal/welcome", icon: HandHeart },
  { label: "Propuesta", href: "/portal/propuesta", icon: FileSearch },
  { label: "Nota de venta", href: "/portal/invoice", icon: Receipt },
  { label: "Proyectos", href: "/portal/projects", icon: FolderOpen },
  { label: "Archivos", href: "/portal/files", icon: Image, badgeKey: "files" },
  { label: "Pagos", href: "/portal/payments", icon: CreditCard, badgeKey: "payments" },
  { label: "Calendario", href: "/portal/calendar", icon: CalendarDays },
  { label: "Resultados", href: "/portal/resultados", icon: TrendingUp },
  { label: "Referidos", href: "/portal/referrals", icon: Gift },
  { label: "Soporte", href: "/portal/support", icon: MessageSquare, badgeKey: "messages" },
];

export default function PortalNav({ client }: { client: Client }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unseenCounts, setUnseenCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchUnseen() {
      try {
        const supabase = createClient();
        const [
          { count: unseenDocs },
          { count: unseenFiles },
          { count: unreadMessages },
          { count: pendingPayments },
        ] = await Promise.all([
          supabase
            .from("documents")
            .select("*", { count: "exact", head: true })
            .eq("client_id", client.id)
            .eq("type", "contract")
            .or("signed.is.null,signed.eq.false"),
          supabase
            .from("media")
            .select("*", { count: "exact", head: true })
            .eq("client_id", client.id)
            .eq("seen_by_client", false),
          supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("client_id", client.id)
            .eq("sender_role", "admin")
            .eq("read", false),
          supabase
            .from("payments")
            .select("*", { count: "exact", head: true })
            .eq("client_id", client.id)
            .eq("status", "pending"),
        ]);
        setUnseenCounts({
          contracts: unseenDocs ?? 0,
          files: unseenFiles ?? 0,
          messages: unreadMessages ?? 0,
          payments: pendingPayments ?? 0,
        });
      } catch {
        // ignore
      }
    }
    fetchUnseen();
  }, [client.id, pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-northpeak-surface bg-northpeak-card/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/portal/dashboard">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="NorthPeak" className="h-7" />
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const badgeCount = item.badgeKey ? unseenCounts[item.badgeKey] ?? 0 : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-northpeak-green/10 text-northpeak-green"
                      : "text-northpeak-text-muted hover:text-northpeak-text hover:bg-northpeak-surface"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <NotificationBell clientId={client.id} />
            <ThemeToggle />
            <Link
              href="/portal/settings"
              className="text-northpeak-text-muted hover:text-northpeak-text transition-colors"
              title="Configuración"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <span className="text-sm text-northpeak-text-muted hidden sm:block">
              {client.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-northpeak-text-muted hover:text-red-400 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <button
              className="lg:hidden text-northpeak-text-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden pb-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const badgeCount = item.badgeKey ? unseenCounts[item.badgeKey] ?? 0 : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-northpeak-green/10 text-northpeak-green"
                      : "text-northpeak-text-muted hover:text-northpeak-text hover:bg-northpeak-surface"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {badgeCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <Link
              href="/portal/settings"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/portal/settings")
                  ? "bg-northpeak-green/10 text-northpeak-green"
                  : "text-northpeak-text-muted hover:text-northpeak-text hover:bg-northpeak-surface"
              )}
            >
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

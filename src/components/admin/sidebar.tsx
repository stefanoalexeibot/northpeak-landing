"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  BarChart3,
  Kanban,
  Menu,
  X,
  Package,
  Calculator,
  CreditCard,
  CalendarDays,
  UserCheck,
  TrendingUp,
  Zap,
  Handshake,
  DollarSign,
  PieChart,
} from "lucide-react";
import NotificationBell from "./notification-bell";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/leads", icon: Zap },
  { label: "Clientes", href: "/admin/clients", icon: Users },
  { label: "Pagos", href: "/admin/payments", icon: CreditCard },
  { label: "Calendario", href: "/admin/calendar", icon: CalendarDays },
  { label: "Documentos", href: "/admin/documents", icon: FileText },
  { label: "Referidos", href: "/admin/referrals", icon: Gift },
  { label: "Mensajes", href: "/admin/messages", icon: MessageSquare },
  { label: "Reseñas", href: "/admin/testimonials", icon: Star },
  { label: "Analizador", href: "/admin/analizador", icon: Search },
  { label: "Pipeline", href: "/admin/pipeline", icon: Kanban },
  { label: "Ventas", href: "/admin/ventas", icon: TrendingUp },
  { label: "Propuestas", href: "/admin/propuestas", icon: FileText },
  { label: "Vendedores", href: "/admin/vendedores", icon: UserCheck },
  { label: "Catálogo", href: "/admin/catalogo", icon: Package },
  { label: "Cotizador", href: "/admin/cotizador", icon: Calculator },
  { label: "Reportes", href: "/admin/reports", icon: BarChart3 },
];

const SocioItems = [
  { label: "Socios", href: "/admin/Socios", icon: Handshake },
  { label: "Pipeline", href: "/admin/Socios/pipeline", icon: Kanban },
  { label: "Comisiones", href: "/admin/Socios/comisiones", icon: DollarSign },
  { label: "Reportes", href: "/admin/Socios/reportes", icon: PieChart },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between px-6 border-b border-northpeak-surface">
        <div className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="NorthPeak" className="h-7" />
          <span className="ml-2 text-xs font-mono text-northpeak-text-muted uppercase tracking-widest">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 text-northpeak-text-muted hover:text-northpeak-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
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

        {/* Sección Socios */}
        <div className="pt-3 mt-2">
          <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-northpeak-text-muted/60">
            Socios
          </p>
          {SocioItems.map((item) => {
            const isActive = pathname.startsWith(item.href) &&
              !(item.href === "/admin/Socios" && pathname.startsWith("/admin/Socios/"));
            const isActiveExact = item.href === "/admin/Socios"
              ? pathname === "/admin/Socios"
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActiveExact
                    ? "bg-amber-500/10 text-amber-400"
                    : "text-northpeak-text-muted hover:bg-northpeak-surface hover:text-northpeak-text"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
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
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-northpeak-surface bg-northpeak-card px-4 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg text-northpeak-text-muted hover:bg-northpeak-surface hover:text-northpeak-text transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="NorthPeak" className="h-6" />
        <NotificationBell />
      </div>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-northpeak-surface bg-northpeak-card">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-72 flex-col border-r border-northpeak-surface bg-northpeak-card transition-transform duration-300 ease-in-out lg:hidden flex",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

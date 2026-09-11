"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  DollarSign,
  Kanban,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/comisionista", icon: LayoutDashboard, exact: true },
  { label: "Mis Socios", href: "/comisionista/socios", icon: Building2 },
  { label: "Prospectos", href: "/comisionista/prospectos", icon: UserPlus },
  { label: "Comisiones", href: "/comisionista/comisiones", icon: DollarSign },
  { label: "Pipeline", href: "/comisionista/pipeline", icon: Kanban },
];

interface SidebarProps {
  email: string;
}

export function ComisionistaSidebar({ email }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/comisionista/login");
  }

  const displayName = email.split("@")[0];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0c0c0c] border-r border-amber-500/10 flex flex-col z-50">
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-white/90 uppercase tracking-widest">Growth Partner</p>
            <p className="text-[10px] text-white/30 truncate">{displayName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-amber-500/12 text-amber-400 border border-amber-500/20 font-medium"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
              )}
            >
              <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-amber-400" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <p className="text-[10px] text-white/25 truncate mb-3">{email}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-white/30 hover:text-red-400 transition-colors duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

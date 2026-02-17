import { getClientData } from "@/lib/supabase/get-client-data";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  FileText, HandHeart, Receipt, FolderOpen,
  Image, Gift, MessageSquare,
} from "lucide-react";

export default async function PortalDashboard() {
  const { supabase, client } = await getClientData();

  const [
    { count: projectCount },
    { count: fileCount },
    { count: referralCount },
    { count: unreadCount },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("client_id", client.id),
    supabase.from("media").select("*", { count: "exact", head: true }).eq("client_id", client.id),
    supabase.from("referrals").select("*", { count: "exact", head: true }).eq("client_id", client.id),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("client_id", client.id).eq("sender_role", "admin").eq("read", false),
  ]);

  const quickLinks = [
    { label: "Contrato", href: "/portal/contract", icon: FileText, color: "text-blue-400" },
    { label: "Bienvenida", href: "/portal/welcome", icon: HandHeart, color: "text-pink-400" },
    { label: "Nota de venta", href: "/portal/invoice", icon: Receipt, color: "text-yellow-400" },
    { label: "Proyectos", href: "/portal/projects", icon: FolderOpen, count: projectCount, color: "text-northpeak-green" },
    { label: "Archivos", href: "/portal/files", icon: Image, count: fileCount, color: "text-purple-400" },
    { label: "Referidos", href: "/portal/referrals", icon: Gift, count: referralCount, color: "text-orange-400" },
    { label: "Soporte", href: "/portal/support", icon: MessageSquare, count: unreadCount, color: "text-cyan-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-northpeak-card to-northpeak-surface p-8 sm:p-12">
        {client.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={client.cover_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="relative z-10 flex items-center gap-6">
          {client.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={client.photo_url} alt="" className="h-20 w-20 rounded-full object-cover border-2 border-northpeak-green/30" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-northpeak-green/10 text-northpeak-green text-3xl font-bold border-2 border-northpeak-green/30">
              {client.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-northpeak-text">
              Hola, {client.name.split(" ")[0]}
            </h1>
            <p className="text-northpeak-text-muted mt-1">
              {client.company ? `${client.company} — ` : ""}Bienvenido a tu portal
            </p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-all hover:-translate-y-0.5 cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                <link.icon className={`h-7 w-7 ${link.color}`} />
                <p className="text-sm font-medium text-northpeak-text">{link.label}</p>
                {link.count !== undefined && link.count !== null && link.count > 0 && (
                  <span className="text-xs text-northpeak-text-muted">{link.count}</span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { getClientData } from "@/lib/supabase/get-client-data";
import DashboardQuickLinks from "@/components/portal/dashboard-quick-links";

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
    { label: "Contrato", href: "/portal/contract", iconName: "FileText", color: "text-blue-400" },
    { label: "Bienvenida", href: "/portal/welcome", iconName: "HandHeart", color: "text-pink-400" },
    { label: "Nota de venta", href: "/portal/invoice", iconName: "Receipt", color: "text-yellow-400" },
    { label: "Proyectos", href: "/portal/projects", iconName: "FolderOpen", count: projectCount, color: "text-northpeak-green" },
    { label: "Archivos", href: "/portal/files", iconName: "Image", count: fileCount, color: "text-purple-400" },
    { label: "Referidos", href: "/portal/referrals", iconName: "Gift", count: referralCount, color: "text-orange-400" },
    { label: "Soporte", href: "/portal/support", iconName: "MessageSquare", count: unreadCount, color: "text-cyan-400" },
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
      <DashboardQuickLinks links={quickLinks} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderOpen, MessageSquare, Gift } from "lucide-react";
import Link from "next/link";
import ClientsChart from "@/components/admin/charts/clients-chart";
import ProjectsChart from "@/components/admin/charts/projects-chart";
import ReferralsChart from "@/components/admin/charts/referrals-chart";
import ActivityFeed from "@/components/admin/activity-feed";
import AdminDashboardClient from "@/components/admin/admin-dashboard-client";

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    { count: clientCount },
    { count: projectCount },
    { count: messageCount },
    { count: referralCount },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("read", false),
    supabase.from("referrals").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const stats = [
    { label: "Clientes", value: clientCount ?? 0, icon: Users, href: "/admin/clients", color: "text-northpeak-green" },
    { label: "Proyectos activos", value: projectCount ?? 0, icon: FolderOpen, href: "/admin/clients", color: "text-northpeak-blue" },
    { label: "Mensajes sin leer", value: messageCount ?? 0, icon: MessageSquare, href: "/admin/messages", color: "text-yellow-400" },
    { label: "Referidos pendientes", value: referralCount ?? 0, icon: Gift, href: "/admin/referrals", color: "text-purple-400" },
  ];

  // Recent clients
  const { data: recentClients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Chart data: clients by month (last 6 months)
  const { data: allClients } = await supabase.from("clients").select("created_at").order("created_at");
  const clientsByMonth = getMonthlyData(allClients?.map(c => c.created_at) || []);

  // Chart data: projects by status
  const { data: allProjects } = await supabase.from("projects").select("status");
  const projectsByStatus = getStatusCounts(allProjects?.map(p => p.status) || []);

  // Chart data: referrals by month
  const { data: allReferrals } = await supabase.from("referrals").select("created_at").order("created_at");
  const referralsByMonth = getMonthlyData(allReferrals?.map(r => r.created_at) || []);

  return (
    <AdminDashboardClient>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-northpeak-text">
            Dashboard
          </h1>
          <p className="text-northpeak-text-muted mt-1">
            Panel de administración NorthPeak Digital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-northpeak-text-muted">{stat.label}</p>
                      <p className="text-3xl font-bold text-northpeak-text mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className={cn("h-8 w-8", stat.color)} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-northpeak-text font-heading text-base">Clientes por mes</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientsChart data={clientsByMonth} />
            </CardContent>
          </Card>

          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-northpeak-text font-heading text-base">Proyectos por estado</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectsChart data={projectsByStatus} />
            </CardContent>
          </Card>

          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-northpeak-text font-heading text-base">Referidos por mes</CardTitle>
            </CardHeader>
            <CardContent>
              <ReferralsChart data={referralsByMonth} />
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed + Recent Clients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-northpeak-text font-heading">
                Actividad reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>

          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-northpeak-text font-heading">
                Clientes recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!recentClients || recentClients.length === 0 ? (
                <p className="text-northpeak-text-muted text-sm">
                  No hay clientes registrados.{" "}
                  <Link href="/admin/clients/new" className="text-northpeak-green hover:underline">
                    Crear el primero
                  </Link>
                </p>
              ) : (
                <div className="space-y-3">
                  {recentClients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/admin/clients/${client.id}`}
                      className="flex items-center gap-4 rounded-lg p-3 hover:bg-northpeak-surface transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-northpeak-green/10 text-northpeak-green font-bold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-northpeak-text truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-northpeak-text-muted truncate">
                          {client.company || client.email}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardClient>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function getMonthlyData(dates: string[]) {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
    months[key] = 0;
  }

  for (const date of dates) {
    const d = new Date(date);
    const key = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
    if (key in months) {
      months[key]++;
    }
  }

  return Object.entries(months).map(([month, count]) => ({ month, count }));
}

function getStatusCounts(statuses: string[]) {
  const counts: Record<string, number> = {};
  for (const s of statuses) {
    counts[s] = (counts[s] || 0) + 1;
  }
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

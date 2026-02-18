import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, MessageSquare, AlertTriangle, Users, CalendarClock } from "lucide-react";
import Link from "next/link";
import ClientsChart from "@/components/admin/charts/clients-chart";
import ProjectsChart from "@/components/admin/charts/projects-chart";
import RevenueChart from "@/components/admin/charts/revenue-chart";
import ActivityFeed from "@/components/admin/activity-feed";
import OverduePaymentsCard from "@/components/admin/overdue-payments-card";
import UpcomingPaymentsCard from "@/components/admin/upcoming-payments-card";
import AdminDashboardClient from "@/components/admin/admin-dashboard-client";

export default async function AdminDashboard() {
  const supabase = createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const today = now.toISOString().split("T")[0];
  const in7days = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];

  const [
    { data: monthlyPayments },
    { count: unsignedContracts },
    { count: messageCount },
    { data: overduePaymentsData },
    { data: pendingPaymentsData },
    { data: upcomingPaymentsData },
    { count: totalClients },
    { count: activeClients },
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("amount")
      .eq("status", "completed")
      .gte("paid_at", startOfMonth),
    supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("type", "contract")
      .or("signed.is.null,signed.eq.false"),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("read", false),
    supabase
      .from("payments")
      .select("id, client_id, concept, amount, due_date, clients(name, phone)")
      .eq("status", "pending")
      .not("due_date", "is", null)
      .lt("due_date", today),
    supabase
      .from("payments")
      .select("amount")
      .eq("status", "pending"),
    supabase
      .from("payments")
      .select("id, client_id, concept, amount, due_date, clients(name, phone)")
      .eq("status", "pending")
      .not("due_date", "is", null)
      .gte("due_date", today)
      .lte("due_date", in7days),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);

  const monthRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const totalPending = pendingPaymentsData?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const overdueCount = overduePaymentsData?.length ?? 0;

  const overduePayments = (overduePaymentsData ?? []).map((p) => {
    const client = p.clients as unknown as { name: string; phone?: string } | null;
    const daysOverdue = Math.floor(
      (now.getTime() - new Date(p.due_date!).getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      id: p.id,
      client_id: p.client_id,
      client_name: client?.name || "Cliente",
      concept: p.concept,
      amount: Number(p.amount),
      due_date: p.due_date!,
      days_overdue: daysOverdue,
      phone: client?.phone || undefined,
    };
  });

  const upcomingPayments = (upcomingPaymentsData ?? []).map((p) => {
    const clientName = (p.clients as unknown as { name: string } | null)?.name || "Cliente";
    const daysUntil = Math.ceil(
      (new Date(p.due_date!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      id: p.id,
      client_id: p.client_id,
      client_name: clientName,
      concept: p.concept,
      amount: Number(p.amount),
      due_date: p.due_date!,
      days_until: daysUntil,
    };
  });

  const stats = [
    {
      label: "Ingresos del mes",
      value: `$${monthRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      href: "/admin/clients",
      color: "text-northpeak-green",
    },
    {
      label: "Por cobrar",
      value: `$${totalPending.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      icon: CalendarClock,
      href: "/admin/clients",
      color: "text-northpeak-blue",
      sub: overdueCount > 0 ? `${overdueCount} vencido${overdueCount > 1 ? "s" : ""}` : undefined,
      subColor: "text-red-400",
    },
    {
      label: "Contratos pendientes",
      value: unsignedContracts ?? 0,
      icon: FileText,
      href: "/admin/documents",
      color: "text-northpeak-blue",
    },
    {
      label: "Mensajes sin leer",
      value: messageCount ?? 0,
      icon: MessageSquare,
      href: "/admin/messages",
      color: "text-yellow-400",
    },
    {
      label: "Pagos vencidos",
      value: overdueCount,
      icon: AlertTriangle,
      href: "/admin/clients",
      color: "text-red-400",
    },
    {
      label: "Clientes",
      value: `${activeClients ?? 0}/${totalClients ?? 0}`,
      icon: Users,
      href: "/admin/clients",
      color: "text-northpeak-green",
      sub: "activos / total",
    },
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

  // Chart data: revenue by month
  const { data: allPayments } = await supabase
    .from("payments")
    .select("amount, paid_at")
    .eq("status", "completed")
    .not("paid_at", "is", null)
    .order("paid_at");
  const revenueByMonth = getMonthlyRevenue(allPayments ?? []);

  return (
    <AdminDashboardClient>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">
            Dashboard
          </h1>
          <p className="text-northpeak-text-muted mt-1">
            Panel de administración NorthPeak Digital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-northpeak-text-muted">{stat.label}</p>
                      <p className="text-2xl font-bold text-northpeak-text mt-1">{stat.value}</p>
                      {stat.sub && (
                        <p className={`text-[10px] mt-0.5 ${stat.subColor || "text-northpeak-text-dim"}`}>{stat.sub}</p>
                      )}
                    </div>
                    <stat.icon className={cn("h-7 w-7", stat.color)} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-northpeak-text font-heading text-base">Ingresos por mes</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenueByMonth} />
            </CardContent>
          </Card>

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
        </div>

        {/* Payments overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-northpeak-text font-heading flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Pagos vencidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OverduePaymentsCard payments={overduePayments} />
            </CardContent>
          </Card>

          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-northpeak-text font-heading flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-yellow-400" />
                Pagos próximos (7 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UpcomingPaymentsCard payments={upcomingPayments} />
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed + Recent Clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

function getMonthlyRevenue(payments: { amount: number; paid_at: string | null }[]) {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
    months[key] = 0;
  }

  for (const pay of payments) {
    if (!pay.paid_at) continue;
    const d = new Date(pay.paid_at);
    const key = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
    if (key in months) {
      months[key] += Number(pay.amount);
    }
  }

  return Object.entries(months).map(([month, amount]) => ({ month, amount }));
}

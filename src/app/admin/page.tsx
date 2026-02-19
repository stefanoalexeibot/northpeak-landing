import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign, FileText, MessageSquare, AlertTriangle,
  Users, CalendarClock, Kanban, TrendingUp, CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import ClientsChart from "@/components/admin/charts/clients-chart";
import ProjectsChart from "@/components/admin/charts/projects-chart";
import RevenueChart from "@/components/admin/charts/revenue-chart";
import ActivityFeed from "@/components/admin/activity-feed";
import OverduePaymentsCard from "@/components/admin/overdue-payments-card";
import UpcomingPaymentsCard from "@/components/admin/upcoming-payments-card";
import AdminDashboardClient from "@/components/admin/admin-dashboard-client";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

const ETAPA_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  nuevo:                  { label: "Nuevos",       color: "text-gray-400",    dot: "bg-gray-400" },
  cuestionario_enviado:   { label: "En contacto",  color: "text-blue-400",    dot: "bg-blue-400" },
  cuestionario_completado:{ label: "Con cotización",color: "text-emerald-400", dot: "bg-emerald-400" },
  en_negociacion:         { label: "Negociando",   color: "text-yellow-400",  dot: "bg-yellow-400" },
  cerrado_ganado:         { label: "Ganados",      color: "text-northpeak-green", dot: "bg-northpeak-green" },
  cerrado_perdido:        { label: "Perdidos",     color: "text-red-400",     dot: "bg-red-400" },
};

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
    if (key in months) months[key]++;
  }
  return Object.entries(months).map(([month, count]) => ({ month, count }));
}

function getStatusCounts(statuses: string[]) {
  const counts: Record<string, number> = {};
  for (const s of statuses) counts[s] = (counts[s] || 0) + 1;
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
    if (key in months) months[key] += Number(pay.amount);
  }
  return Object.entries(months).map(([month, amount]) => ({ month, amount }));
}

export default async function AdminDashboard() {
  const supabase = createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const today = now.toISOString().split("T")[0];
  const in7days = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];

  const [
    { data: monthlyPayments },
    { data: lastMonthPayments },
    { count: unsignedContracts },
    { count: messageCount },
    { data: overduePaymentsData },
    { data: pendingPaymentsData },
    { data: upcomingPaymentsData },
    { count: totalClients },
    { count: activeClients },
    { data: pipelineData },
    { data: recentClients },
    { data: allClients },
    { data: allProjects },
    { data: allPayments },
  ] = await Promise.all([
    supabase.from("payments").select("amount").eq("status", "completed").gte("paid_at", startOfMonth),
    supabase.from("payments").select("amount").eq("status", "completed").gte("paid_at", lastMonthStart).lt("paid_at", startOfMonth),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("type", "contract").or("signed.is.null,signed.eq.false"),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("read", false),
    supabase.from("payments").select("id, client_id, concept, amount, due_date, clients(name, phone)").eq("status", "pending").not("due_date", "is", null).lt("due_date", today),
    supabase.from("payments").select("amount").eq("status", "pending"),
    supabase.from("payments").select("id, client_id, concept, amount, due_date, clients(name, phone)").eq("status", "pending").not("due_date", "is", null).gte("due_date", today).lte("due_date", in7days),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("analisis_digital").select("etapa"),
    supabase.from("clients").select("id, name, company, email, status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("clients").select("created_at").order("created_at"),
    supabase.from("projects").select("status"),
    supabase.from("payments").select("amount, paid_at").eq("status", "completed").not("paid_at", "is", null).order("paid_at"),
  ]);

  const monthRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const lastMonthRevenue = lastMonthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const revenueGrowth = lastMonthRevenue > 0 ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : null;
  const totalPending = pendingPaymentsData?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const overdueCount = overduePaymentsData?.length ?? 0;

  // Pipeline counts
  const pipelineCounts: Record<string, number> = {};
  for (const row of pipelineData ?? []) {
    pipelineCounts[row.etapa] = (pipelineCounts[row.etapa] || 0) + 1;
  }
  const totalProspectos = Object.values(pipelineCounts).reduce((a, b) => a + b, 0);
  const prospectoActivos = (pipelineCounts["nuevo"] ?? 0)
    + (pipelineCounts["cuestionario_enviado"] ?? 0)
    + (pipelineCounts["cuestionario_completado"] ?? 0)
    + (pipelineCounts["en_negociacion"] ?? 0);

  const overduePayments = (overduePaymentsData ?? []).map((p) => {
    const client = p.clients as unknown as { name: string; phone?: string } | null;
    const daysOverdue = Math.floor((now.getTime() - new Date(p.due_date!).getTime()) / 86400000);
    return { id: p.id, client_id: p.client_id, client_name: client?.name || "Cliente", concept: p.concept, amount: Number(p.amount), due_date: p.due_date!, days_overdue: daysOverdue, phone: client?.phone || undefined };
  });

  const upcomingPayments = (upcomingPaymentsData ?? []).map((p) => {
    const clientName = (p.clients as unknown as { name: string } | null)?.name || "Cliente";
    const daysUntil = Math.ceil((new Date(p.due_date!).getTime() - now.getTime()) / 86400000);
    return { id: p.id, client_id: p.client_id, client_name: clientName, concept: p.concept, amount: Number(p.amount), due_date: p.due_date!, days_until: daysUntil };
  });

  const clientsByMonth = getMonthlyData(allClients?.map(c => c.created_at) || []);
  const projectsByStatus = getStatusCounts(allProjects?.map(p => p.status) || []);
  const revenueByMonth = getMonthlyRevenue(allPayments ?? []);

  // Urgency items
  const urgencies: { label: string; count: number; href: string; color: string }[] = [];
  if (overdueCount > 0) urgencies.push({ label: `${overdueCount} pago${overdueCount > 1 ? "s" : ""} vencido${overdueCount > 1 ? "s" : ""}`, count: overdueCount, href: "/admin/payments", color: "bg-red-400/10 text-red-400 border-red-400/20" });
  if ((messageCount ?? 0) > 0) urgencies.push({ label: `${messageCount} mensaje${(messageCount ?? 0) > 1 ? "s" : ""} sin leer`, count: messageCount ?? 0, href: "/admin/messages", color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" });
  if ((unsignedContracts ?? 0) > 0) urgencies.push({ label: `${unsignedContracts} contrato${(unsignedContracts ?? 0) > 1 ? "s" : ""} sin firmar`, count: unsignedContracts ?? 0, href: "/admin/documents", color: "bg-blue-400/10 text-blue-400 border-blue-400/20" });

  const dateStr = now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });

  return (
    <AdminDashboardClient>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs text-northpeak-text-muted uppercase tracking-widest font-mono mb-1 capitalize">
              {dateStr}
            </p>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">
              {getGreeting()}, Brandon
            </h1>
            <p className="text-northpeak-text-muted mt-1 text-sm">
              {activeClients ?? 0} clientes activos · {prospectoActivos} prospectos en curso
              {revenueGrowth !== null && (
                <span className={cn("ml-2 text-xs font-medium", revenueGrowth >= 0 ? "text-northpeak-green" : "text-red-400")}>
                  {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth}% vs mes anterior
                </span>
              )}
            </p>
          </div>
          <Link href="/admin/clients/new" className="text-xs font-medium text-northpeak-green hover:text-northpeak-green/80 flex items-center gap-1 transition-colors">
            + Nuevo cliente <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Urgency banner */}
        {urgencies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {urgencies.map((u) => (
              <Link key={u.href} href={u.href}>
                <span className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-opacity hover:opacity-80", u.color)}>
                  <AlertTriangle className="h-3 w-3" />
                  {u.label}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Main KPIs — 3 big cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Revenue — most important */}
          <Card className="bg-northpeak-card border-northpeak-surface sm:col-span-1">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-northpeak-text-muted uppercase tracking-wider">Ingresos del mes</p>
                  <p className="text-3xl font-heading font-bold text-northpeak-text mt-1">
                    ${monthRevenue.toLocaleString("es-MX")}
                  </p>
                  {revenueGrowth !== null && (
                    <p className={cn("text-xs mt-1 flex items-center gap-1", revenueGrowth >= 0 ? "text-northpeak-green" : "text-red-400")}>
                      <TrendingUp className="h-3 w-3" />
                      {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth}% vs mes pasado
                    </p>
                  )}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-northpeak-green/10">
                  <DollarSign className="h-5 w-5 text-northpeak-green" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clients */}
          <Link href="/admin/clients">
            <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-northpeak-text-muted uppercase tracking-wider">Clientes activos</p>
                    <p className="text-3xl font-heading font-bold text-northpeak-text mt-1">
                      {activeClients ?? 0}
                    </p>
                    <p className="text-xs text-northpeak-text-dim mt-1">{totalClients ?? 0} en total</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/10">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Pending revenue */}
          <Link href="/admin/payments">
            <Card className={cn("border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer h-full", overdueCount > 0 ? "bg-red-400/5" : "bg-northpeak-card")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-northpeak-text-muted uppercase tracking-wider">Por cobrar</p>
                    <p className="text-3xl font-heading font-bold text-northpeak-text mt-1">
                      ${totalPending.toLocaleString("es-MX")}
                    </p>
                    {overdueCount > 0 ? (
                      <p className="text-xs text-red-400 mt-1">{overdueCount} vencido{overdueCount > 1 ? "s" : ""}</p>
                    ) : (
                      <p className="text-xs text-northpeak-text-dim mt-1">Sin vencidos</p>
                    )}
                  </div>
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", overdueCount > 0 ? "bg-red-400/10" : "bg-yellow-400/10")}>
                    <CalendarClock className={cn("h-5 w-5", overdueCount > 0 ? "text-red-400" : "text-yellow-400")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Secondary KPIs — 3 small */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/admin/messages">
            <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", (messageCount ?? 0) > 0 ? "bg-yellow-400/10" : "bg-northpeak-surface")}>
                  <MessageSquare className={cn("h-4 w-4", (messageCount ?? 0) > 0 ? "text-yellow-400" : "text-northpeak-text-dim")} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-northpeak-text">{messageCount ?? 0}</p>
                  <p className="text-[10px] text-northpeak-text-dim truncate">Mensajes sin leer</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/documents">
            <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", (unsignedContracts ?? 0) > 0 ? "bg-blue-400/10" : "bg-northpeak-surface")}>
                  <FileText className={cn("h-4 w-4", (unsignedContracts ?? 0) > 0 ? "text-blue-400" : "text-northpeak-text-dim")} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-northpeak-text">{unsignedContracts ?? 0}</p>
                  <p className="text-[10px] text-northpeak-text-dim truncate">Contratos pendientes</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/pipeline">
            <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-northpeak-green/10 shrink-0">
                  <Kanban className="h-4 w-4 text-northpeak-green" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-northpeak-text">{prospectoActivos}</p>
                  <p className="text-[10px] text-northpeak-text-dim truncate">Prospectos activos</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Pipeline snapshot */}
        {totalProspectos > 0 && (
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-northpeak-text font-heading text-sm flex items-center gap-2">
                  <Kanban className="h-4 w-4 text-northpeak-green" />
                  Pipeline de ventas
                </CardTitle>
                <Link href="/admin/pipeline" className="text-xs text-northpeak-text-muted hover:text-northpeak-green transition-colors flex items-center gap-1">
                  Ver pipeline <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.entries(ETAPA_LABELS).map(([etapa, cfg]) => {
                  const count = pipelineCounts[etapa] ?? 0;
                  return (
                    <div key={etapa} className="text-center">
                      <div className={cn("text-xl font-heading font-bold", count > 0 ? cfg.color : "text-northpeak-text-dim")}>
                        {count}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full", count > 0 ? cfg.dot : "bg-northpeak-surface")} />
                        <span className="text-[9px] text-northpeak-text-dim uppercase tracking-wider leading-tight">{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Progress bar across pipeline stages */}
              <div className="mt-3 h-1.5 bg-northpeak-surface rounded-full overflow-hidden flex">
                {Object.entries(ETAPA_LABELS).map(([etapa, cfg]) => {
                  const count = pipelineCounts[etapa] ?? 0;
                  const pct = totalProspectos > 0 ? (count / totalProspectos) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={etapa}
                      className={cn("h-full", cfg.dot)}
                      style={{ width: `${pct}%` }}
                      title={`${cfg.label}: ${count}`}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

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
                Próximos 7 días
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UpcomingPaymentsCard payments={upcomingPayments} />
            </CardContent>
          </Card>
        </div>

        {/* Activity + Recent clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-northpeak-text font-heading text-base">Actividad reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>

          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-northpeak-text font-heading text-base">Clientes recientes</CardTitle>
                <Link href="/admin/clients" className="text-xs text-northpeak-text-muted hover:text-northpeak-green transition-colors flex items-center gap-1">
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!recentClients || recentClients.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 text-northpeak-text-dim mx-auto mb-2" />
                  <p className="text-northpeak-text-muted text-sm">No hay clientes.{" "}
                    <Link href="/admin/clients/new" className="text-northpeak-green hover:underline">Crear el primero</Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentClients.map((client) => (
                    <Link key={client.id} href={`/admin/clients/${client.id}`}
                      className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-northpeak-surface transition-colors">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-northpeak-green/10 text-northpeak-green font-bold text-sm shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-northpeak-text truncate">{client.name}</p>
                        <p className="text-xs text-northpeak-text-muted truncate">{client.company || client.email}</p>
                      </div>
                      {client.status === "active" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-northpeak-green shrink-0" />
                      )}
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

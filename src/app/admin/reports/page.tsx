import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign, Users, TrendingUp, FolderOpen,
} from "lucide-react";
import RevenueChart from "@/components/admin/charts/revenue-chart";

export default async function ReportsPage() {
  const supabase = createAdminClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const [
    { data: allPayments },
    { data: thisMonthPayments },
    { data: lastMonthPayments },
    { count: totalClients },
    { count: activeClients },
    { count: pausedClients },
    { data: referrals },
    { data: testimonials },
    { data: projects },
    { data: messages },
    { count: pendingPayments },
    { data: pendingAmountData },
    { count: analysesCount },
  ] = await Promise.all([
    supabase.from("payments").select("amount, paid_at, status").eq("status", "completed").not("paid_at", "is", null).order("paid_at"),
    supabase.from("payments").select("amount").eq("status", "completed").gte("paid_at", startOfMonth),
    supabase.from("payments").select("amount").eq("status", "completed").gte("paid_at", startOfLastMonth).lte("paid_at", endOfLastMonth),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "paused"),
    supabase.from("referrals").select("status"),
    supabase.from("testimonials").select("rating, is_approved"),
    supabase.from("projects").select("status"),
    supabase.from("messages").select("sender_role, created_at").order("created_at", { ascending: false }).limit(500),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("payments").select("amount").eq("status", "pending"),
    supabase.from("analisis_digital").select("*", { count: "exact", head: true }),
  ]);

  // Revenue metrics
  const thisMonthRevenue = thisMonthPayments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const lastMonthRevenue = lastMonthPayments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const totalRevenue = allPayments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const revenueGrowth = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : thisMonthRevenue > 0 ? 100 : 0;
  const totalPending = pendingAmountData?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;

  // Referral metrics
  const totalReferrals = referrals?.length ?? 0;
  const convertedReferrals = referrals?.filter(r => r.status === "converted").length ?? 0;
  const referralConversion = totalReferrals > 0 ? Math.round((convertedReferrals / totalReferrals) * 100) : 0;

  // Testimonial metrics
  const totalTestimonials = testimonials?.length ?? 0;
  const approvedTestimonials = testimonials?.filter(t => t.is_approved).length ?? 0;
  const avgRating = totalTestimonials > 0
    ? (testimonials!.reduce((s, t) => s + t.rating, 0) / totalTestimonials).toFixed(1)
    : "—";

  // Project metrics
  const activeProjects = projects?.filter(p => p.status === "in_progress").length ?? 0;
  const completedProjects = projects?.filter(p => p.status === "completed").length ?? 0;

  // Response time (avg time between client message and admin reply)
  const clientMessages = messages?.filter(m => m.sender_role === "client") ?? [];
  const adminMessages = messages?.filter(m => m.sender_role === "admin") ?? [];
  let totalResponseTime = 0;
  let responseCount = 0;
  for (const cm of clientMessages) {
    const nextAdmin = adminMessages.find(
      am => new Date(am.created_at).getTime() > new Date(cm.created_at).getTime()
    );
    if (nextAdmin) {
      const diff = new Date(nextAdmin.created_at).getTime() - new Date(cm.created_at).getTime();
      if (diff < 86400000) { // Only count responses within 24h
        totalResponseTime += diff;
        responseCount++;
      }
    }
  }
  const avgResponseMinutes = responseCount > 0 ? Math.round(totalResponseTime / responseCount / 60000) : null;
  const avgResponseText = avgResponseMinutes !== null
    ? avgResponseMinutes < 60
      ? `${avgResponseMinutes} min`
      : `${Math.round(avgResponseMinutes / 60)}h ${avgResponseMinutes % 60}m`
    : "—";

  // Revenue chart (last 12 months)
  const revenueByMonth = getMonthlyRevenue(allPayments ?? [], 12);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">Reportes y Métricas</h1>
        <p className="text-northpeak-text-muted mt-1">Resumen del rendimiento del negocio</p>
      </div>

      {/* Revenue Section */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-northpeak-text mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-northpeak-green" />
          Ingresos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Ingresos del mes" value={`$${thisMonthRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`} sub={revenueGrowth >= 0 ? `+${revenueGrowth}% vs mes anterior` : `${revenueGrowth}% vs mes anterior`} subColor={revenueGrowth >= 0 ? "text-northpeak-green" : "text-red-400"} />
          <MetricCard label="Mes anterior" value={`$${lastMonthRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`} />
          <MetricCard label="Ingresos totales" value={`$${totalRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`} />
          <MetricCard label="Por cobrar" value={`$${totalPending.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`} sub={`${pendingPayments ?? 0} pagos pendientes`} subColor="text-yellow-400" />
        </div>
      </div>

      {/* Revenue chart */}
      <Card className="bg-northpeak-card border-northpeak-surface">
        <CardHeader>
          <CardTitle className="text-northpeak-text font-heading text-base">Ingresos por mes (últimos 12 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueByMonth} />
        </CardContent>
      </Card>

      {/* Clients Section */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-northpeak-text mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-northpeak-blue" />
          Clientes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total clientes" value={totalClients ?? 0} />
          <MetricCard label="Activos" value={activeClients ?? 0} sub={totalClients ? `${Math.round(((activeClients ?? 0) / (totalClients ?? 1)) * 100)}% del total` : undefined} subColor="text-northpeak-green" />
          <MetricCard label="Pausados" value={pausedClients ?? 0} />
          <MetricCard label="Tiempo resp. promedio" value={avgResponseText} sub={responseCount > 0 ? `Basado en ${responseCount} conversaciones` : "Sin datos"} />
        </div>
      </div>

      {/* Projects & Deliverables */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-northpeak-text mb-4 flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-teal-400" />
          Proyectos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total proyectos" value={projects?.length ?? 0} />
          <MetricCard label="En progreso" value={activeProjects} />
          <MetricCard label="Completados" value={completedProjects} sub={projects?.length ? `${Math.round((completedProjects / projects.length) * 100)}% completion rate` : undefined} subColor="text-northpeak-green" />
          <MetricCard label="En planeación" value={projects?.filter(p => p.status === "planning").length ?? 0} />
        </div>
      </div>

      {/* Referrals & Testimonials */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-northpeak-text mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-400" />
          Crecimiento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Referidos" value={totalReferrals} sub={`${convertedReferrals} convertidos (${referralConversion}%)`} subColor="text-northpeak-green" />
          <MetricCard label="Reseñas" value={totalTestimonials} sub={`${approvedTestimonials} aprobadas`} />
          <MetricCard label="Rating promedio" value={avgRating} sub={totalTestimonials > 0 ? `De ${totalTestimonials} reseñas` : undefined} subColor="text-yellow-400" />
          <MetricCard label="Análisis realizados" value={analysesCount ?? 0} sub="Ver en Analizador" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
}) {
  return (
    <Card className="bg-northpeak-card border-northpeak-surface">
      <CardContent className="p-5">
        <p className="text-xs text-northpeak-text-muted">{label}</p>
        <p className="text-2xl font-bold text-northpeak-text mt-1">{value}</p>
        {sub && <p className={`text-[10px] mt-0.5 ${subColor || "text-northpeak-text-dim"}`}>{sub}</p>}
      </CardContent>
    </Card>
  );
}

function getMonthlyRevenue(payments: { amount: number; paid_at: string | null }[], months: number) {
  const result: Record<string, number> = {};
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
    result[key] = 0;
  }

  for (const pay of payments) {
    if (!pay.paid_at) continue;
    const d = new Date(pay.paid_at);
    const key = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
    if (key in result) {
      result[key] += Number(pay.amount);
    }
  }

  return Object.entries(result).map(([month, amount]) => ({ month, amount }));
}

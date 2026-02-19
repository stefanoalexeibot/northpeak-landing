import { getClientData } from "@/lib/supabase/get-client-data";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  ImageIcon, MessageSquare,
  CreditCard, ChevronRight, CheckCircle2, Clock,
  AlertCircle, ArrowRight, CalendarDays,
  Share2, MapPin, Star, UserCheck, Globe, BarChart2,
} from "lucide-react";
import DashboardQuickLinks from "@/components/portal/dashboard-quick-links";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `hace ${diffD}d`;
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  planning:    { label: "Planificación", color: "text-blue-400" },
  in_progress: { label: "En progreso",   color: "text-northpeak-green" },
  review:      { label: "En revisión",   color: "text-yellow-400" },
  completed:   { label: "Completado",    color: "text-emerald-400" },
  paused:      { label: "Pausado",       color: "text-northpeak-text-dim" },
};

const DEL_STATUS_DOT: Record<string, string> = {
  pending:     "bg-northpeak-text-dim",
  in_progress: "bg-blue-400",
  review:      "bg-yellow-400",
  completed:   "bg-northpeak-green",
};

function formatAgendaDate(dateStr: string, today: string, tomorrow: string): string {
  if (dateStr === today) return "Hoy";
  if (dateStr === tomorrow) return "Mañana";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })
    .replace(/^(.)/, (c) => c.toUpperCase());
}

const RESULTADO_ICON: Record<string, typeof Share2> = {
  redes:   Share2,
  gmb:     MapPin,
  "reseñas": Star,
  leads:   UserCheck,
  web:     Globe,
  otro:    BarChart2,
};

const RESULTADO_COLOR: Record<string, string> = {
  redes:   "text-purple-400 bg-purple-400/10",
  gmb:     "text-blue-400 bg-blue-400/10",
  "reseñas": "text-yellow-400 bg-yellow-400/10",
  leads:   "text-northpeak-green bg-northpeak-green/10",
  web:     "text-cyan-400 bg-cyan-400/10",
  otro:    "text-northpeak-text-muted bg-northpeak-surface",
};

export default async function PortalDashboard() {
  const { supabase, client } = await getClientData();

  const today = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  const [
    { count: projectCount },
    { count: fileCount },
    { count: referralCount },
    { count: unreadCount },
    { data: projects },
    { data: recentMessages },
    { data: nextPayments },
    { data: recentFiles },
    { data: contractDoc },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("client_id", client.id),
    supabase.from("media").select("*", { count: "exact", head: true }).eq("client_id", client.id),
    supabase.from("referrals").select("*", { count: "exact", head: true }).eq("client_id", client.id),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("client_id", client.id).eq("sender_role", "admin").eq("read", false),
    supabase.from("projects").select("id, name, status, description, deliverables(id, status)").eq("client_id", client.id).order("created_at", { ascending: false }).limit(2),
    supabase.from("messages").select("id, content, created_at, sender_role").eq("client_id", client.id).eq("sender_role", "admin").order("created_at", { ascending: false }).limit(3),
    supabase.from("payments").select("id, amount, concept, due_date, status").eq("client_id", client.id).eq("status", "pending").order("due_date").limit(2),
    supabase.from("media").select("id, name, file_url, file_type, created_at").eq("client_id", client.id).order("created_at", { ascending: false }).limit(3),
    supabase.from("documents").select("id, type, signed").eq("client_id", client.id).eq("type", "contract").limit(1).maybeSingle(),
  ]);

  // Fetch all project IDs to query deliverables and resultados
  const { data: allProjects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("client_id", client.id);

  const projectIds = (allProjects ?? []).map((p) => p.id);
  const projectNameMap: Record<string, string> = {};
  (allProjects ?? []).forEach((p) => { projectNameMap[p.id] = p.name; });

  const [{ data: upcomingDeliverables }, { data: latestResultados }] = await Promise.all([
    projectIds.length > 0
      ? supabase
          .from("deliverables")
          .select("id, name, status, scheduled_date, project_id")
          .in("project_id", projectIds)
          .not("scheduled_date", "is", null)
          .gte("scheduled_date", today)
          .order("scheduled_date", { ascending: true })
          .limit(12)
      : Promise.resolve({ data: [] as { id: string; name: string; status: string; scheduled_date: string | null; project_id: string }[] }),
    supabase
      .from("resultados_cliente")
      .select("id, categoria, descripcion, valor, unidad, mes")
      .eq("client_id", client.id)
      .order("mes", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const hasUnsignedContract = contractDoc && !contractDoc.signed;

  const quickLinks = [
    { label: "Contrato",    href: "/portal/contract",  iconName: "FileText",     color: "text-blue-400" },
    { label: "Proyectos",   href: "/portal/projects",  iconName: "FolderOpen",   count: projectCount, color: "text-northpeak-green" },
    { label: "Archivos",    href: "/portal/files",     iconName: "Image",        count: fileCount, color: "text-purple-400" },
    { label: "Pagos",       href: "/portal/payments",  iconName: "CreditCard",   color: "text-yellow-400" },
    { label: "Referidos",   href: "/portal/referrals", iconName: "Gift",         count: referralCount, color: "text-orange-400" },
    { label: "Soporte",     href: "/portal/support",   iconName: "MessageSquare",count: unreadCount, color: "text-cyan-400" },
    { label: "Calendario",  href: "/portal/calendar",  iconName: "CalendarDays", color: "text-pink-400" },
    { label: "Bienvenida",  href: "/portal/welcome",   iconName: "HandHeart",    color: "text-rose-400" },
  ];

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-northpeak-surface bg-gradient-to-br from-northpeak-card via-northpeak-card to-northpeak-surface p-6 sm:p-8">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-northpeak-green/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-northpeak-green/3 blur-2xl" />

        {client.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={client.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
        )}

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          {client.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={client.photo_url} alt="" className="h-16 w-16 rounded-2xl object-cover border border-northpeak-green/20 shrink-0" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-northpeak-green/10 text-northpeak-green text-2xl font-bold border border-northpeak-green/20 shrink-0">
              {client.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs text-northpeak-text-dim uppercase tracking-widest font-mono mb-0.5">
              {getGreeting()}
            </p>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text truncate">
              {client.name.split(" ")[0]}
            </h1>
            {client.company && (
              <p className="text-northpeak-text-muted text-sm mt-0.5 truncate">{client.company}</p>
            )}
          </div>

          {/* Quick status pills */}
          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
            {(unreadCount ?? 0) > 0 && (
              <Link href="/portal/support">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-medium">
                  <MessageSquare className="h-3 w-3" />
                  {unreadCount} mensaje{(unreadCount ?? 0) > 1 ? "s" : ""}
                </span>
              </Link>
            )}
            {hasUnsignedContract && (
              <Link href="/portal/contract">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-medium">
                  <AlertCircle className="h-3 w-3" />
                  Contrato por firmar
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Projects progress */}
      {projects && projects.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-northpeak-text-muted uppercase tracking-wider">Tus proyectos</h2>
            <Link href="/portal/projects" className="text-xs text-northpeak-green hover:text-northpeak-green/80 flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((project) => {
              const deliverables = (project.deliverables as { id: string; status: string }[]) ?? [];
              const total = deliverables.length;
              const approved = deliverables.filter(d => d.status === "completed").length;
              const inReview = deliverables.filter(d => d.status === "review").length;
              const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
              const statusCfg = STATUS_LABEL[project.status] ?? { label: project.status, color: "text-northpeak-text-muted" };

              return (
                <Link key={project.id} href={`/portal/projects/${project.id}`}>
                  <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer h-full">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-northpeak-text truncate">{project.name}</p>
                          <p className={`text-xs mt-0.5 ${statusCfg.color}`}>{statusCfg.label}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-northpeak-text-dim shrink-0 mt-0.5" />
                      </div>

                      {total > 0 && (
                        <>
                          <div className="h-1.5 bg-northpeak-surface rounded-full overflow-hidden">
                            <div
                              className="h-full bg-northpeak-green rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-northpeak-text-dim">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-northpeak-green" />
                              {approved} de {total} completados
                            </span>
                            {inReview > 0 && (
                              <span className="flex items-center gap-1 text-yellow-400">
                                <Clock className="h-3 w-3" />
                                {inReview} en revisión
                              </span>
                            )}
                            <span className="font-mono">{pct}%</span>
                          </div>
                        </>
                      )}

                      {total === 0 && (
                        <p className="text-xs text-northpeak-text-dim">Proyecto en planificación</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda de contenido */}
      {upcomingDeliverables && upcomingDeliverables.length > 0 && (() => {
        // Group by date
        const grouped: Record<string, typeof upcomingDeliverables> = {};
        for (const d of upcomingDeliverables) {
          const key = d.scheduled_date!;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(d);
        }
        const dates = Object.keys(grouped).sort();
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-northpeak-text-muted uppercase tracking-wider">Agenda de contenido</h2>
              <Link href="/portal/calendar" className="text-xs text-northpeak-green hover:text-northpeak-green/80 flex items-center gap-1">
                Ver calendario <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <Card className="bg-northpeak-card border-northpeak-surface">
              <CardContent className="p-4 space-y-4">
                {dates.map((date) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="h-3.5 w-3.5 text-northpeak-green" />
                      <span className="text-xs font-semibold text-northpeak-text">
                        {formatAgendaDate(date, today, tomorrow)}
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-5">
                      {grouped[date].map((del) => (
                        <div key={del.id} className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${DEL_STATUS_DOT[del.status] ?? "bg-northpeak-text-dim"}`} />
                          <span className={`text-sm text-northpeak-text flex-1 ${del.status === "completed" ? "line-through text-northpeak-text-dim" : ""}`}>
                            {del.name}
                          </span>
                          {del.project_id && projectNameMap[del.project_id] && (
                            <span className="text-[10px] text-northpeak-text-dim whitespace-nowrap">
                              {projectNameMap[del.project_id]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Resultados recientes */}
      {latestResultados && latestResultados.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-northpeak-text-muted uppercase tracking-wider">Resultados recientes</h2>
            <Link href="/portal/resultados" className="text-xs text-northpeak-green hover:text-northpeak-green/80 flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {latestResultados.map((r) => {
              const Icon = RESULTADO_ICON[r.categoria] ?? BarChart2;
              const colorCls = RESULTADO_COLOR[r.categoria] ?? RESULTADO_COLOR.otro;
              return (
                <Card key={r.id} className="bg-northpeak-card border-northpeak-surface">
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${colorCls.split(" ")[1]}`}>
                      <Icon className={`h-4 w-4 ${colorCls.split(" ")[0]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-northpeak-text leading-snug">{r.descripcion}</p>
                      {r.valor !== null && (
                        <p className="text-xs font-bold text-northpeak-green mt-0.5">
                          {r.valor} {r.unidad || ""}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Next payments + Recent messages — side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Next payment */}
        {nextPayments && nextPayments.length > 0 ? (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-northpeak-text-muted uppercase tracking-wider">Próximos pagos</h2>
            <div className="space-y-2">
              {nextPayments.map((payment) => {
                const daysUntil = payment.due_date
                  ? Math.ceil((new Date(payment.due_date).getTime() - Date.now()) / 86400000)
                  : null;
                const isOverdue = daysUntil !== null && daysUntil < 0;
                const isSoon = daysUntil !== null && daysUntil <= 3 && daysUntil >= 0;

                return (
                  <Link key={payment.id} href="/portal/payments">
                    <Card className={`border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer ${isOverdue ? "bg-red-400/5" : "bg-northpeak-card"}`}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${isOverdue ? "bg-red-400/10" : isSoon ? "bg-yellow-400/10" : "bg-northpeak-surface"}`}>
                          <CreditCard className={`h-4 w-4 ${isOverdue ? "text-red-400" : isSoon ? "text-yellow-400" : "text-northpeak-text-dim"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-northpeak-text truncate">{payment.concept}</p>
                          <p className={`text-xs ${isOverdue ? "text-red-400" : isSoon ? "text-yellow-400" : "text-northpeak-text-muted"}`}>
                            {isOverdue ? `Vencido hace ${Math.abs(daysUntil!)}d` : daysUntil === 0 ? "Vence hoy" : `Vence en ${daysUntil}d`}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-northpeak-text text-sm shrink-0">
                          ${Number(payment.amount).toLocaleString("es-MX")}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-northpeak-text-muted uppercase tracking-wider">Pagos</h2>
            <Card className="bg-northpeak-card border-northpeak-surface">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-northpeak-green" />
                <p className="text-sm text-northpeak-text-muted">Sin pagos pendientes</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent messages from team */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-northpeak-text-muted uppercase tracking-wider">Mensajes del equipo</h2>
            <Link href="/portal/support" className="text-xs text-northpeak-green hover:text-northpeak-green/80 flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentMessages && recentMessages.length > 0 ? (
            <div className="space-y-2">
              {recentMessages.map((msg) => (
                <Link key={msg.id} href="/portal/support">
                  <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer">
                    <CardContent className="p-3 flex items-start gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-northpeak-green/10 shrink-0 mt-0.5">
                        <span className="text-northpeak-green text-xs font-bold">N</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-northpeak-text-muted mb-0.5">NorthPeak</p>
                        <p className="text-sm text-northpeak-text line-clamp-2">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-northpeak-text-dim whitespace-nowrap shrink-0">
                        {timeAgo(msg.created_at)}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-northpeak-card border-northpeak-surface">
              <CardContent className="p-4 flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-northpeak-text-dim" />
                <p className="text-sm text-northpeak-text-muted">Sin mensajes recientes</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent files */}
      {recentFiles && recentFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-northpeak-text-muted uppercase tracking-wider">Archivos recientes</h2>
            <Link href="/portal/files" className="text-xs text-northpeak-green hover:text-northpeak-green/80 flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {recentFiles.map((file) => {
              const isImage = file.file_type?.startsWith("image/");
              return (
                <a key={file.id} href={file.file_url} target="_blank" rel="noreferrer">
                  <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer overflow-hidden">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={file.file_url} alt={file.name} className="w-full h-20 object-cover" />
                    ) : (
                      <div className="w-full h-20 bg-northpeak-surface flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-northpeak-text-dim" />
                      </div>
                    )}
                    <CardContent className="p-2.5">
                      <p className="text-xs text-northpeak-text truncate">{file.name}</p>
                      <p className="text-[10px] text-northpeak-text-dim">{timeAgo(file.created_at)}</p>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-northpeak-text-muted uppercase tracking-wider">Accesos rápidos</h2>
        <DashboardQuickLinks links={quickLinks} />
      </div>

    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CreditCard, Flag, Briefcase, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "payment" | "project" | "milestone";
  completed: boolean;
  subtitle: string;    // client name
  clientId?: string;
  amount?: number;
  overdue?: boolean;
}

const TYPE_CONFIG = {
  payment:   { icon: CreditCard, bg: "bg-yellow-400/10",       text: "text-yellow-400",      label: "Pago" },
  project:   { icon: Briefcase,  bg: "bg-purple-400/10",       text: "text-purple-400",      label: "Proyecto" },
  milestone: { icon: Flag,       bg: "bg-northpeak-blue/10",   text: "text-northpeak-blue",  label: "Hito" },
  done:      { icon: Flag,       bg: "bg-northpeak-green/10",  text: "text-northpeak-green", label: "Completado" },
  overdue:   { icon: AlertCircle,bg: "bg-red-400/10",          text: "text-red-400",         label: "Vencido" },
};

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function AdminCalendarPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState<number | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const all: CalendarEvent[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);

    // Clients map
    const { data: clients } = await supabase.from("clients").select("id, name");
    const clientMap = Object.fromEntries((clients ?? []).map(c => [c.id, c.name]));

    // Payments with due_date
    const { data: payments } = await supabase
      .from("payments")
      .select("id, concept, amount, status, due_date, client_id")
      .not("due_date", "is", null);

    for (const p of payments ?? []) {
      if (!p.due_date) continue;
      const dueDate = new Date(p.due_date + "T00:00:00");
      const overdue = dueDate < today && p.status !== "completed";
      all.push({
        id: `pay-${p.id}`,
        title: p.concept,
        date: p.due_date,
        type: "payment",
        completed: p.status === "completed",
        subtitle: clientMap[p.client_id] ?? "Cliente",
        clientId: p.client_id,
        amount: p.amount,
        overdue,
      });
    }

    // Projects with end_date
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name, end_date, status, client_id")
      .not("end_date", "is", null);

    for (const p of projects ?? []) {
      if (!p.end_date) continue;
      all.push({
        id: `proj-${p.id}`,
        title: p.name,
        date: p.end_date,
        type: "project",
        completed: p.status === "completed",
        subtitle: clientMap[p.client_id] ?? "Cliente",
        clientId: p.client_id,
      });
    }

    setEvents(all);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay    = new Date(year, month, 1);
  const lastDay     = new Date(year, month + 1, 0);
  const startPad    = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const monthName   = currentDate.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  // Group events by day
  const byDay: Record<number, CalendarEvent[]> = {};
  for (const ev of events) {
    const d = new Date(ev.date + "T12:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(ev);
    }
  }

  // Upcoming events (next 14 days)
  const upcoming = events
    .filter(ev => {
      const d = new Date(ev.date + "T12:00:00");
      const diff = d.getTime() - today.getTime();
      return diff >= 0 && diff <= 14 * 86400000 && !ev.completed;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  // Overdue events
  const overdue = events.filter(ev => ev.overdue);

  function configFor(ev: CalendarEvent) {
    if (ev.overdue)   return TYPE_CONFIG.overdue;
    if (ev.completed) return TYPE_CONFIG.done;
    return TYPE_CONFIG[ev.type] ?? TYPE_CONFIG.milestone;
  }

  const selectedEvents = selected ? (byDay[selected] || []) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">Calendario</h1>
          <p className="text-northpeak-text-muted mt-1">Pagos y proyectos de todos los clientes</p>
        </div>
        <button
          onClick={loadEvents}
          className="p-2 rounded-lg text-northpeak-text-muted hover:text-northpeak-text hover:bg-northpeak-surface transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="xl:col-span-2">
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardContent className="p-4 sm:p-6">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelected(null); }}
                  className="p-2 text-northpeak-text-muted hover:text-northpeak-text rounded-lg hover:bg-northpeak-surface transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-base font-heading font-semibold text-northpeak-text capitalize">{monthName}</h3>
                <button
                  onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelected(null); }}
                  className="p-2 text-northpeak-text-muted hover:text-northpeak-text rounded-lg hover:bg-northpeak-surface transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 gap-px bg-northpeak-surface rounded-lg overflow-hidden">
                {DAYS.map(d => (
                  <div key={d} className="bg-northpeak-card p-2 text-center text-xs font-medium text-northpeak-text-muted">{d}</div>
                ))}
                {Array.from({ length: startPad }).map((_, i) => (
                  <div key={`pad-${i}`} className="bg-northpeak-bg p-1.5 min-h-[72px]" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const evs = byDay[day] || [];
                  const isSel = selected === day;
                  const hasOverdue = evs.some(e => e.overdue);

                  return (
                    <div
                      key={day}
                      onClick={() => setSelected(isSel ? null : day)}
                      className={cn(
                        "bg-northpeak-bg p-1.5 min-h-[72px] cursor-pointer transition-colors hover:bg-northpeak-surface",
                        isToday(day) && "ring-2 ring-inset ring-northpeak-green/50",
                        isSel && "bg-northpeak-surface",
                        hasOverdue && "ring-1 ring-inset ring-red-400/30"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-medium",
                        isToday(day) ? "text-northpeak-green" : "text-northpeak-text-muted"
                      )}>
                        {day}
                      </span>
                      <div className="mt-0.5 space-y-0.5">
                        {evs.slice(0, 2).map(ev => {
                          const cfg = configFor(ev);
                          return (
                            <div
                              key={ev.id}
                              className={cn("text-[10px] leading-tight rounded px-1 py-0.5 truncate", cfg.bg, cfg.text)}
                              title={`${ev.title} — ${ev.subtitle}`}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                        {evs.length > 2 && (
                          <div className="text-[10px] text-northpeak-text-dim px-1">+{evs.length - 2}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected day detail */}
              {selected && selectedEvents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium text-northpeak-text-muted uppercase tracking-wider">
                    {new Date(year, month, selected).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  {selectedEvents.map(ev => {
                    const cfg = configFor(ev);
                    return (
                      <div key={ev.id} className={cn("flex items-start justify-between gap-3 rounded-lg p-3", cfg.bg)}>
                        <div className="flex items-start gap-3 min-w-0">
                          <cfg.icon className={cn("h-4 w-4 shrink-0 mt-0.5", cfg.text)} />
                          <div className="min-w-0">
                            <p className={cn("text-sm font-medium truncate", cfg.text)}>{ev.title}</p>
                            <p className="text-xs text-northpeak-text-muted">{ev.subtitle}</p>
                            {ev.amount && (
                              <p className={cn("text-xs font-bold mt-0.5", cfg.text)}>
                                ${Number(ev.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                              </p>
                            )}
                          </div>
                        </div>
                        {ev.clientId && (
                          <Link
                            href={`/admin/clients/${ev.clientId}`}
                            className="text-xs text-northpeak-text-muted hover:text-northpeak-text shrink-0 underline underline-offset-2"
                          >
                            Ver cliente
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 flex-wrap mt-4 pt-3 border-t border-northpeak-surface">
                {[
                  { color: "bg-yellow-400/30", label: "Pago" },
                  { color: "bg-purple-400/30", label: "Proyecto" },
                  { color: "bg-northpeak-green/30", label: "Completado" },
                  { color: "bg-red-400/30", label: "Vencido" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={cn("h-2.5 w-2.5 rounded-sm", l.color)} />
                    <span className="text-xs text-northpeak-text-muted">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: overdue + upcoming */}
        <div className="space-y-4">
          {/* Overdue */}
          {overdue.length > 0 && (
            <Card className="bg-northpeak-card border-red-400/20">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Vencidos ({overdue.length})
                </p>
                <div className="space-y-2">
                  {overdue.map(ev => (
                    <div key={ev.id} className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-northpeak-text truncate">{ev.title}</p>
                        <p className="text-[11px] text-northpeak-text-muted">
                          {ev.subtitle} · {new Date(ev.date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                        </p>
                        {ev.amount && (
                          <p className="text-[11px] font-bold text-red-400">
                            ${Number(ev.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                      {ev.clientId && (
                        <Link href={`/admin/clients/${ev.clientId}`} className="text-[10px] text-red-400 hover:text-red-300 shrink-0 underline underline-offset-1">
                          Ver
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming 14 days */}
          <Card className="bg-northpeak-card border-northpeak-surface">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-northpeak-text-muted uppercase tracking-wider mb-3">
                Próximos 14 días
              </p>
              {upcoming.length === 0 ? (
                <p className="text-xs text-northpeak-text-dim">Sin eventos próximos.</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(ev => {
                    const cfg = configFor(ev);
                    return (
                      <div key={ev.id} className="flex items-start gap-2">
                        <cfg.icon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", cfg.text)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-northpeak-text truncate">{ev.title}</p>
                          <p className="text-[11px] text-northpeak-text-muted">
                            {ev.subtitle} · {new Date(ev.date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                          </p>
                          {ev.amount && (
                            <p className={cn("text-[11px] font-bold", cfg.text)}>
                              ${Number(ev.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                        {ev.clientId && (
                          <Link href={`/admin/clients/${ev.clientId}`} className="text-[10px] text-northpeak-text-muted hover:text-northpeak-text shrink-0 underline underline-offset-1">
                            Ver
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

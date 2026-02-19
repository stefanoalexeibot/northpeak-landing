"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, CreditCard, Flag, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string (YYYY-MM-DD)
  type: "milestone" | "payment" | "project" | "entregable";
  completed?: boolean;
  subtitle?: string; // project name, concept, etc.
  amount?: number;   // for payments
}

interface Props {
  events: CalendarEvent[];
}

const EVENT_STYLES: Record<string, { bg: string; text: string }> = {
  milestone:  { bg: "bg-northpeak-blue/10",   text: "text-northpeak-blue" },
  payment:    { bg: "bg-yellow-400/10",         text: "text-yellow-400" },
  project:    { bg: "bg-purple-400/10",         text: "text-purple-400" },
  entregable: { bg: "bg-northpeak-green/10",   text: "text-northpeak-green" },
  done:       { bg: "bg-northpeak-green/10",    text: "text-northpeak-green" },
};

export default function ProjectCalendar({ events }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState<number | null>(null);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay    = new Date(year, month, 1);
  const lastDay     = new Date(year, month + 1, 0);
  const startPad    = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const monthName = currentDate.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  // Group events by day number in the current month
  const byDay: Record<number, CalendarEvent[]> = {};
  for (const ev of events) {
    const d = new Date(ev.date + "T12:00:00"); // noon to avoid timezone shifts
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(ev);
    }
  }

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Selected day events
  const selectedEvents = selected ? (byDay[selected] || []) : [];

  function styleFor(ev: CalendarEvent) {
    if (ev.completed) return EVENT_STYLES.done;
    return EVENT_STYLES[ev.type] ?? EVENT_STYLES.milestone;
  }

  function IconFor({ ev }: { ev: CalendarEvent }) {
    if (ev.completed) return <CheckCircle className="h-2.5 w-2.5 inline mr-0.5 shrink-0" />;
    if (ev.type === "payment") return <CreditCard className="h-2.5 w-2.5 inline mr-0.5 shrink-0" />;
    if (ev.type === "entregable") return <Package className="h-2.5 w-2.5 inline mr-0.5 shrink-0" />;
    return <Flag className="h-2.5 w-2.5 inline mr-0.5 shrink-0" />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="p-2 text-northpeak-text-muted hover:text-northpeak-text rounded-lg hover:bg-northpeak-surface transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-base font-heading font-semibold text-northpeak-text capitalize">
          {monthName}
        </h3>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="p-2 text-northpeak-text-muted hover:text-northpeak-text rounded-lg hover:bg-northpeak-surface transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-northpeak-surface rounded-lg overflow-hidden">
        {days.map(d => (
          <div key={d} className="bg-northpeak-card p-2 text-center text-xs font-medium text-northpeak-text-muted">
            {d}
          </div>
        ))}

        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} className="bg-northpeak-bg p-1.5 min-h-[72px]" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day   = i + 1;
          const evs   = byDay[day] || [];
          const isSel = selected === day;

          return (
            <div
              key={day}
              onClick={() => setSelected(isSel ? null : day)}
              className={cn(
                "bg-northpeak-bg p-1.5 min-h-[72px] cursor-pointer transition-colors hover:bg-northpeak-surface",
                isToday(day) && "ring-2 ring-inset ring-northpeak-green/50",
                isSel && "bg-northpeak-surface"
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
                  const s = styleFor(ev);
                  return (
                    <div
                      key={ev.id}
                      className={cn("text-[10px] leading-tight rounded px-1 py-0.5 truncate flex items-center gap-0.5", s.bg, s.text)}
                      title={ev.subtitle ? `${ev.title} — ${ev.subtitle}` : ev.title}
                    >
                      <IconFor ev={ev} />
                      <span className="truncate">{ev.title}</span>
                    </div>
                  );
                })}
                {evs.length > 2 && (
                  <div className="text-[10px] text-northpeak-text-dim px-1">+{evs.length - 2} más</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selected && selectedEvents.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-northpeak-text-muted uppercase tracking-wider">
            {new Date(year, month, selected).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          {selectedEvents.map(ev => {
            const s = styleFor(ev);
            return (
              <div key={ev.id} className={cn("flex items-start gap-3 rounded-lg p-3", s.bg)}>
                <div className={cn("mt-0.5 shrink-0", s.text)}>
                  {ev.type === "payment" ? (
                    <CreditCard className="h-4 w-4" />
                  ) : ev.type === "entregable" ? (
                    <Package className="h-4 w-4" />
                  ) : (
                    <Flag className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className={cn("text-sm font-medium", s.text)}>{ev.title}</p>
                  {ev.subtitle && (
                    <p className="text-xs text-northpeak-text-muted mt-0.5">{ev.subtitle}</p>
                  )}
                  {ev.amount && (
                    <p className={cn("text-xs font-bold mt-0.5", s.text)}>
                      ${Number(ev.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap pt-1">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-northpeak-blue/30" />
          <span className="text-xs text-northpeak-text-muted">Hito</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-yellow-400/30" />
          <span className="text-xs text-northpeak-text-muted">Pago</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-northpeak-green/30" />
          <span className="text-xs text-northpeak-text-muted">Entregable / Completado</span>
        </div>
      </div>
    </div>
  );
}

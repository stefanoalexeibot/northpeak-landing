"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectMilestone } from "@/lib/types";

interface Props {
  milestones: (ProjectMilestone & { project?: { id: string; name: string } })[];
}

export default function ProjectCalendar({ milestones }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const monthName = currentDate.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  // Map milestones to day numbers
  const milestonesByDay: Record<number, (ProjectMilestone & { project?: { id: string; name: string } })[]> = {};
  for (const m of milestones) {
    const d = new Date(m.due_date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!milestonesByDay[day]) milestonesByDay[day] = [];
      milestonesByDay[day].push(m);
    }
  }

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 text-northpeak-text-muted hover:text-northpeak-text">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-heading font-semibold text-northpeak-text capitalize">{monthName}</h3>
        <button onClick={nextMonth} className="p-2 text-northpeak-text-muted hover:text-northpeak-text">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-northpeak-surface rounded-lg overflow-hidden">
        {days.map(d => (
          <div key={d} className="bg-northpeak-card p-2 text-center text-xs font-medium text-northpeak-text-muted">
            {d}
          </div>
        ))}

        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} className="bg-northpeak-bg p-2 min-h-[80px]" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayMilestones = milestonesByDay[day] || [];

          return (
            <div
              key={day}
              className={cn(
                "bg-northpeak-bg p-2 min-h-[80px]",
                isToday(day) && "ring-2 ring-inset ring-northpeak-green/50"
              )}
            >
              <span className={cn(
                "text-xs font-medium",
                isToday(day) ? "text-northpeak-green" : "text-northpeak-text-muted"
              )}>
                {day}
              </span>
              <div className="mt-1 space-y-1">
                {dayMilestones.map(m => (
                  <div
                    key={m.id}
                    className={cn(
                      "text-[10px] leading-tight rounded px-1 py-0.5 truncate",
                      m.completed
                        ? "bg-northpeak-green/10 text-northpeak-green"
                        : "bg-northpeak-blue/10 text-northpeak-blue"
                    )}
                    title={`${m.title}${m.project ? ` — ${m.project.name}` : ""}`}
                  >
                    {m.completed && <CheckCircle className="h-2.5 w-2.5 inline mr-0.5" />}
                    {m.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

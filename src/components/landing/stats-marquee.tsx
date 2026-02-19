"use client";

import { Bot, TrendingUp, Star, Zap, Clock, BarChart2, CheckCircle, Users } from "lucide-react";

const STATS = [
  { Icon: Bot, text: "+40 empresas automatizadas" },
  { Icon: TrendingUp, text: "3.2× más conversiones" },
  { Icon: Star, text: "4.9 / 5 satisfacción" },
  { Icon: Zap, text: "Activo en 7 días" },
  { Icon: Clock, text: "Atención 24/7 sin descanso" },
  { Icon: BarChart2, text: "−42% costo por lead" },
  { Icon: CheckCircle, text: "Respuesta en segundos" },
  { Icon: Users, text: "Sin contratar más personal" },
];

// Double the array for seamless loop
const ITEMS = [...STATS, ...STATS];

export default function StatsMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-northpeak-surface bg-northpeak-card/50 py-4">
      {/* Fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-northpeak-bg to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-northpeak-bg to-transparent" />

      <div className="flex gap-0 animate-marquee whitespace-nowrap">
        {ITEMS.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2.5 px-8 text-sm text-northpeak-text-muted font-mono"
          >
            <item.Icon className="h-3.5 w-3.5 text-northpeak-green shrink-0" />
            {item.text}
            <span className="text-northpeak-surface ml-4">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

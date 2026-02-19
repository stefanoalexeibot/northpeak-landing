"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CalendarCheck, TrendingUp, Zap, MessageSquare } from "lucide-react";

type FeedItem = {
  id: number;
  Icon: typeof Bot;
  color: string;
  bg: string;
  text: string;
  badge: string;
  badgeColor: string;
};

const FEED_POOL: Omit<FeedItem, "id">[] = [
  { Icon: Bot, color: "text-northpeak-green", bg: "bg-northpeak-green/10", text: "Lead calificado automáticamente", badge: "Restaurante MTY", badgeColor: "text-purple-400" },
  { Icon: CalendarCheck, color: "text-blue-400", bg: "bg-blue-400/10", text: "Cita agendada sin intervención", badge: "Clínica Dental", badgeColor: "text-blue-400" },
  { Icon: TrendingUp, color: "text-northpeak-green", bg: "bg-northpeak-green/10", text: "Lead cerrado · 3× ROI", badge: "Inmobiliaria", badgeColor: "text-northpeak-green" },
  { Icon: MessageSquare, color: "text-yellow-400", bg: "bg-yellow-400/10", text: "Nuevo lead ingresó al pipeline", badge: "Constructora NL", badgeColor: "text-yellow-400" },
  { Icon: Bot, color: "text-purple-400", bg: "bg-purple-400/10", text: "Lead calificado automáticamente", badge: "Spa & Wellness", badgeColor: "text-purple-400" },
  { Icon: CalendarCheck, color: "text-blue-400", bg: "bg-blue-400/10", text: "Reservación confirmada por IA", badge: "Restaurante", badgeColor: "text-blue-400" },
  { Icon: Zap, color: "text-northpeak-green", bg: "bg-northpeak-green/10", text: "Pipeline actualizado en tiempo real", badge: "Auto Dealer", badgeColor: "text-northpeak-green" },
];

let globalId = 0;

function makeItem(pool: typeof FEED_POOL[0]): FeedItem {
  return { ...pool, id: ++globalId };
}

export default function HeroLiveFeed() {
  const [conversations, setConversations] = useState(47);
  const [leadsToday, setLeadsToday] = useState(12);
  const [feed, setFeed] = useState<FeedItem[]>(() =>
    FEED_POOL.slice(0, 4).map(makeItem)
  );

  // Slowly increment conversations
  useEffect(() => {
    const interval = setInterval(() => {
      setConversations((v) => v + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Add new feed item every ~3.5s
  useEffect(() => {
    let poolIndex = 4 % FEED_POOL.length;
    const interval = setInterval(() => {
      const newItem = makeItem(FEED_POOL[poolIndex % FEED_POOL.length]);
      poolIndex++;
      setLeadsToday((v) => (Math.random() < 0.3 ? v + 1 : v));
      setFeed((prev) => [newItem, ...prev.slice(0, 3)]);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[400px] mx-auto rounded-2xl border border-northpeak-surface bg-northpeak-card overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.5)]">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-northpeak-surface bg-northpeak-bg/60">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-northpeak-green opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-northpeak-green" />
          </span>
          <span className="font-mono text-[11px] tracking-[0.12em] text-northpeak-text font-semibold uppercase">
            Sistema NorthPeak · En vivo
          </span>
        </div>
        <span className="font-mono text-[10px] text-northpeak-text-dim">MTY · NL</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 divide-x divide-northpeak-surface border-b border-northpeak-surface">
        <div className="px-5 py-4">
          <p className="font-mono font-bold text-3xl text-northpeak-text leading-none mb-1">
            <motion.span
              key={conversations}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {conversations}
            </motion.span>
          </p>
          <p className="text-[11px] text-northpeak-text-dim leading-tight">conversaciones<br />activas ahora</p>
        </div>
        <div className="px-5 py-4">
          <p className="font-mono font-bold text-3xl text-northpeak-green leading-none mb-1">
            <motion.span
              key={leadsToday}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {leadsToday}
            </motion.span>
          </p>
          <p className="text-[11px] text-northpeak-text-dim leading-tight">leads calificados<br />hoy</p>
        </div>
      </div>

      {/* Activity feed */}
      <div className="px-5 py-4">
        <p className="font-mono text-[10px] tracking-[0.15em] text-northpeak-text-dim uppercase mb-3">
          Actividad reciente
        </p>
        <div className="space-y-2.5 overflow-hidden" style={{ height: "172px" }}>
          <AnimatePresence initial={false} mode="popLayout">
            {feed.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-northpeak-bg border border-northpeak-surface/60"
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                  <item.Icon className={`h-3.5 w-3.5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-northpeak-text leading-tight truncate">{item.text}</p>
                  <p className={`text-[10px] font-mono ${item.badgeColor} leading-tight`}>{item.badge}</p>
                </div>
                <span className="font-mono text-[9px] text-northpeak-text-dim shrink-0">ahora</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-northpeak-surface bg-northpeak-bg/40 flex items-center justify-between">
        <p className="text-[10px] text-northpeak-text-dim font-mono">Agentes IA operando 24/7</p>
        <span className="flex items-center gap-1 text-[10px] text-northpeak-green font-mono font-semibold">
          <Zap className="h-3 w-3" /> Activo
        </span>
      </div>
    </div>
  );
}

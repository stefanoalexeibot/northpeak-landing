"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Check, CheckCheck } from "lucide-react";

type Message = {
  from: "user" | "ai";
  text: string;
  delay: number;
};

type Scenario = {
  tab: string;
  contact: string;
  avatar: string;
  messages: Message[];
};

const scenarios: Scenario[] = [
  {
    tab: "Restaurante",
    contact: "La Hacienda MTY",
    avatar: "🍽️",
    messages: [
      { from: "user", text: "Hola, ¿tienen mesa para 4 esta noche a las 8pm?", delay: 700 },
      { from: "ai", text: "¡Hola! Claro que sí 🎉 ¿Me confirmas tu nombre y si prefieres interior o terraza?", delay: 2200 },
      { from: "user", text: "Carlos Ramírez, terraza por favor", delay: 3800 },
      { from: "ai", text: "Listo Carlos ✅ Mesa para 4 en terraza esta noche a las 8pm confirmada. ¡Te esperamos en Vasconcelos 500, San Pedro! 📍", delay: 5600 },
    ],
  },
  {
    tab: "Clínica",
    contact: "Clínica Dental Smile",
    avatar: "🦷",
    messages: [
      { from: "user", text: "Necesito una cita con el dentista lo antes posible", delay: 700 },
      { from: "ai", text: "Hola 😊 Con gusto. ¿Es para limpieza, revisión u otro tratamiento? ¿Prefieres mañana o tarde?", delay: 2200 },
      { from: "user", text: "Revisión, por las tardes", delay: 3800 },
      { from: "ai", text: "Tenemos disponibilidad mañana martes a las 4pm o jueves 5:30pm 📅 ¿Cuál te acomoda mejor?", delay: 5600 },
    ],
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5 rounded-2xl rounded-bl-sm bg-northpeak-card border border-northpeak-surface w-fit">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-northpeak-text-dim"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

export default function ChatbotDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  const scenario = scenarios[activeTab];

  // Clear all timers
  function clearTimers() {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }

  // Start animation sequence for current scenario
  function startSequence() {
    clearTimers();
    setVisibleCount(0);
    setShowTyping(false);

    scenario.messages.forEach((msg, i) => {
      // Show typing before AI messages
      if (msg.from === "ai") {
        const typingTimer = setTimeout(() => setShowTyping(true), msg.delay - 900);
        timerRefs.current.push(typingTimer);
      }

      const msgTimer = setTimeout(() => {
        setShowTyping(false);
        setVisibleCount(i + 1);
        // Show typing for next AI message
      }, msg.delay);
      timerRefs.current.push(msgTimer);
    });
  }

  // Intersection observer to auto-start
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          setTimeout(startSequence, 400);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // Restart when tab changes
  useEffect(() => {
    if (started) startSequence();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const visibleMessages = scenario.messages.slice(0, visibleCount);

  return (
    <div ref={sectionRef} className="flex flex-col items-center gap-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl border border-northpeak-surface bg-northpeak-card">
        {scenarios.map((s, i) => (
          <button
            key={s.tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === i
                ? "bg-northpeak-green text-northpeak-bg"
                : "text-northpeak-text-muted hover:text-northpeak-text"
              }`}
          >
            {s.tab}
          </button>
        ))}
      </div>

      {/* Phone frame */}
      <div className="relative w-[280px] rounded-[2.5rem] border-[6px] border-northpeak-surface bg-northpeak-bg shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1 bg-[#075E54]">
          <span className="font-mono text-[10px] text-white/70">9:41</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-white/70">●●●</span>
          </div>
        </div>

        {/* WA Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#075E54]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-northpeak-green/20 border border-northpeak-green/30 text-lg shrink-0">
            {scenario.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">{scenario.contact}</p>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-northpeak-green" />
              <p className="text-[10px] text-white/60 leading-tight">IA NorthPeak · En línea</p>
            </div>
          </div>
          <Bot className="h-4 w-4 text-northpeak-green shrink-0" />
        </div>

        {/* Chat area */}
        <div className="h-[340px] overflow-hidden bg-[#0A0B10] px-3 py-3 flex flex-col gap-2">
          {/* Date chip */}
          <div className="text-center">
            <span className="text-[10px] text-northpeak-text-dim bg-northpeak-surface/60 px-2.5 py-0.5 rounded-full">
              Hoy
            </span>
          </div>

          <AnimatePresence mode="sync">
            {visibleMessages.map((msg, i) => (
              <motion.div
                key={`${activeTab}-${i}`}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[210px] px-3 py-2 text-[12px] leading-snug ${msg.from === "user"
                      ? "rounded-2xl rounded-br-sm bg-[#005C4B] text-white"
                      : "rounded-2xl rounded-bl-sm bg-northpeak-card border border-northpeak-surface/60 text-northpeak-text"
                    }`}
                >
                  {msg.text}
                  <div className={`flex items-center justify-end gap-0.5 mt-0.5 ${msg.from === "user" ? "" : "hidden"}`}>
                    <span className="text-[9px] text-white/50">
                      {msg.from === "user" ? "" : ""}
                    </span>
                    <CheckCheck className="h-2.5 w-2.5 text-[#53BDEB]" />
                  </div>
                </div>
              </motion.div>
            ))}

            {showTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#1F2C34] border-t border-white/5">
          <div className="flex-1 rounded-full bg-[#2A3942] px-3 py-1.5">
            <p className="text-[11px] text-white/30">Escribe un mensaje</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-northpeak-green shrink-0">
            <Check className="h-4 w-4 text-northpeak-bg" />
          </div>
        </div>
      </div>

      {/* Replay hint */}
      <button
        onClick={() => startSequence()}
        className="text-xs text-northpeak-text-dim hover:text-northpeak-green transition-colors font-mono"
      >
        ↻ Repetir demo
      </button>
    </div>
  );
}

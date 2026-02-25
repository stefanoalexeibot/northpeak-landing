"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, Settings2, TrendingUp, X, Zap, ArrowRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 1. HowItWorksSection — horizontal 3-step timeline
// ─────────────────────────────────────────────────────────────────────────────
const steps = [
    {
        n: "01",
        Icon: Search,
        title: "Análisis gratuito",
        desc: "Auditamos tu presencia digital y te entregamos un diagnóstico honesto en menos de 48 horas. Sin costo, sin trampa.",
        accent: "#00E5A0",
        emoji: "🔍",
    },
    {
        n: "02",
        Icon: Settings2,
        title: "Setup en 7 días",
        desc: "Configuramos el agente IA, el portal de clientes y la publicidad inteligente. Tú no mueves un dedo.",
        accent: "#3B82F6",
        emoji: "⚙️",
    },
    {
        n: "03",
        Icon: TrendingUp,
        title: "Ventas en automático",
        desc: "El ecosistema trabaja 24/7. Tú solo cierras los negocios que el sistema ya calificó y agendó por ti.",
        accent: "#A78BFA",
        emoji: "🚀",
    },
];

export function HowItWorksSection() {
    return (
        <section className="relative z-[2] py-24 px-6 sm:px-12"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.6 }}
                    className="text-center mb-16">
                    <p className="font-mono text-[11px] tracking-[0.25em] text-northpeak-green uppercase mb-4">
                        — Cómo funciona —
                    </p>
                    <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight">
                        De cero a vender en{" "}
                        <span style={{ color: "#00E5A0" }}>7 días</span>
                    </h2>
                </motion.div>

                {/* Steps */}
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {/* Connecting line (desktop) */}
                    <div className="absolute hidden md:block top-[52px] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
                        style={{ background: "linear-gradient(90deg, #00E5A0, #3B82F6, #A78BFA)" }} />

                    {steps.map((step, i) => (
                        <motion.div key={step.n}
                            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}
                            className="flex flex-col items-center text-center">
                            {/* Circle */}
                            <div className="relative mb-6 z-10">
                                <div className="w-[104px] h-[104px] rounded-full flex items-center justify-center"
                                    style={{
                                        background: "rgba(5,6,10,0.95)",
                                        border: `2px solid ${step.accent}`,
                                        boxShadow: `0 0 30px ${step.accent}40`,
                                    }}>
                                    <div className="text-center">
                                        <p className="text-3xl leading-none mb-0.5">{step.emoji}</p>
                                        <p className="font-mono text-[10px] tracking-widest" style={{ color: step.accent }}>
                                            {step.n}
                                        </p>
                                    </div>
                                </div>
                                {/* Pulse ring */}
                                <div className="absolute inset-0 rounded-full animate-ping opacity-10"
                                    style={{ border: `1px solid ${step.accent}`, animationDuration: `${2.5 + i * 0.5}s` }} />
                            </div>

                            {/* Card */}
                            <div className="rounded-2xl p-6 w-full"
                                style={{
                                    background: "rgba(5,6,10,0.85)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderTop: `2px solid ${step.accent}60`,
                                }}>
                                <h3 className="font-heading font-bold text-xl text-northpeak-text mb-3">{step.title}</h3>
                                <p className="text-sm text-northpeak-text-muted leading-relaxed">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                    transition={{ delay: 0.5 }} className="flex justify-center mt-12">
                    <Link href="/analizar"
                        className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-sm hover:bg-northpeak-green/90 transition-all hover:scale-[1.02]">
                        <Zap className="w-4 h-4" />
                        Empezar análisis gratuito
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LiveDemoPlayer — animated WhatsApp chat in the hero
// ─────────────────────────────────────────────────────────────────────────────
const CHAT: { from: "lead" | "ai"; text: string }[] = [
    { from: "lead", text: "Hola! Vi su anuncio, me interesa 👋" },
    { from: "ai", text: "¡Hola! ¿Qué tipo de negocio tienes? 🤖" },
    { from: "lead", text: "Clínica dental en Monterrey" },
    { from: "ai", text: "Perfecto ✅ ¿Cuántos leads recibes al mes?" },
    { from: "lead", text: "Como 10 al mes" },
    { from: "ai", text: "Entendido. ¿Te agendo llamada el miércoles 4pm? 📅" },
    { from: "lead", text: "¡Sí, perfecto!" },
    { from: "ai", text: "Listo ✅ ¡Te espero el miércoles!" },
];

export function LiveDemoPlayer() {
    const [count, setCount] = useState(0);
    const [typing, setTyping] = useState<"lead" | "ai" | null>("lead");
    const chatRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let idx = 0;

        const schedule = () => {
            if (idx >= CHAT.length) {
                // Reset
                timerRef.current = setTimeout(() => {
                    setCount(0);
                    setTyping(CHAT[0].from);
                    idx = 0;
                    timerRef.current = setTimeout(schedule, 800);
                }, 4000);
                return;
            }
            setTyping(CHAT[idx].from);
            timerRef.current = setTimeout(() => {
                setTyping(null);
                setCount(idx + 1);
                idx++;
                timerRef.current = setTimeout(schedule, 1200);
            }, 1400);
        };

        timerRef.current = setTimeout(schedule, 600);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [count, typing]);

    const visible = CHAT.slice(0, count);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="relative w-full max-w-[340px] mx-auto">

            {/* Glow */}
            <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-20"
                style={{ background: "radial-gradient(circle, #00E5A0, transparent 70%)" }} />

            {/* Phone shell */}
            <div className="relative rounded-[32px] overflow-hidden"
                style={{
                    background: "rgba(5,6,10,0.95)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,160,0.08)",
                }}>

                {/* Top bar */}
                <div className="flex items-center justify-between px-5 py-3"
                    style={{ background: "#075E54", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-northpeak-green/20 border border-northpeak-green/40 flex items-center justify-center text-sm">🤖</div>
                        <div>
                            <p className="text-white text-sm font-bold leading-none">IA NorthPeak</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-white/60 text-[10px]">En línea ahora</span>
                            </div>
                        </div>
                    </div>
                    {/* LIVE badge */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/90">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span className="text-white text-[9px] font-bold tracking-wider">LIVE</span>
                    </div>
                </div>

                {/* Chat area */}
                <div ref={chatRef}
                    className="flex flex-col gap-2.5 p-4 overflow-y-auto"
                    style={{ height: "320px", background: "#0A0B10" }}>

                    <AnimatePresence initial={false}>
                        {visible.map((msg, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.25 }}
                                className={`flex ${msg.from === "lead" ? "justify-end" : "justify-start"}`}>
                                <div className={`px-3 py-2 rounded-2xl max-w-[80%] text-[12px] leading-snug text-white ${msg.from === "lead"
                                        ? "rounded-br-none"
                                        : "rounded-bl-none"
                                    }`} style={{
                                        background: msg.from === "lead" ? "#005C4B" : "#1F2C34",
                                    }}>
                                    {msg.text}
                                    <span className="block text-right text-[8px] text-white/40 mt-0.5">
                                        {msg.from === "ai" ? "🤖" : "✓✓"}
                                    </span>
                                </div>
                            </motion.div>
                        ))}

                        {/* Typing indicator */}
                        {typing && (
                            <motion.div key="typing"
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                                className={`flex ${typing === "lead" ? "justify-end" : "justify-start"}`}>
                                <div className="px-4 py-3 rounded-2xl" style={{ background: typing === "lead" ? "#005C4B" : "#1F2C34" }}>
                                    <div className="flex items-center gap-1">
                                        {[0, 1, 2].map(d => (
                                            <span key={d} className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"
                                                style={{ animationDelay: `${d * 0.15}s` }} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom bar */}
                <div className="px-4 py-3 flex items-center gap-2"
                    style={{ background: "#1F2C34", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex-1 rounded-full px-3 py-1.5 text-[11px] text-white/30"
                        style={{ background: "rgba(255,255,255,0.06)" }}>
                        Respondiendo automáticamente...
                    </div>
                    <div className="w-7 h-7 rounded-full bg-northpeak-green/90 flex items-center justify-center text-xs">➤</div>
                </div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BigSectionNumber — número grande semitransparente de fondo
// ─────────────────────────────────────────────────────────────────────────────
export function BigSectionNumber({ n, accent }: { n: string; accent: string }) {
    return (
        <div
            className="absolute select-none pointer-events-none leading-none font-heading font-black"
            aria-hidden="true"
            style={{
                fontSize: "clamp(140px, 22vw, 260px)",
                color: accent,
                opacity: 0.038,
                top: "50%",
                right: "-2%",
                transform: "translateY(-50%)",
                letterSpacing: "-0.05em",
            }}>
            {n}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. ExitIntentModal — popup anti-abandono
// ─────────────────────────────────────────────────────────────────────────────
export function ExitIntentModal() {
    const [shown, setShown] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Wait 8 seconds before activating
        const activateTimer = setTimeout(() => {
            const handleMouseLeave = (e: MouseEvent) => {
                if (e.clientY < 8 && !dismissed) {
                    // Check session storage so it only shows once per session
                    const key = "np-exit-shown";
                    if (!sessionStorage.getItem(key)) {
                        setShown(true);
                        sessionStorage.setItem(key, "1");
                    }
                }
            };
            document.addEventListener("mouseleave", handleMouseLeave);
            return () => document.removeEventListener("mouseleave", handleMouseLeave);
        }, 8000);

        return () => clearTimeout(activateTimer);
    }, [dismissed]);

    const handleClose = () => {
        setShown(false);
        setDismissed(true);
    };

    return (
        <AnimatePresence>
            {shown && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center px-6"
                    style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
                    onClick={handleClose}>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 24, stiffness: 280 }}
                        onClick={e => e.stopPropagation()}
                        className="relative w-full max-w-lg rounded-3xl p-8 sm:p-10 text-center"
                        style={{
                            background: "rgba(5,6,10,0.98)",
                            border: "1px solid rgba(0,229,160,0.25)",
                            boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 60px rgba(0,229,160,0.08)",
                        }}>

                        {/* Close button */}
                        <button onClick={handleClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-northpeak-text-dim hover:text-northpeak-text transition-colors"
                            style={{ background: "rgba(255,255,255,0.06)" }}>
                            <X className="w-4 h-4" />
                        </button>

                        {/* Emoji + badge */}
                        <div className="text-4xl mb-4">🤔</div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-northpeak-green/10 border border-northpeak-green/30 mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-northpeak-green animate-pulse" />
                            <span className="font-mono text-[10px] text-northpeak-green tracking-widest uppercase">
                                Un momento antes de irte
                            </span>
                        </div>

                        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-northpeak-text mb-3">
                            ¿Te vas sin saber cuánto estás perdiendo?
                        </h3>
                        <p className="text-northpeak-text-muted text-sm leading-relaxed mb-7">
                            El análisis es <strong className="text-northpeak-text">100% gratuito</strong>. En menos de 48 horas sabrás exactamente cuántos leads estás dejando ir y cómo recuperarlos.
                        </p>

                        {/* Stats mini */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            {[
                                { val: "3.2×", label: "más ventas" },
                                { val: "+80%", label: "leads atendidos" },
                                { val: "7 días", label: "a tu primer lead" },
                            ].map(s => (
                                <div key={s.label} className="text-center">
                                    <p className="font-heading font-extrabold text-xl" style={{ color: "#00E5A0" }}>{s.val}</p>
                                    <p className="text-[10px] text-northpeak-text-dim font-mono">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/analizar" onClick={handleClose}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-sm hover:bg-northpeak-green/90 transition-all">
                                <Zap className="w-4 h-4" />
                                Quiero mi análisis gratis
                            </Link>
                            <button onClick={handleClose}
                                className="flex-1 px-6 py-3 rounded-xl text-northpeak-text-dim text-sm transition-all hover:text-northpeak-text"
                                style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                                No, gracias
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
    Bot, Zap, ShieldCheck, BarChart3,
    ArrowRight, Check, ChevronDown,
} from "lucide-react";
import GradientText from "@/components/reactbits/GradientText";
import ShinyText from "@/components/reactbits/ShinyText";

const Scene3D = dynamic(
    () => import("@/components/ecosystem/Scene3D").then((m) => m.Scene3D),
    { ssr: false, loading: () => null }
);

// ── Dot-grid background ────────────────────────────────────────────────────────
function DotGrid() {
    return (
        <div
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)",
            }}
        />
    );
}

// ── Ambient glow orbs ─────────────────────────────────────────────────────────
function GlowOrbs() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute rounded-full blur-[160px] opacity-15"
                style={{ width: 700, height: 700, top: "0%", left: "50%", transform: "translateX(-20%)", background: "radial-gradient(circle, #00E5A0, transparent 70%)" }} />
            <div className="absolute rounded-full blur-[120px] opacity-10"
                style={{ width: 500, height: 500, top: "60%", left: "5%", background: "radial-gradient(circle, #3B82F6, transparent 70%)" }} />
            <div className="absolute rounded-full blur-[100px] opacity-8"
                style={{ width: 400, height: 400, top: "40%", right: "0%", background: "radial-gradient(circle, #A78BFA, transparent 70%)" }} />
        </div>
    );
}

// ── Vertical progress bar ─────────────────────────────────────────────────────
function SectionProgressBar({ current, total }: { current: number; total: number }) {
    return (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3">
            {Array.from({ length: total }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => document.getElementById(`section-${String(i + 1).padStart(2, "0")}`)?.scrollIntoView({ behavior: "smooth" })}
                    className="group flex items-center gap-3"
                    aria-label={`Ir a sección ${i + 1}`}
                >
                    <div className={`transition-all duration-500 rounded-full ${current === i
                            ? "w-1.5 h-8 bg-northpeak-green shadow-[0_0_10px_rgba(0,229,160,0.6)]"
                            : "w-1 h-4 bg-northpeak-surface group-hover:bg-northpeak-text-dim"
                        }`} />
                    <span className={`font-mono text-[10px] transition-all duration-300 ${current === i ? "text-northpeak-green opacity-100" : "opacity-0 group-hover:opacity-60 text-northpeak-text-dim"
                        }`}>
                        {String(i + 1).padStart(2, "0")}
                    </span>
                </button>
            ))}
        </div>
    );
}

// ── Scroll indicator ──────────────────────────────────────────────────────────
function ScrollIndicator() {
    return (
        <motion.div className="flex flex-col items-center gap-2 text-northpeak-text-dim"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Scroll para explorar</span>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                <ChevronDown className="w-4 h-4" />
            </motion.div>
        </motion.div>
    );
}

// ── Glassmorphism card with strong contrast ────────────────────────────────────
function GlassCard({ children, className = "", accent = "#00E5A0" }: {
    children: React.ReactNode; className?: string; accent?: string;
}) {
    return (
        <div
            className={`relative rounded-3xl overflow-hidden ${className}`}
            style={{
                background: "rgba(5, 6, 10, 0.82)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.5), 0 0 60px rgba(${accent === "#00E5A0" ? "0,229,160" : accent === "#3B82F6" ? "59,130,246" : "167,139,250"
                    },0.05)`,
            }}
        >
            {/* Top edge glow */}
            <div className="absolute inset-x-0 top-0 h-px opacity-60"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}80, transparent)` }} />
            {children}
        </div>
    );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ n, text, color = "#00E5A0" }: { n: string; text: string; color?: string }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 max-w-[40px]" style={{ background: color, opacity: 0.4 }} />
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase" style={{ color }}>
                {n} · {text}
            </p>
            <div className="h-px flex-1 max-w-[40px]" style={{ background: color, opacity: 0.4 }} />
        </div>
    );
}

// ── Parallax section ──────────────────────────────────────────────────────────
function ParallaxSection({
    index, onVisible, children, className = "",
}: {
    index: number; onVisible: (i: number) => void; children: React.ReactNode; className?: string;
}) {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

    React.useEffect(() => {
        const unsub = scrollYProgress.on("change", (v) => {
            if (v > 0.28 && v < 0.82) onVisible(index);
        });
        return unsub;
    }, [scrollYProgress, index, onVisible]);

    const y = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);

    return (
        <section ref={ref} className={`min-h-screen flex items-center px-6 sm:px-12 lg:px-24 py-24 relative ${className}`}>
            <motion.div style={{ y }} className="max-w-7xl mx-auto w-full">
                {children}
            </motion.div>
        </section>
    );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const sections = [
    {
        n: "01", label: "Agente IA",
        Icon: Bot, iconColor: "text-northpeak-green", iconBg: "bg-northpeak-green/10 border-northpeak-green/20",
        title: "Tu Agente de IA en WhatsApp",
        subtitle: "Atiende, califica y cierra. Sin parar.",
        description: "Un agente inteligente responde cada mensaje en segundos, califica al lead con preguntas precisas y agenda la cita — las 24 horas, sin intervención humana.",
        features: [
            { emoji: "🤖", text: "Responde en < 3 segundos" },
            { emoji: "🧠", text: "Califica leads con IA" },
            { emoji: "📅", text: "Agenda citas automáticamente" },
            { emoji: "⚡️", text: "Opera 24/7 sin costo extra" },
        ],
        accent: "#00E5A0",
        stat: { val: "+80%", label: "de leads atendidos sin personal" },
    },
    {
        n: "02", label: "Portal de Clientes",
        Icon: ShieldCheck, iconColor: "text-blue-400", iconBg: "bg-blue-500/10 border-blue-500/20",
        title: "Portal exclusivo para tus clientes",
        subtitle: "Transparencia total. Profesionalismo real.",
        description: "Cada cliente accede a su propio portal: firma contratos con un clic, revisa el avance de su proyecto y descarga facturas — desde su celular, en tiempo real.",
        features: [
            { emoji: "✍🏼", text: "Firma digital de contratos" },
            { emoji: "📊", text: "Dashboard en tiempo real" },
            { emoji: "📁", text: "Gestión de archivos y facturas" },
            { emoji: "🔔", text: "Notificaciones automáticas" },
        ],
        accent: "#3B82F6",
        stat: { val: "100%", label: "de clientes con acceso propio" },
    },
    {
        n: "03", label: "Métricas",
        Icon: BarChart3, iconColor: "text-purple-400", iconBg: "bg-purple-500/10 border-purple-500/20",
        title: "Métricas de ventas, no de vanidad",
        subtitle: "Datos que mueven el negocio.",
        description: "No reportamos impresiones ni alcance. Te decimos cuántos leads entraron, cuántos se calificaron y cuántas ventas se cerraron. Números que impactan tu bolsillo.",
        features: [
            { emoji: "📈", text: "Leads y conversiones en vivo" },
            { emoji: "💰", text: "ROI medible por canal" },
            { emoji: "🎯", text: "Campañas con IA optimizada" },
            { emoji: "📋", text: "Reportes semanales automáticos" },
        ],
        accent: "#A78BFA",
        stat: { val: "3.2×", label: "ventas promedio vs antes de NorthPeak" },
    },
    {
        n: "04", label: "Stack Completo",
        Icon: Zap, iconColor: "text-northpeak-green", iconBg: "bg-northpeak-green/10 border-northpeak-green/20",
        title: "El ecosistema digital completo",
        subtitle: "Todo conectado. Todo automatizado.",
        description: "Agente IA + Portal de clientes + Publicidad inteligente + CRM automatizado — un solo sistema diseñado para que tu negocio venda en piloto automático.",
        features: [
            { emoji: "🔗", text: "Todos los canales integrados" },
            { emoji: "🚀", text: "Live en menos de 7 días" },
            { emoji: "🛡️", text: "Soporte dedicado incluido" },
            { emoji: "🌐", text: "Sitio web con IA integrada" },
        ],
        accent: "#00E5A0",
        stat: { val: "< 7d", label: "de firma a primer lead automatizado" },
    },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EcosystemPage() {
    const [currentSection, setCurrentSection] = useState(0);

    return (
        <main className="bg-northpeak-bg text-northpeak-text font-sans antialiased overflow-x-hidden selection:bg-northpeak-green/20"
            style={{ background: "#05060A" }}>

            {/* Backgrounds */}
            <DotGrid />
            <GlowOrbs />

            {/* 3D canvas — visible only on lg screens */}
            <div className="fixed inset-0 z-[1] pointer-events-none hidden lg:block">
                <Scene3D section={currentSection} />
            </div>

            {/* Progress bar */}
            <SectionProgressBar current={currentSection} total={sections.length} />

            {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
                style={{ background: "rgba(5,6,10,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
                <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-6 sm:px-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="NorthPeak" className="h-7" />
                    <nav className="hidden md:flex items-center gap-6 font-mono text-[11px] tracking-widest text-northpeak-text-muted uppercase">
                        {sections.map((s, i) => (
                            <button key={s.n}
                                onClick={() => document.getElementById(`section-${s.n}`)?.scrollIntoView({ behavior: "smooth" })}
                                className={`transition-colors hover:text-northpeak-green ${currentSection === i ? "text-northpeak-green" : ""}`}>
                                {s.label}
                            </button>
                        ))}
                    </nav>
                    <Link href="/analizar"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-bold hover:bg-northpeak-green/90 transition-all">
                        Analizar mi negocio <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </header>

            {/* ── HERO ────────────────────────────────────────────────────────────── */}
            <section className="relative z-[2] min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">

                {/* Semi-dark vignette to make hero text pop */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, transparent 0%, rgba(5,6,10,0.6) 100%)" }} />

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}
                    className="relative max-w-4xl mx-auto">

                    {/* Badge */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-northpeak-green/30 bg-northpeak-green/8 text-northpeak-green font-mono text-[11px] tracking-widest uppercase mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-northpeak-green animate-pulse" />
                        Ecosistema Digital · NorthPeak
                    </motion.div>

                    {/* Big headline */}
                    <h1 className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-[88px] tracking-tight leading-[1.0] mb-6">
                        <GradientText colors={["#E8E9ED", "#00E5A0", "#E8E9ED", "#3B82F6", "#E8E9ED"]}
                            animationSpeed={7} className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-[88px] leading-[1.0]">
                            La infraestructura que vende.
                        </GradientText>
                    </h1>

                    <p className="text-northpeak-text-muted text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
                        No es solo un sitio web. Es el sistema completo de captación, calificación y cierre —{" "}
                        <span className="text-northpeak-text font-semibold">en piloto automático</span>.
                    </p>

                    {/* Feature pills row */}
                    <div className="flex flex-wrap gap-2.5 justify-center mb-12">
                        {[
                            { emoji: "🤖", text: "Agente IA 24/7" },
                            { emoji: "📱", text: "App móvil" },
                            { emoji: "📊", text: "Portal del cliente" },
                            { emoji: "⚡️", text: "Live en 7 días" },
                            { emoji: "🛡️", text: "Sin permanencia" },
                        ].map((f) => (
                            <div key={f.text}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium text-northpeak-text-muted"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <span className="text-base leading-none">{f.emoji}</span>
                                {f.text}
                            </div>
                        ))}
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-4 justify-center mb-16">
                        <Link href="/analizar"
                            className="group flex items-center gap-2.5 px-8 py-4 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-base hover:bg-northpeak-green/90 transition-all hover:scale-[1.02] shadow-[0_8px_40px_rgba(0,229,160,0.3)]">
                            <Zap className="w-4 h-4" />
                            Analiza tu negocio gratis
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <a href="#section-01"
                            className="flex items-center gap-2 px-8 py-4 rounded-xl text-northpeak-text-muted font-medium transition-all hover:text-northpeak-text"
                            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                            Ver el ecosistema
                        </a>
                    </div>

                    <ScrollIndicator />
                </motion.div>
            </section>

            {/* ── SECTIONS ─────────────────────────────────────────────────────────── */}
            <div className="relative z-[2]">
                {sections.map((sec, idx) => (
                    <ParallaxSection key={sec.n} index={idx} onVisible={setCurrentSection}>
                        <div id={`section-${sec.n}`} className="scroll-mt-20" />

                        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center`}>
                            {/* Text side — always strong contrast */}
                            <div className={idx % 2 !== 0 ? "lg:order-2" : ""}>
                                <motion.div
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -24 : 24 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, amount: 0.35 }}
                                    transition={{ duration: 0.65 }}
                                >
                                    <GlassCard accent={sec.accent} className="p-8 lg:p-10">
                                        {/* Icon + Label */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${sec.iconBg}`}>
                                                <sec.Icon className={`w-5 h-5 ${sec.iconColor}`} />
                                            </div>
                                            <SectionLabel n={sec.n} text={sec.label} color={sec.accent} />
                                        </div>

                                        {/* Title */}
                                        <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight mb-3 text-northpeak-text">
                                            {sec.title}
                                        </h2>

                                        {/* Subtitle */}
                                        <p className="text-lg font-semibold mb-4" style={{ color: sec.accent }}>
                                            {sec.subtitle}
                                        </p>

                                        {/* Description */}
                                        <p className="text-northpeak-text-muted text-base leading-relaxed mb-7">
                                            {sec.description}
                                        </p>

                                        {/* Features grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                                            {sec.features.map((f, fi) => (
                                                <motion.div key={f.text}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.35, delay: fi * 0.07 }}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                    <span className="text-xl leading-none">{f.emoji}</span>
                                                    <span className="text-sm text-northpeak-text font-medium">{f.text}</span>
                                                    <Check className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: sec.accent }} />
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Stat */}
                                        <div className="flex items-center gap-4 pt-6"
                                            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                            <span className="font-heading font-extrabold text-4xl" style={{ color: sec.accent }}>
                                                {sec.stat.val}
                                            </span>
                                            <span className="text-sm text-northpeak-text-muted leading-tight max-w-[160px]">
                                                {sec.stat.label}
                                            </span>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            </div>

                            {/* 3D spacer only on desktop */}
                            <div className={`hidden lg:block h-[520px] ${idx % 2 !== 0 ? "lg:order-1" : ""}`} />
                        </div>
                    </ParallaxSection>
                ))}
            </div>

            {/* ── CTA FINAL ────────────────────────────────────────────────────────── */}
            <section className="relative z-[2] py-32 px-6 sm:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <GlassCard accent="#00E5A0" className="p-10 sm:p-14 text-center">
                        <p className="font-mono text-[11px] tracking-[0.25em] text-northpeak-green uppercase mb-6">
                            — Empieza hoy —
                        </p>

                        <h2 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6 text-northpeak-text">
                            ¿Listo para vender{" "}
                            <GradientText colors={["#00E5A0", "#3B82F6", "#00E5A0"]} animationSpeed={4}
                                className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl">
                                en automático?
                            </GradientText>
                        </h2>

                        <p className="text-northpeak-text-muted text-lg max-w-xl mx-auto mb-10">
                            Análisis gratuito de tu presencia digital. Sin compromisos.{" "}
                            <span className="text-northpeak-text font-semibold">En menos de 48 horas</span> tienes resultados.
                        </p>

                        {/* Trust pills */}
                        <div className="flex flex-wrap gap-3 justify-center mb-10">
                            {[
                                { emoji: "✅", text: "Sin contrato de permanencia" },
                                { emoji: "⚡️", text: "Live en 7 días" },
                                { emoji: "🛡️", text: "Garantía de resultados" },
                            ].map((p) => (
                                <div key={p.text}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-northpeak-text-muted"
                                    style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                                    <span>{p.emoji}</span>
                                    <ShinyText text={p.text} disabled={false} speed={4} className="text-sm" />
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/analizar"
                                className="group flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-base hover:bg-northpeak-green/90 transition-all hover:scale-[1.02] shadow-[0_12px_40px_rgba(0,229,160,0.35)]">
                                <Zap className="w-4 h-4" />
                                Analizar mi negocio gratis
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <Link href="/"
                                className="flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-medium text-northpeak-text-muted hover:text-northpeak-text transition-all"
                                style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                                Conocer más servicios
                            </Link>
                        </div>
                    </GlassCard>
                </motion.div>
            </section>

            {/* ── FOOTER mini ───────────────────────────────────────────────────────── */}
            <footer className="relative z-[2] py-8 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="NorthPeak" className="h-6 opacity-60" />
                    <p className="font-mono text-[11px] text-northpeak-text-dim tracking-wider">
                        © 2025 NorthPeak Digital · Monterrey, México
                    </p>
                    <Link href="/" className="text-northpeak-text-dim hover:text-northpeak-green font-mono text-[11px] transition-colors">
                        ← Volver al inicio
                    </Link>
                </div>
            </footer>
        </main>
    );
}

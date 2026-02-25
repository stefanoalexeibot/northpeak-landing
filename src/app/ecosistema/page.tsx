"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
                backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                maskImage:
                    "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)",
            }}
        />
    );
}

// ── Glow orbs ─────────────────────────────────────────────────────────────────
function GlowOrbs() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div
                className="absolute rounded-full blur-[140px] opacity-20"
                style={{
                    width: 600,
                    height: 600,
                    top: "5%",
                    left: "55%",
                    background: "radial-gradient(circle, #00E5A0, transparent 70%)",
                    transform: "translateX(-50%)",
                }}
            />
            <div
                className="absolute rounded-full blur-[120px] opacity-15"
                style={{
                    width: 500,
                    height: 500,
                    top: "55%",
                    left: "10%",
                    background: "radial-gradient(circle, #3B82F6, transparent 70%)",
                }}
            />
        </div>
    );
}

// ── Scroll indicator ──────────────────────────────────────────────────────────
function ScrollIndicator() {
    return (
        <motion.div
            className="flex flex-col items-center gap-2 text-northpeak-text-dim"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
        >
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Scroll para explorar</span>
            <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
                <ChevronDown className="w-4 h-4" />
            </motion.div>
        </motion.div>
    );
}

// ── Feature pill ──────────────────────────────────────────────────────────────
function FeaturePill({ emoji, text }: { emoji: string; text: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-northpeak-surface bg-northpeak-card/60 backdrop-blur-sm"
        >
            <span className="text-base leading-none">{emoji}</span>
            <span className="text-sm text-northpeak-text-muted font-medium">{text}</span>
        </motion.div>
    );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ n, text }: { n: string; text: string }) {
    return (
        <p className="font-mono text-[11px] tracking-[0.25em] text-northpeak-green uppercase mb-5 flex items-center gap-2">
            <span className="opacity-40">—</span>
            {n} · {text}
            <span className="opacity-40">—</span>
        </p>
    );
}

// ── Glassmorphism card ────────────────────────────────────────────────────────
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`relative rounded-3xl border border-white/8 bg-white/[0.03] backdrop-blur-xl p-8 ${className}`}
            style={{ boxShadow: "0 0 40px rgba(0,229,160,0.04), inset 0 1px 0 rgba(255,255,255,0.06)" }}
        >
            {children}
        </div>
    );
}

// ── Section with parallax ────────────────────────────────────────────────────
function ParallaxSection({
    index,
    onVisible,
    children,
    className = "",
}: {
    index: number;
    onVisible: (i: number) => void;
    children: React.ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

    React.useEffect(() => {
        const unsub = scrollYProgress.on("change", (v) => {
            if (v > 0.25 && v < 0.85) onVisible(index);
        });
        return unsub;
    }, [scrollYProgress, index, onVisible]);

    const y = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

    return (
        <section
            ref={ref}
            className={`min-h-screen flex items-center px-6 sm:px-12 lg:px-20 py-28 relative ${className}`}
        >
            <motion.div style={{ y }} className="max-w-7xl mx-auto w-full">
                {children}
            </motion.div>
        </section>
    );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const sections = [
    {
        n: "01",
        label: "Agente IA",
        icon: <Bot className="w-5 h-5" />,
        iconColor: "text-northpeak-green",
        iconBg: "bg-northpeak-green/10 border-northpeak-green/20",
        title: "Tu Agente de IA en WhatsApp",
        subtitle: "Atiende, califica y cierra. Sin parar.",
        description:
            "Un agente inteligente responde cada mensaje en segundos, califica al lead con preguntas precisas y agenda la cita — las 24 horas, sin intervención humana. Así de simple.",
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
        n: "02",
        label: "Portal de Clientes",
        icon: <ShieldCheck className="w-5 h-5" />,
        iconColor: "text-blue-400",
        iconBg: "bg-blue-500/10 border-blue-500/20",
        title: "Portal exclusivo para tus clientes",
        subtitle: "Transparencia profesional, 100%.",
        description:
            "Cada cliente tiene acceso privado a su propio portal donde firma contratos con un clic, revisa el avance de su proyecto y descarga facturas — desde su celular, en tiempo real.",
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
        n: "03",
        label: "Reportes y Métricas",
        icon: <BarChart3 className="w-5 h-5" />,
        iconColor: "text-purple-400",
        iconBg: "bg-purple-500/10 border-purple-500/20",
        title: "Métricas de ventas, no de vanidad",
        subtitle: "Datos que mueven el negocio.",
        description:
            "No reportamos impresiones ni alcance. Te decimos cuántos leads entraron, cuántos se calificaron y cuántas ventas se cerraron. Cada número tiene un impacto directo en tu bolsillo.",
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
        n: "04",
        label: "Ecosistema Completo",
        icon: <Zap className="w-5 h-5" />,
        iconColor: "text-northpeak-green",
        iconBg: "bg-northpeak-green/10 border-northpeak-green/20",
        title: "El ecosistema digital completo",
        subtitle: "Todo conectado, todo automatizado.",
        description:
            "Agente de IA + Portal de clientes + Publicidad inteligente + CRM automatizado funcionando juntos como un solo sistema diseñado para que tu negocio venda en piloto automático.",
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
        <main
            className="bg-northpeak-bg text-northpeak-text font-sans antialiased overflow-x-hidden selection:bg-northpeak-green/20"
            style={{ background: "#05060A" }}
        >
            {/* Backgrounds */}
            <DotGrid />
            <GlowOrbs />

            {/* Fixed 3D canvas */}
            <div className="fixed inset-0 z-[1] pointer-events-none lg:pointer-events-auto">
                <Scene3D section={currentSection} />
            </div>

            {/* Sticky navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-northpeak-surface/60 bg-northpeak-bg/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-6 sm:px-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="NorthPeak" className="h-7" />
                    <nav className="hidden md:flex items-center gap-6 font-mono text-[11px] tracking-widest text-northpeak-text-muted uppercase">
                        {sections.map((s) => (
                            <button
                                key={s.n}
                                onClick={() => {
                                    document.getElementById(`section-${s.n}`)?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className={`transition-colors hover:text-northpeak-green ${currentSection === sections.indexOf(s) ? "text-northpeak-green" : ""}`}
                            >
                                {s.n}
                            </button>
                        ))}
                    </nav>
                    <Link
                        href="/analizar"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-bold hover:bg-northpeak-green/90 transition-all"
                    >
                        Analizar mi negocio <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </header>

            {/* ── HERO ────────────────────────────────────────────────────────────── */}
            <section className="relative z-[2] min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-northpeak-green/30 bg-northpeak-green/5 text-northpeak-green font-mono text-[11px] tracking-widest uppercase mb-8"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-northpeak-green animate-pulse" />
                        Ecosistema Digital NorthPeak
                    </motion.div>

                    {/* Headline */}
                    <h1 className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-tight mb-6">
                        <GradientText
                            colors={["#E8E9ED", "#00E5A0", "#E8E9ED", "#3B82F6", "#E8E9ED"]}
                            animationSpeed={6}
                            className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-8xl"
                        >
                            La infraestructura que hace vender.
                        </GradientText>
                    </h1>

                    {/* Sub */}
                    <p className="text-northpeak-text-muted text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
                        No es solo un sitio web. Es el sistema completo de captación, calificación y cierre —{" "}
                        <span className="text-northpeak-text font-semibold">en piloto automático</span>.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-3 justify-center mb-14">
                        {[
                            { emoji: "🤖", text: "Agente IA 24/7" },
                            { emoji: "📱", text: "iPhone App" },
                            { emoji: "📊", text: "Portal Exclusivo" },
                            { emoji: "⚡️", text: "Live en 7 días" },
                        ].map((f) => (
                            <FeaturePill key={f.text} emoji={f.emoji} text={f.text} />
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="flex flex-wrap gap-4 justify-center mb-16">
                        <Link
                            href="/analizar"
                            className="group flex items-center gap-2.5 px-8 py-4 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-base hover:bg-northpeak-green/90 transition-all hover:scale-[1.02] shadow-[0_8px_40px_rgba(0,229,160,0.3)]"
                        >
                            <Zap className="w-4 h-4" />
                            Analiza tu negocio gratis
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <a
                            href="#section-01"
                            className="flex items-center gap-2 px-8 py-4 rounded-xl border border-northpeak-surface text-northpeak-text-muted font-medium hover:border-northpeak-green/30 hover:text-northpeak-text transition-all"
                        >
                            Ver el ecosistema
                        </a>
                    </div>

                    <ScrollIndicator />
                </motion.div>
            </section>

            {/* ── SECTIONS ─────────────────────────────────────────────────────────── */}
            <div className="relative z-[2]">
                {sections.map((sec, idx) => (
                    <ParallaxSection
                        key={sec.n}
                        index={idx}
                        onVisible={setCurrentSection}
                        className={idx % 2 === 0 ? "" : ""}
                    >
                        <div id={`section-${sec.n}`} className="scroll-mt-20" />
                        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`}>
                            {/* Text side */}
                            <div className={idx % 2 !== 0 ? "lg:order-2" : ""}>
                                <motion.div
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, amount: 0.4 }}
                                    transition={{ duration: 0.7 }}
                                >
                                    <SectionLabel n={sec.n} text={sec.label} />

                                    <h2 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mb-4">
                                        {sec.title}
                                    </h2>

                                    <p
                                        className="text-xl font-medium mb-4"
                                        style={{ color: sec.accent }}
                                    >
                                        {sec.subtitle}
                                    </p>

                                    <p className="text-northpeak-text-muted text-lg leading-relaxed mb-8 max-w-lg">
                                        {sec.description}
                                    </p>

                                    {/* Features */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                                        {sec.features.map((f, fi) => (
                                            <motion.div
                                                key={f.text}
                                                initial={{ opacity: 0, y: 12 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.4, delay: fi * 0.08 }}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-northpeak-surface/60 bg-northpeak-card/40"
                                            >
                                                <span className="text-xl leading-none">{f.emoji}</span>
                                                <span className="text-sm text-northpeak-text-muted font-medium">{f.text}</span>
                                                <Check className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: sec.accent }} />
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Big stat */}
                                    <GlassCard className="inline-flex flex-col gap-1 px-6 py-4">
                                        <span
                                            className="font-heading font-extrabold text-4xl"
                                            style={{ color: sec.accent }}
                                        >
                                            {sec.stat.val}
                                        </span>
                                        <span className="text-sm text-northpeak-text-muted font-medium">{sec.stat.label}</span>
                                    </GlassCard>
                                </motion.div>
                            </div>

                            {/* 3D spacer (desktop) — the fixed canvas shows here */}
                            <div className={`hidden lg:block h-[500px] ${idx % 2 !== 0 ? "lg:order-1" : ""}`} />
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
                    className="max-w-4xl mx-auto text-center"
                >
                    <GlassCard>
                        {/* Glow top */}
                        <div
                            className="absolute inset-x-0 top-0 h-px rounded-full opacity-70"
                            style={{ background: "linear-gradient(90deg, transparent, #00E5A0, transparent)" }}
                        />

                        <p className="font-mono text-[11px] tracking-[0.25em] text-northpeak-green uppercase mb-6">
                            — Empieza hoy —
                        </p>

                        <h2 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6">
                            ¿Listo para vender{" "}
                            <GradientText
                                colors={["#00E5A0", "#3B82F6", "#00E5A0"]}
                                animationSpeed={4}
                                className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl"
                            >
                                en automático?
                            </GradientText>
                        </h2>

                        <p className="text-northpeak-text-muted text-lg max-w-xl mx-auto mb-10">
                            Análisis gratuito de tu presencia digital. Sin compromisos.{" "}
                            <span className="text-northpeak-text">En menos de 48 horas</span> tienes resultados.
                        </p>

                        {/* Trust pills */}
                        <div className="flex flex-wrap gap-3 justify-center mb-10">
                            {[
                                { emoji: "✅", text: "Sin contrato de permanencia" },
                                { emoji: "⚡️", text: "Live en 7 días" },
                                { emoji: "🛡️", text: "Garantía de resultados" },
                            ].map((p) => (
                                <div
                                    key={p.text}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-northpeak-surface bg-northpeak-card/30 text-sm text-northpeak-text-muted"
                                >
                                    <span>{p.emoji}</span>
                                    <ShinyText text={p.text} disabled={false} speed={4} className="text-sm" />
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/analizar"
                                className="group flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-base hover:bg-northpeak-green/90 transition-all hover:scale-[1.02] shadow-[0_12px_40px_rgba(0,229,160,0.35)]"
                            >
                                <Zap className="w-4 h-4" />
                                Analizar mi negocio gratis
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <Link
                                href="/"
                                className="flex items-center justify-center gap-2 px-10 py-4 rounded-xl border border-northpeak-surface text-northpeak-text-muted font-medium hover:border-northpeak-green/30 hover:text-northpeak-text transition-all"
                            >
                                Conocer más servicios
                            </Link>
                        </div>
                    </GlassCard>
                </motion.div>
            </section>

            {/* ── Footer mini ───────────────────────────────────────────────────────── */}
            <footer className="relative z-[2] border-t border-northpeak-surface/40 py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="NorthPeak" className="h-6 opacity-70" />
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

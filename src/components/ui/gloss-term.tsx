"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Glosario centralizado de términos técnicos
// Añade aquí cualquier término nuevo y aparecerá en todo el sitio
// ─────────────────────────────────────────────────────────────────────────────
export const GLOSSARY: Record<string, { emoji: string; simple: string; extra?: string }> = {
    "CRM": {
        emoji: "📋",
        simple: "Una agenda de clientes inteligente",
        extra: "Registra quién te contactó, qué preguntó, en qué punto está y cuándo hacerl el seguimiento — todo solo.",
    },
    "pipeline": {
        emoji: "🚰",
        simple: "El recorrido que hace un cliente desde que te conoce hasta que te compra",
        extra: "Imagina un embudo: entra mucho interés arriba y sólo los más calificados llegan al fondo como ventas cerradas.",
    },
    "Pipeline": {
        emoji: "🚰",
        simple: "El recorrido que hace un cliente desde que te conoce hasta que te compra",
        extra: "Imagina un embudo: entra mucho interés arriba y sólo los más calificados llegan al fondo como ventas cerradas.",
    },
    "chatbot IA": {
        emoji: "🤖",
        simple: "Un empleado virtual que responde mensajes 24/7, sin descanso",
        extra: "Atiende WhatsApp, web e Instagram al mismo tiempo. Entiende preguntas en lenguaje natural y califica al cliente antes de pasarlo contigo.",
    },
    "Chatbot IA": {
        emoji: "🤖",
        simple: "Un empleado virtual que responde mensajes 24/7, sin descanso",
        extra: "Atiende WhatsApp, web e Instagram al mismo tiempo. Entiende preguntas en lenguaje natural y califica al cliente antes de pasarlo contigo.",
    },
    "responsive": {
        emoji: "📱",
        simple: "Tu sitio se ve perfecto en celular, tablet y computadora",
        extra: "El 80% de tus clientes te visitan desde el celular. Un sitio no responsive los espanta automáticamente.",
    },
    "Responsive": {
        emoji: "📱",
        simple: "Tu sitio se ve perfecto en celular, tablet y computadora",
        extra: "El 80% de tus clientes te visitan desde el celular. Un sitio no responsive los espanta automáticamente.",
    },
    "integraciones llave en mano": {
        emoji: "🔑",
        simple: "Todo conectado desde el día 1, sin que tú configures nada",
        extra: "WhatsApp, Google Ads, tu calendario, el CRM y más — ya funcionando cuando entregamos el sistema.",
    },
    "Integraciones llave en mano": {
        emoji: "🔑",
        simple: "Todo conectado desde el día 1, sin que tú configures nada",
        extra: "WhatsApp, Google Ads, tu calendario, el CRM y más — ya funcionando cuando entregamos el sistema.",
    },
    "leads": {
        emoji: "🎯",
        simple: "Personas que mostraron interés en tu negocio",
        extra: "Un lead no es un cliente todavía — es alguien que levantó la mano. Tu trabajo (o el del sistema) es convertirlo en venta.",
    },
    "Leads": {
        emoji: "🎯",
        simple: "Personas que mostraron interés en tu negocio",
        extra: "Un lead no es un cliente todavía — es alguien que levantó la mano. Tu trabajo (o el del sistema) es convertirlo en venta.",
    },
    "automatización": {
        emoji: "⚙️",
        simple: "Tareas que antes hacías a mano, ahora las hace el sistema solo",
        extra: "Responder mensajes, enviar cotizaciones, recordar citas, registrar clientes — todo sin que tú toques nada.",
    },
    "Automatización": {
        emoji: "⚙️",
        simple: "Tareas que antes hacías a mano, ahora las hace el sistema solo",
        extra: "Responder mensajes, enviar cotizaciones, recordar citas, registrar clientes — todo sin que tú toques nada.",
    },
    "embudo de ventas": {
        emoji: "🌪️",
        simple: "El camino visual de cómo un desconocido se convierte en tu cliente",
        extra: "Clic en anuncio → página de inicio → WhatsApp → cotización → venta. Optimizamos cada paso.",
    },
    "Embudo de ventas": {
        emoji: "🌪️",
        simple: "El camino visual de cómo un desconocido se convierte en tu cliente",
        extra: "Clic en anuncio → página de inicio → WhatsApp → cotización → venta. Optimizamos cada paso.",
    },
    "agente IA": {
        emoji: "🧠",
        simple: "Software inteligente que toma decisiones y actúa por ti",
        extra: "No solo contesta — analiza, califica, agenda y escala al humano sólo cuando es necesario.",
    },
    "Agente IA": {
        emoji: "🧠",
        simple: "Software inteligente que toma decisiones y actúa por ti",
        extra: "No solo contesta — analiza, califica, agenda y escala al humano sólo cuando es necesario.",
    },
    "ecosistema digital": {
        emoji: "🌐",
        simple: "Todos tus canales digitales conectados y trabajando juntos",
        extra: "Sitio web + redes sociales + WhatsApp + publicidad + CRM + app — todo un solo organismo coordinado.",
    },
    "Ecosistema digital": {
        emoji: "🌐",
        simple: "Todos tus canales digitales conectados y trabajando juntos",
        extra: "Sitio web + redes sociales + WhatsApp + publicidad + CRM + app — todo un solo organismo coordinado.",
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip flotante vía portal (nunca se corta por overflow hidden)
// ─────────────────────────────────────────────────────────────────────────────
interface TooltipProps {
    term: string;
    def: { emoji: string; simple: string; extra?: string };
    anchorRect: DOMRect;
    onClose: () => void;
}

function GlossTooltip({ term, def, anchorRect, onClose }: TooltipProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    // Smart positioning: prefer below the word, shift if near viewport edge
    const TOOLTIP_W = 280;
    const GAP = 10;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;

    let left = anchorRect.left + anchorRect.width / 2 - TOOLTIP_W / 2;
    left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12));

    const top = anchorRect.bottom + window.scrollY + GAP;

    return createPortal(
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
                position: "absolute",
                top,
                left,
                width: TOOLTIP_W,
                zIndex: 9999,
            }}
        >
            {/* Arrow */}
            <div
                style={{
                    position: "absolute",
                    top: -6,
                    left: Math.min(
                        Math.max(anchorRect.left + anchorRect.width / 2 - left - 6, 12),
                        TOOLTIP_W - 24
                    ),
                    width: 12,
                    height: 6,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: 12,
                        height: 12,
                        background: "rgba(0,229,160,0.18)",
                        border: "1px solid rgba(0,229,160,0.30)",
                        transform: "rotate(45deg) translate(-4px, -4px)",
                    }}
                />
            </div>

            {/* Card */}
            <div
                style={{
                    background: "rgba(5,6,10,0.97)",
                    border: "1px solid rgba(0,229,160,0.30)",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,160,0.08)",
                    backdropFilter: "blur(20px)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center gap-2.5 px-4 pt-3.5 pb-2.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                    <span className="text-xl leading-none">{def.emoji}</span>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="h-3 w-3" style={{ color: "#00E5A0" }} />
                            <span
                                className="font-mono text-[9px] tracking-widest uppercase"
                                style={{ color: "#00E5A0" }}
                            >
                                Significado
                            </span>
                        </div>
                        <p className="font-heading font-bold text-sm text-white mt-0.5 leading-snug">
                            {term}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-4 py-3">
                    <p className="text-[13px] leading-relaxed" style={{ color: "#C8CAD4" }}>
                        {def.simple}
                    </p>
                    {def.extra && (
                        <p className="text-[11px] leading-relaxed mt-2" style={{ color: "#6B7280" }}>
                            {def.extra}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>,
        document.body
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// GlossTerm — el componente que envuelves alrededor de la palabra técnica
// Uso: <GlossTerm term="CRM">CRM</GlossTerm>
// ─────────────────────────────────────────────────────────────────────────────
interface GlossTermProps {
    term: string;           // key de GLOSSARY
    children: React.ReactNode;
    className?: string;
}

export default function GlossTerm({ term, children, className = "" }: GlossTermProps) {
    const def = GLOSSARY[term];
    const [open, setOpen] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const ref = useRef<HTMLSpanElement>(null);
    const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!def) return <>{children}</>;

    const updateRect = () => {
        if (ref.current) setRect(ref.current.getBoundingClientRect());
    };

    const handleMouseEnter = () => {
        updateRect();
        hoverTimer.current = setTimeout(() => setOpen(true), 120);
    };
    const handleMouseLeave = () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        setOpen(false);
    };
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateRect();
        setOpen((v) => !v);
    };

    return (
        <>
            <span
                ref={ref}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                className={`inline cursor-help ${className}`}
                style={{
                    borderBottom: "2px dotted #00E5A0",
                    paddingBottom: "1px",
                    color: "inherit",
                }}
                aria-label={`Definición: ${term}`}
            >
                {children}
            </span>

            {mounted && open && rect && (
                <AnimatePresence>
                    <GlossTooltip
                        key={term}
                        term={term}
                        def={def}
                        anchorRect={rect}
                        onClose={() => setOpen(false)}
                    />
                </AnimatePresence>
            )}
        </>
    );
}

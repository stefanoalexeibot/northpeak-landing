"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, Sparkles } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Glosario centralizado
// ─────────────────────────────────────────────────────────────────────────────
export const GLOSSARY: Record<string, { emoji: string; simple: string; extra?: string }> = {
    "CRM": {
        emoji: "📋",
        simple: "Una agenda de clientes inteligente",
        extra: "Registra quién te contactó, qué preguntó, en qué punto está y cuándo hacer el seguimiento — todo solo.",
    },
    "pipeline": {
        emoji: "🚰",
        simple: "El recorrido que hace un cliente desde que te conoce hasta que te compra",
        extra: "Imagina un embudo: entra mucho interés arriba y solo los más calificados llegan al fondo como ventas cerradas.",
    },
    "Pipeline": {
        emoji: "🚰",
        simple: "El recorrido que hace un cliente desde que te conoce hasta que te compra",
        extra: "Imagina un embudo: entra mucho interés arriba y solo los más calificados llegan al fondo como ventas cerradas.",
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
        extra: "Un lead no es un cliente todavía — es alguien que levantó la mano. El sistema lo califica y lo convierte en venta.",
    },
    "Leads": {
        emoji: "🎯",
        simple: "Personas que mostraron interés en tu negocio",
        extra: "Un lead no es un cliente todavía — es alguien que levantó la mano. El sistema lo califica y lo convierte en venta.",
    },
    "lead": {
        emoji: "🎯",
        simple: "Una persona que mostró interés en tu negocio",
        extra: "Un lead no es cliente todavía — es alguien que levantó la mano. El sistema lo califica y lo convierte en venta.",
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
    "automatizado": {
        emoji: "⚙️",
        simple: "Que lo hace el sistema solo, sin que tú lo hagas manualmente",
        extra: "Responder mensajes, enviar cotizaciones, recordar citas — todo sin que tú toques nada.",
    },
    "embudo de ventas": {
        emoji: "🌪️",
        simple: "El camino visual de cómo un desconocido se convierte en tu cliente",
        extra: "Clic en anuncio → página → WhatsApp → cotización → venta. Optimizamos cada paso.",
    },
    "agente IA": {
        emoji: "🧠",
        simple: "Software inteligente que toma decisiones y actúa por ti",
        extra: "No solo contesta — analiza, califica, agenda y escala al humano solo cuando es necesario.",
    },
    "Agente IA": {
        emoji: "🧠",
        simple: "Software inteligente que toma decisiones y actúa por ti",
        extra: "No solo contesta — analiza, califica, agenda y escala al humano solo cuando es necesario.",
    },
    "agente de IA": {
        emoji: "🧠",
        simple: "Software inteligente que toma decisiones y actúa por ti",
        extra: "No solo contesta — analiza, califica, agenda y escala al humano solo cuando es necesario.",
    },
    "ecosistema digital": {
        emoji: "🌐",
        simple: "Todos tus canales digitales conectados y trabajando juntos",
        extra: "Sitio web + redes sociales + WhatsApp + publicidad + CRM — todo un solo organismo coordinado.",
    },
    "Ecosistema digital": {
        emoji: "🌐",
        simple: "Todos tus canales digitales conectados y trabajando juntos",
        extra: "Sitio web + redes sociales + WhatsApp + publicidad + CRM — todo un solo organismo coordinado.",
    },
    "ROI": {
        emoji: "📈",
        simple: "Cuánto dinero te regresa por cada peso que inviertes",
        extra: "Si inviertes $10,000 y generas $40,000 en ventas, tu ROI es 4x (cuatro veces lo invertido).",
    },
    "posicionamiento en Google": {
        emoji: "🔍",
        simple: "Que tu negocio aparezca de primero cuando alguien busca tu servicio",
        extra: "SEO y Google Maps optimizados para que te encuentren clientes nuevos sin pagar publicidad cada vez.",
    },
    "SEO": {
        emoji: "🔍",
        simple: "Que Google te muestre de primero cuando alguien busca tu servicio",
        extra: "Sin pagar por cada clic — optimizamos tu página y perfil para aparecer de forma orgánica.",
    },
    "conversión": {
        emoji: "💸",
        simple: "El momento en que un visitante o lead se convierte en cliente que paga",
        extra: "Si de 100 personas que llegan 5 compran, tu tasa de conversión es 5%. Nuestros sistemas la optimizan.",
    },
    "onboarding": {
        emoji: "🚀",
        simple: "El proceso inicial de configuración cuando empezamos a trabajar juntos",
        extra: "En la primera semana instalamos todo: conectamos tus canales, configuramos el agente IA y lo probamos.",
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// GlossHint — banner que aparece 1 sola vez para enseñar la feature
// ─────────────────────────────────────────────────────────────────────────────
export function GlossHint() {
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const alreadySeen = sessionStorage.getItem("gloss-hint-seen");
        if (!alreadySeen) {
            const timer = setTimeout(() => setVisible(true), 2200);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        setVisible(false);
        sessionStorage.setItem("gloss-hint-seen", "1");
    };

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 80, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 80, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 22, stiffness: 260, delay: 0 }}
                    className="fixed bottom-[88px] md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-80 z-[9998]"
                    style={{ pointerEvents: "all" }}
                >
                    <div
                        style={{
                            background: "rgba(5,6,10,0.97)",
                            border: "1px solid rgba(0,229,160,0.40)",
                            borderRadius: 16,
                            padding: "14px 16px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,160,0.08)",
                            backdropFilter: "blur(20px)",
                        }}
                    >
                        <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div
                                className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl"
                                style={{ background: "rgba(0,229,160,0.15)", border: "1px solid rgba(0,229,160,0.3)" }}
                            >
                                <Sparkles className="h-4 w-4" style={{ color: "#00E5A0" }} />
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-white leading-snug">
                                    ¿Ves las palabras con línea verde?
                                </p>
                                <p className="text-[12px] mt-0.5" style={{ color: "#8B8FA6" }}>
                                    Tócalas — tienen explicación en lenguaje simple, sin tecnicismos.
                                </p>
                                {/* Demo word */}
                                <p className="mt-2 text-[12px]" style={{ color: "#C8CAD4" }}>
                                    Por ejemplo:{" "}
                                    <span
                                        style={{
                                            borderBottom: "2px dotted #00E5A0",
                                            paddingBottom: "1px",
                                            color: "inherit",
                                        }}
                                    >
                                        leads
                                    </span>
                                    ,{" "}
                                    <span
                                        style={{
                                            borderBottom: "2px dotted #00E5A0",
                                            paddingBottom: "1px",
                                            color: "inherit",
                                        }}
                                    >
                                        CRM
                                    </span>
                                    ,{" "}
                                    <span
                                        style={{
                                            borderBottom: "2px dotted #00E5A0",
                                            paddingBottom: "1px",
                                            color: "inherit",
                                        }}
                                    >
                                        pipeline
                                    </span>
                                    …
                                </p>
                            </div>

                            {/* Close */}
                            <button
                                onClick={dismiss}
                                className="shrink-0 p-1 rounded-lg transition-colors hover:bg-white/10"
                                aria-label="Cerrar"
                            >
                                <X className="h-4 w-4" style={{ color: "#6B7280" }} />
                            </button>
                        </div>

                        {/* CTA button */}
                        <button
                            onClick={dismiss}
                            className="mt-3 w-full py-2 rounded-lg text-[12px] font-bold transition-all"
                            style={{
                                background: "rgba(0,229,160,0.15)",
                                border: "1px solid rgba(0,229,160,0.30)",
                                color: "#00E5A0",
                            }}
                        >
                            ¡Entendido!
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip flotante vía portal
// ─────────────────────────────────────────────────────────────────────────────
interface TooltipProps {
    term: string;
    def: { emoji: string; simple: string; extra?: string };
    anchorRect: DOMRect;
    onClose: () => void;
}

function GlossTooltip({ term, def, anchorRect, onClose }: TooltipProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    const TOOLTIP_W = 280;
    const GAP = 10;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;

    let left = anchorRect.left + anchorRect.width / 2 - TOOLTIP_W / 2;
    left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12));
    const top = anchorRect.bottom + window.scrollY + GAP;

    const arrowLeft = Math.min(
        Math.max(anchorRect.left + anchorRect.width / 2 - left - 6, 12),
        TOOLTIP_W - 24
    );

    return createPortal(
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ position: "absolute", top, left, width: TOOLTIP_W, zIndex: 9999 }}
        >
            {/* Arrow */}
            <div style={{ position: "absolute", top: -6, left: arrowLeft, width: 12, height: 6, overflow: "hidden" }}>
                <div style={{
                    width: 12, height: 12,
                    background: "rgba(0,229,160,0.18)",
                    border: "1px solid rgba(0,229,160,0.30)",
                    transform: "rotate(45deg) translate(-4px, -4px)",
                }} />
            </div>

            {/* Card */}
            <div style={{
                background: "rgba(5,6,10,0.97)",
                border: "1px solid rgba(0,229,160,0.30)",
                borderRadius: 16, overflow: "hidden",
                boxShadow: "0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,160,0.08)",
                backdropFilter: "blur(20px)",
            }}>
                <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-xl leading-none">{def.emoji}</span>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="h-3 w-3" style={{ color: "#00E5A0" }} />
                            <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "#00E5A0" }}>
                                Significado
                            </span>
                        </div>
                        <p className="font-heading font-bold text-sm text-white mt-0.5 leading-snug">{term}</p>
                    </div>
                </div>
                <div className="px-4 py-3">
                    <p className="text-[13px] leading-relaxed" style={{ color: "#C8CAD4" }}>{def.simple}</p>
                    {def.extra && (
                        <p className="text-[11px] leading-relaxed mt-2" style={{ color: "#6B7280" }}>{def.extra}</p>
                    )}
                </div>
            </div>
        </motion.div>,
        document.body
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// GlossTerm — envuelve una palabra técnica con línea punteada + tooltip
// ─────────────────────────────────────────────────────────────────────────────
interface GlossTermProps {
    term: string;
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
        hoverTimer.current = setTimeout(() => setOpen(true), 100);
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
                className={`inline cursor-help relative ${className}`}
                style={{
                    borderBottom: "2px dotted #00E5A0",
                    paddingBottom: "1px",
                    color: "inherit",
                    // Subtle green tint on the text itself to attract attention
                    textShadow: "0 0 12px rgba(0,229,160,0.15)",
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

// ─────────────────────────────────────────────────────────────────────────────
// AutoGloss — parsea un string y envuelve automáticamente los términos
// Uso: <AutoGloss text={svc.description} />
// ─────────────────────────────────────────────────────────────────────────────
const SORTED_TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

export function AutoGloss({ text, className }: { text: string; className?: string }) {
    const pattern = SORTED_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const regex = new RegExp(`(${pattern})`, "g");
    const parts = text.split(regex);

    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (GLOSSARY[part]) {
                    return (
                        <GlossTerm key={i} term={part}>
                            {part}
                        </GlossTerm>
                    );
                }
                return <React.Fragment key={i}>{part}</React.Fragment>;
            })}
        </span>
    );
}

import {
    Bot, MapPin, Target, Layers, Search, Settings2, Rocket,
    Clock, BarChart2, LayoutDashboard, Shield, Globe,
    Workflow, FileSearch, Timer,
} from "lucide-react";

// ── Case Studies ─────────────────────────────────────────────────────────────

export const caseStudies = [
    {
        industry: "Restaurante · San Pedro GG",
        bigStat: 1920,
        bigStatPrefix: "+",
        bigLabel: "seguidores + reservaciones IA",
        timeframe: "en 5 meses",
        description: "Sin sistema de captación. Con IA de contenido + agente de reservaciones por WhatsApp logramos crecimiento orgánico y automatizamos el 80% de las reservas.",
        tags: ["IA Conversacional", "Contenido IA", "WhatsApp"],
        metrics: [
            { label: "Reservaciones", value: "+34%" },
            { label: "Alcance orgánico", value: "4.8M" },
            { label: "Automatización", value: "80%" },
        ],
        accent: "text-purple-400",
        borderFrom: "rgba(168,85,247,0.3)",
        glow: "rgba(168,85,247,0.06)",
    },
    {
        industry: "Clínica Dental · MTY Centro",
        bigStat: 2,
        bigStatPrefix: "#",
        bigLabel: "en Google Maps",
        timeframe: "en 3 meses",
        description: "Solo 8 reseñas y cero pipeline digital. Implementamos captación automatizada + agente de citas por IA. Hoy el 60% de citas llegan sin intervención humana.",
        tags: ["Captación IA", "Google Maps", "Citas Automáticas"],
        metrics: [
            { label: "Reseñas Google", value: "8→142" },
            { label: "Citas nuevas/sem", value: "+58%" },
            { label: "Citas sin personal", value: "60%" },
        ],
        accent: "text-blue-400",
        borderFrom: "rgba(59,130,246,0.3)",
        glow: "rgba(59,130,246,0.06)",
    },
    {
        industry: "Constructora · Cumbres, NL",
        bigStat: 22,
        bigStatPrefix: "",
        bigLabel: "leads calificados por IA",
        timeframe: "en el primer mes",
        description: "Necesitaban prospectos con poder adquisitivo real. Agente de IA en WhatsApp calificó leads automáticamente. CPL 42% por debajo del promedio de la industria.",
        tags: ["Agente IA", "Meta Ads", "Lead Scoring"],
        metrics: [
            { label: "Costo por lead", value: "$168" },
            { label: "Ventas cerradas", value: "3" },
            { label: "CPL vs industria", value: "-42%" },
        ],
        accent: "text-northpeak-green",
        borderFrom: "rgba(0,229,160,0.3)",
        glow: "rgba(0,229,160,0.06)",
    },
];

// ── Services (Monthly) ──────────────────────────────────────────────────────

export const services = [
    {
        num: "01",
        Icon: Bot,
        name: "Agente IA en WhatsApp",
        price: "desde $4,500",
        period: "/mes",
        description: "Un agente de IA que atiende, califica y agenda citas por WhatsApp, 24 horas al día.",
        features: ["Respuesta inmediata 24/7", "Calificación automática", "Agenda citas sin personal", "Handoff al equipo humano"],
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-500/20",
    },
    {
        num: "02",
        Icon: MapPin,
        name: "Captación Local con IA",
        price: "desde $3,500",
        period: "/mes",
        description: "Domina las búsquedas locales y genera reseñas en piloto automático.",
        features: ["Google Maps optimizado", "Reseñas automatizadas", "SEO local con IA", "Perfil actualizado"],
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-500/20",
    },
    {
        num: "03",
        Icon: Target,
        name: "Publicidad Inteligente",
        price: "desde $6,000",
        period: "/mes",
        description: "Meta Ads y Google Ads con optimización automática por IA en tiempo real.",
        features: ["Meta Ads (FB + IG)", "Google Ads + IA", "Lead scoring automático", "Reportes semanales"],
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-500/20",
        featured: true,
    },
    {
        num: "04",
        Icon: Layers,
        name: "Stack Completo de Ventas",
        price: "desde $12,000",
        period: "/mes",
        description: "El sistema completo: captación + IA conversacional + seguimiento + portal exclusivo.",
        features: ["Todo lo anterior", "CRM automatizado", "Seguimiento con IA", "Portal de cliente"],
        color: "text-northpeak-green",
        bg: "bg-northpeak-green/10",
        border: "border-northpeak-green/20",
    },
];

// ── Process Steps ────────────────────────────────────────────────────────────

export const steps = [
    {
        num: "01",
        Icon: Search,
        title: "Auditamos tu pipeline",
        description: "Diagnóstico gratuito de dónde se pierden tus leads hoy. Sin venta, solo datos reales.",
    },
    {
        num: "02",
        Icon: Settings2,
        title: "Configuramos tu IA",
        description: "Diseñamos e implementamos los agentes, flujos y automatizaciones específicas para tu negocio.",
    },
    {
        num: "03",
        Icon: Rocket,
        title: "Activamos y escalamos",
        description: "Tu sistema entra en producción. Medimos cada lead, cada conversación y cada venta desde tu portal.",
    },
];

// ── Differentiators ─────────────────────────────────────────────────────────

export const differentiators = [
    {
        Icon: Clock,
        title: "Trabaja 24/7",
        description: "Tu IA nunca duerme, nunca se va de vacaciones, nunca olvida dar seguimiento. Cada lead recibe atención inmediata a cualquier hora.",
        color: "text-northpeak-green",
        bg: "bg-northpeak-green/10",
    },
    {
        Icon: BarChart2,
        title: "Métricas de ventas, no de marketing",
        description: "No te reportamos impresiones ni alcance. Te reportamos leads, conversaciones calificadas y ventas cerradas. Números que mueven el negocio.",
        color: "text-blue-400",
        bg: "bg-blue-400/10",
    },
    {
        Icon: LayoutDashboard,
        title: "Portal en tiempo real",
        description: "Ves cada lead que entra, cada conversación de tu IA y el estado de tu pipeline — en vivo, desde tu celular.",
        color: "text-purple-400",
        bg: "bg-purple-400/10",
    },
    {
        Icon: Shield,
        title: "Implementación en 7 días",
        description: "De onboarding a primer lead automatizado en menos de una semana. Sin proyectos eternos ni consultores que nunca entregan.",
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
    },
];

// ── One-Time Services ────────────────────────────────────────────────────────

export const oneTimeServices = [
    {
        Icon: Globe,
        name: "Sitio Web con IA Integrada",
        price: "$12,900",
        description: "Landing page profesional + chatbot de IA integrado que atiende y califica visitantes en tiempo real.",
        features: ["Diseño premium responsive", "Chatbot IA personalizado", "Formularios automatizados", "Entrega en 7 días"],
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-500/20",
    },
    {
        Icon: Bot,
        name: "Setup Agente IA en WhatsApp",
        price: "$8,500",
        description: "Configuración completa de tu agente de IA en WhatsApp Business. Listo para atender leads desde el día 1.",
        features: ["Flujos de conversación a medida", "Integración con tu CRM", "Capacitación de la IA con tu negocio", "Soporte 30 días post-entrega"],
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-500/20",
    },
    {
        Icon: Workflow,
        name: "Automatización de Pipeline",
        price: "$6,500",
        description: "Setup de CRM + automatizaciones de seguimiento + integraciones entre tus herramientas actuales.",
        features: ["CRM configurado a tu proceso", "Automatizaciones de seguimiento", "Notificaciones y alertas", "Integraciones llave en mano"],
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-500/20",
    },
    {
        Icon: FileSearch,
        name: "Auditoría de Ventas Digital",
        price: "$2,500",
        description: "Análisis profundo de dónde se pierden tus leads hoy y plan de acción concreto para cerrar más.",
        features: ["Diagnóstico de pipeline completo", "Análisis de competencia", "Plan de acción priorizado", "Sesión de presentación incluida"],
        color: "text-northpeak-green",
        bg: "bg-northpeak-green/10",
        border: "border-northpeak-green/20",
    },
];

// ── Super Offer ──────────────────────────────────────────────────────────────

export const superOffer = {
    badge: "OFERTA DE LANZAMIENTO",
    name: "Kit Lanzamiento IA",
    tagline: "Todo lo que necesitas para empezar a vender con IA. Un solo pago. Sin mensualidades.",
    price: "$24,900",
    originalPrice: "$39,400",
    savings: "Ahorras $14,500",
    deadline: "Solo 5 lugares disponibles este mes",
    includes: [
        { Icon: Globe, label: "Sitio web con IA integrada" },
        { Icon: Bot, label: "Agente IA en WhatsApp configurado" },
        { Icon: Workflow, label: "Pipeline automatizado + CRM" },
        { Icon: Target, label: "Campaña de publicidad lanzada" },
        { Icon: FileSearch, label: "Auditoría inicial + estrategia" },
        { Icon: Timer, label: "30 días de soporte post-entrega" },
    ],
};

// ── Footer nav links ─────────────────────────────────────────────────────────

export const footerNavLinks = [
    { label: "Soluciones", href: "#servicios" },
    { label: "Pago único", href: "#pago-unico" },
    { label: "Resultados", href: "#casos" },
    { label: "Preguntas frecuentes", href: "#preguntas" },
    { label: "Diagnóstico gratuito", href: "/analizar" },
    { label: "Portal de clientes", href: "/portal/dashboard" },
    { label: "Aviso de privacidad", href: "/privacidad" },
];

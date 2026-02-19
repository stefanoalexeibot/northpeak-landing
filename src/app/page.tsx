import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight, Star, Check, MapPin, Zap, MessageSquare,
  Share2, Target, Layers, Search, Lightbulb, Rocket,
  TrendingUp, BarChart2, Users, LayoutDashboard, Shield,
  ChevronRight, Phone, Mail,
} from "lucide-react";
import FaqAccordion from "@/components/landing/faq-accordion";
import RoiCalculator from "@/components/landing/roi-calculator";
import CursorGlow from "@/components/portal/cursor-glow";
import AnimatedBackground from "@/components/portal/animated-background";
import DotGrid from "@/components/portal/dot-grid";
import TiltCard from "@/components/portal/tilt-card";

export const metadata: Metadata = {
  title: "NorthPeak Digital — Marketing Digital para Negocios en Monterrey",
  description:
    "Agencia de marketing digital para restaurantes, clínicas y negocios locales en Monterrey. Redes sociales, publicidad digital y posicionamiento local con resultados medibles.",
};

// ── Static data ──────────────────────────────────────────────────────────────

const caseStudies = [
  {
    industry: "Restaurante · San Pedro GG",
    bigStat: "+1,920",
    bigLabel: "seguidores nuevos",
    timeframe: "en 5 meses",
    description: "Sin estrategia en Instagram. Con Reels y contenido local logramos crecimiento orgánico sostenido y reservaciones récord.",
    tags: ["Instagram", "Reels", "Contenido local"],
    metrics: [
      { label: "Reservaciones", value: "+34%" },
      { label: "Alcance Reels", value: "4.8M" },
      { label: "Engagement", value: "8.2%" },
    ],
    accent: "text-purple-400",
    borderFrom: "rgba(168,85,247,0.3)",
    glow: "rgba(168,85,247,0.06)",
  },
  {
    industry: "Clínica Dental · MTY Centro",
    bigStat: "#2",
    bigLabel: "en Google Maps",
    timeframe: "en 3 meses",
    description: "Solo 8 reseñas y sin presencia local. En 90 días llegamos al top 3 en búsquedas y duplicamos citas semanales.",
    tags: ["Google Maps", "SEO Local", "Reseñas"],
    metrics: [
      { label: "Reseñas Google", value: "8→142" },
      { label: "Citas nuevas/sem", value: "+58%" },
      { label: "Posición local", value: "Top 3" },
    ],
    accent: "text-blue-400",
    borderFrom: "rgba(59,130,246,0.3)",
    glow: "rgba(59,130,246,0.06)",
  },
  {
    industry: "Constructora · Cumbres, NL",
    bigStat: "22",
    bigLabel: "leads calificados",
    timeframe: "en el primer mes",
    description: "Necesitaban prospectos con poder adquisitivo real. Con Meta Ads + WhatsApp logramos un CPL por debajo del promedio de la industria.",
    tags: ["Meta Ads", "WhatsApp Biz", "Retargeting"],
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

const services = [
  {
    num: "01",
    Icon: Share2,
    name: "Gestión de Redes",
    price: "desde $4,500",
    period: "/mes",
    description: "Contenido que conecta con tu cliente local en Instagram y Facebook.",
    features: ["12–16 posts al mes", "Diseño + copywriting", "Reels y stories", "Reporte mensual"],
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-500/20",
  },
  {
    num: "02",
    Icon: MapPin,
    name: "Posicionamiento Local",
    price: "desde $3,500",
    period: "/mes",
    description: "Domina Google Maps y aparece primero cuando te buscan.",
    features: ["Google Business Profile", "Estrategia de reseñas", "SEO local", "Fotos y actualización"],
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-500/20",
  },
  {
    num: "03",
    Icon: Target,
    name: "Publicidad Digital",
    price: "desde $6,000",
    period: "/mes",
    description: "Anuncios en Meta y Google que traen clientes, no solo clics.",
    features: ["Meta Ads (FB + IG)", "Google Ads", "Retargeting por zona", "Reportes semanales"],
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-500/20",
    featured: true,
  },
  {
    num: "04",
    Icon: Layers,
    name: "Estrategia Completa",
    price: "desde $12,000",
    period: "/mes",
    description: "Todo integrado: redes, publicidad, posicionamiento y portal exclusivo.",
    features: ["Todo lo anterior", "Estrategia mensual", "Sesión de resultados", "Portal de cliente"],
    color: "text-northpeak-green",
    bg: "bg-northpeak-green/10",
    border: "border-northpeak-green/20",
  },
];

const steps = [
  {
    num: "01",
    Icon: Search,
    title: "Analizamos tu presencia",
    description: "Diagnóstico gratuito y honesto de tu situación digital actual. Sin venta, solo datos.",
  },
  {
    num: "02",
    Icon: Lightbulb,
    title: "Diseñamos tu estrategia",
    description: "Un plan específico para tu negocio, tu zona y tu competencia en Monterrey.",
  },
  {
    num: "03",
    Icon: Rocket,
    title: "Ejecutamos y medimos",
    description: "Publicamos, medimos resultados y te reportamos todo desde tu portal en tiempo real.",
  },
];

const differentiators = [
  {
    Icon: MapPin,
    title: "Conocemos Monterrey",
    description: "Sabemos cómo habla tu cliente local, qué zonas son relevantes y qué funciona en este mercado. No somos una agencia genérica.",
    color: "text-northpeak-green",
    bg: "bg-northpeak-green/10",
  },
  {
    Icon: BarChart2,
    title: "Resultados medibles",
    description: "No te vendemos impresiones ni vanity metrics. Te reportamos ventas, leads y reservaciones. Números de negocio reales.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    Icon: LayoutDashboard,
    title: "Portal de cliente",
    description: "Ves todo en tiempo real: avance de tu proyecto, entregables, mensajes con tu equipo y resultados del mes.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    Icon: Shield,
    title: "Sin contratos trampa",
    description: "Contratos mínimos de 3 meses, no de 12. La mayoría renueva porque ve resultados, no por obligación.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const supabase = createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id, rating, title, content, clients(name, company)")
    .eq("is_published", true)
    .order("submitted_at", { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen bg-northpeak-bg text-northpeak-text">

      {/* ── Global visual effects (desktop only, pointer-events-none) ── */}
      <DotGrid />
      <AnimatedBackground />
      <CursorGlow />

      {/* ── All page content above effects ── */}
      <div className="relative z-10">

        {/* ── Nav ──────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-northpeak-bg/75 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="NorthPeak Digital" className="h-7" />
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm text-northpeak-text-muted">
              <a href="#servicios" className="hover:text-northpeak-text transition-colors">Servicios</a>
              <a href="#casos" className="hover:text-northpeak-text transition-colors">Casos de éxito</a>
              <a href="#preguntas" className="hover:text-northpeak-text transition-colors">FAQ</a>
              <Link href="/portal/dashboard" className="hover:text-northpeak-text transition-colors">Portal</Link>
            </nav>

            <Link
              href="/analizar"
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-bold hover:bg-northpeak-green/90 transition-all"
            >
              Analizar mi negocio
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </header>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative min-h-[92vh] flex items-center px-5 sm:px-8 pt-16 pb-24 overflow-hidden">
          {/* Extra hero glow (on top of AnimatedBackground) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-northpeak-green/8 blur-[100px]" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-northpeak-green/25 to-transparent" />
          </div>

          <div className="relative max-w-6xl mx-auto w-full">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 mb-8 px-4 py-1.5 rounded-full border border-northpeak-green/25 bg-northpeak-green/8">
              <span className="h-1.5 w-1.5 rounded-full bg-northpeak-green animate-pulse shrink-0" />
              <span className="font-mono text-[11px] tracking-[0.15em] text-northpeak-green uppercase">
                Marketing Digital · Monterrey, N.L.
              </span>
            </div>

            {/* Main headline — "aplastada" single-block style */}
            <h1 className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-tight tracking-tight text-northpeak-text mb-6 max-w-4xl">
              Tu negocio en internet.{" "}
              <span className="text-northpeak-green">En serio.</span>
            </h1>

            <p className="text-lg sm:text-xl text-northpeak-text-muted max-w-2xl leading-relaxed mb-10">
              Ayudamos a restaurantes, clínicas y negocios locales en Monterrey a ganar clientes
              por internet — con estrategia real, no con promesas vacías.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-14">
              <Link
                href="/analizar"
                className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-base hover:bg-northpeak-green/90 transition-all hover:scale-[1.02] shadow-[0_8px_30px_rgba(0,229,160,0.3)]"
              >
                <Zap className="h-4 w-4" />
                Analiza tu presencia gratis
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#casos"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-northpeak-surface text-northpeak-text-muted font-medium text-base hover:border-northpeak-green/30 hover:text-northpeak-text transition-all"
              >
                Ver resultados reales
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            {/* Floating proof chips */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Users, val: "+50 negocios", sub: "en Monterrey", color: "text-northpeak-green" },
                { icon: TrendingUp, val: "3.2× crecimiento", sub: "promedio", color: "text-blue-400" },
                { icon: Star, val: "4.9★ satisfacción", sub: "clientes activos", color: "text-yellow-400" },
              ].map((chip) => (
                <div
                  key={chip.val}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-northpeak-surface bg-northpeak-card/80 backdrop-blur-sm"
                >
                  <chip.icon className={`h-4 w-4 shrink-0 ${chip.color}`} />
                  <div>
                    <p className={`font-mono font-bold text-sm ${chip.color}`}>{chip.val}</p>
                    <p className="text-[10px] text-northpeak-text-dim">{chip.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ─────────────────────────────────────────── */}
        <section id="servicios" className="py-24 px-5 sm:px-8 border-t border-northpeak-surface">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14">
              <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Servicios y precios</p>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text mb-3 tracking-tight">
                Sin letras chiquitas.
              </h2>
              <p className="text-northpeak-text-muted max-w-lg">
                Mostramos rangos de inversión para que sepas qué esperar antes de hablar con nosotros.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((svc) => (
                <TiltCard key={svc.num} intensity={8} className={`rounded-2xl border ${svc.border} bg-northpeak-card flex flex-col gap-5 p-5 ${svc.featured ? "ring-1 ring-northpeak-green/30 bg-northpeak-green/5" : ""}`}>
                  {svc.featured && (
                    <div className="absolute -top-3 left-4">
                      <span className="font-mono text-[10px] font-bold tracking-wider px-3 py-1 rounded-full bg-northpeak-green text-northpeak-bg">
                        MÁS POPULAR
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${svc.bg}`}>
                      <svc.Icon className={`h-5 w-5 ${svc.color}`} />
                    </div>
                    <span className={`font-mono text-xs font-bold tracking-widest ${svc.color} opacity-60`}>{svc.num}</span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-lg text-northpeak-text leading-snug mb-1">{svc.name}</h3>
                    <p className={`font-mono font-bold text-xl ${svc.color}`}>
                      {svc.price}<span className="text-northpeak-text-dim text-sm font-normal">{svc.period}</span>
                    </p>
                  </div>

                  <p className="text-sm text-northpeak-text-muted leading-relaxed">{svc.description}</p>

                  <ul className="space-y-1.5 flex-1">
                    {svc.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-northpeak-text-muted">
                        <Check className={`h-3.5 w-3.5 shrink-0 ${svc.color}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/analizar"
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      svc.featured
                        ? "bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
                        : "border border-northpeak-surface text-northpeak-text-muted hover:border-northpeak-green/30 hover:text-northpeak-text"
                    }`}
                  >
                    Empezar
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── Case Studies ─────────────────────────────────────── */}
        <section id="casos" className="py-24 px-5 sm:px-8 border-t border-northpeak-surface bg-northpeak-card/40">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14">
              <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Resultados reales</p>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight mb-3">
                No prometemos, demostramos.
              </h2>
              <p className="text-northpeak-text-muted max-w-lg">
                Negocios en Monterrey que transformaron su presencia digital con NorthPeak.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {caseStudies.map((cs) => (
                <div
                  key={cs.industry}
                  className="rounded-2xl h-full"
                  style={{
                    background: `linear-gradient(135deg, ${cs.borderFrom}, transparent 40%)`,
                    padding: "1px",
                  }}
                >
                  <TiltCard
                    intensity={6}
                    className="rounded-2xl h-full"
                  >
                  <div
                    className="rounded-2xl h-full flex flex-col gap-5 p-6"
                    style={{ background: `linear-gradient(145deg, ${cs.glow}, #0C0D12 60%)` }}
                  >
                    <p className={`font-mono text-[10px] tracking-[0.15em] uppercase ${cs.accent}`}>{cs.industry}</p>

                    <div>
                      <p className={`font-heading font-extrabold text-5xl leading-none ${cs.accent} mb-1`}>{cs.bigStat}</p>
                      <p className="text-northpeak-text font-semibold text-lg leading-tight">{cs.bigLabel}</p>
                      <p className="text-northpeak-text-muted text-sm">{cs.timeframe}</p>
                    </div>

                    <p className="text-sm text-northpeak-text-muted leading-relaxed flex-1">{cs.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {cs.tags.map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-full bg-northpeak-surface text-northpeak-text-dim text-[10px] font-medium tracking-wide">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                      {cs.metrics.map((m) => (
                        <div key={m.label}>
                          <p className={`font-mono font-bold text-lg ${cs.accent} leading-none mb-0.5`}>{m.value}</p>
                          <p className="text-[10px] text-northpeak-text-dim leading-snug">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  </TiltCard>
                </div>
              ))}
            </div>

            <p className="text-center mt-10">
              <Link href="/analizar" className="group inline-flex items-center gap-2 text-northpeak-green text-sm font-medium hover:gap-3 transition-all">
                ¿Puede funcionar para tu negocio? Averígualo gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </div>
        </section>

        {/* ── Process ──────────────────────────────────────────── */}
        <section className="py-24 px-5 sm:px-8 border-t border-northpeak-surface">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Proceso</p>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight">
                Cómo trabajamos
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <div className="hidden md:block absolute top-12 left-[calc(16.5%+2rem)] right-[calc(16.5%+2rem)] h-px bg-gradient-to-r from-northpeak-green/40 via-northpeak-green/15 to-northpeak-green/40" />

              {steps.map((step) => (
                <TiltCard key={step.num} intensity={6} className="rounded-2xl border border-northpeak-surface bg-northpeak-card p-6 flex flex-col gap-4">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-northpeak-green/10 border border-northpeak-green/20">
                    <step.Icon className="h-6 w-6 text-northpeak-green" />
                    <span className="absolute -top-2 -right-2 font-mono text-[10px] font-bold text-northpeak-green bg-northpeak-bg border border-northpeak-green/30 rounded-full px-1.5 py-0.5">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-northpeak-text">{step.title}</h3>
                  <p className="text-sm text-northpeak-text-muted leading-relaxed">{step.description}</p>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why NorthPeak ─────────────────────────────────────── */}
        <section className="py-24 px-5 sm:px-8 border-t border-northpeak-surface bg-northpeak-card/40">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14">
              <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Por qué nosotros</p>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight mb-3">
                Lo que nos diferencia.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {differentiators.map((d) => (
                <TiltCard key={d.title} intensity={8} className="rounded-2xl border border-northpeak-surface bg-northpeak-card p-5 flex flex-col gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${d.bg}`}>
                    <d.Icon className={`h-5 w-5 ${d.color}`} />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-northpeak-text leading-snug">{d.title}</h3>
                  <p className="text-sm text-northpeak-text-muted leading-relaxed">{d.description}</p>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────── */}
        {testimonials && testimonials.length > 0 && (
          <section className="py-24 px-5 sm:px-8 border-t border-northpeak-surface">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Clientes</p>
                <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight">
                  Lo que dicen.
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {testimonials.map((t) => {
                  const client = t.clients as unknown as { name: string; company: string } | null;
                  return (
                    <TiltCard key={t.id} intensity={5} className="rounded-2xl border border-northpeak-surface bg-northpeak-card p-6 flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-northpeak-surface fill-northpeak-surface"}`} />
                          ))}
                        </div>
                        <span className="font-heading text-5xl text-northpeak-surface leading-none select-none">&ldquo;</span>
                      </div>

                      {t.title && (
                        <p className="font-heading font-bold text-northpeak-text">&ldquo;{t.title}&rdquo;</p>
                      )}
                      <p className="text-sm text-northpeak-text-muted leading-relaxed flex-1">{t.content}</p>

                      {client && (
                        <div className="pt-3 border-t border-northpeak-surface">
                          <p className="text-sm font-semibold text-northpeak-text">{client.name}</p>
                          {client.company && <p className="text-xs text-northpeak-text-dim mt-0.5">{client.company}</p>}
                        </div>
                      )}
                    </TiltCard>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── ROI Calculator ───────────────────────────────────── */}
        <section className="py-24 px-5 sm:px-8 border-t border-northpeak-surface bg-northpeak-card/40">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Calculadora de ROI</p>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight mb-3">
                ¿Cuánto podrías ganar?
              </h2>
              <p className="text-northpeak-text-muted max-w-lg mx-auto">
                Ajusta los números de tu negocio y ve el retorno proyectado con una inversión en marketing digital.
              </p>
            </div>
            <div className="rounded-2xl border border-northpeak-surface bg-northpeak-card p-6 sm:p-10">
              <RoiCalculator />
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="preguntas" className="py-24 px-5 sm:px-8 border-t border-northpeak-surface">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— FAQ</p>
              <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight mb-3">
                Lo que todos preguntan.
              </h2>
            </div>
            <FaqAccordion />
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="relative py-32 px-5 sm:px-8 border-t border-northpeak-surface overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-[700px] rounded-full bg-northpeak-green/10 blur-[80px]" />
            <div className="absolute inset-0 border-t border-northpeak-green/5" />
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-6">— Empieza hoy</p>
            <h2 className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl text-northpeak-text tracking-tight leading-tight mb-6">
              ¿Listo para <span className="text-northpeak-green">crecer?</span>
            </h2>
            <p className="text-xl text-northpeak-text-muted mb-10 max-w-xl mx-auto leading-relaxed">
              Diagnóstico gratuito en 5 minutos. Sin registro, sin compromiso. Te decimos exactamente en qué mejorar.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/analizar"
                className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl bg-northpeak-green text-northpeak-bg text-lg font-bold hover:bg-northpeak-green/90 transition-all hover:scale-[1.02] shadow-[0_12px_40px_rgba(0,229,160,0.3)]"
              >
                <Zap className="h-5 w-5" />
                Analizar mi negocio gratis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="https://wa.me/528110000000"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-northpeak-surface text-northpeak-text-muted font-medium text-base hover:border-northpeak-green/30 hover:text-northpeak-text transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                Hablar por WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="border-t border-northpeak-surface bg-northpeak-card py-14 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
              {/* Brand */}
              <div className="space-y-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="NorthPeak Digital" className="h-7" />
                <p className="text-sm text-northpeak-text-muted leading-relaxed max-w-xs">
                  Agencia de marketing digital para negocios locales en Monterrey, N.L.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-northpeak-text-dim font-mono">
                  <MapPin className="h-3 w-3" />
                  Monterrey, Nuevo León — México
                </div>
              </div>

              {/* Links */}
              <div>
                <p className="font-mono text-[10px] tracking-[0.15em] text-northpeak-text-dim uppercase mb-4">Navegación</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Servicios", href: "#servicios" },
                    { label: "Casos de éxito", href: "#casos" },
                    { label: "Preguntas", href: "#preguntas" },
                    { label: "Diagnóstico gratuito", href: "/analizar" },
                    { label: "Portal de clientes", href: "/portal/dashboard" },
                    { label: "Aviso de privacidad", href: "/privacidad" },
                  ].map((l) => (
                    <a key={l.label} href={l.href} className="block text-sm text-northpeak-text-muted hover:text-northpeak-text transition-colors">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="font-mono text-[10px] tracking-[0.15em] text-northpeak-text-dim uppercase mb-4">Contacto</p>
                <div className="space-y-3">
                  <a href="https://wa.me/528110000000" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-sm text-northpeak-text-muted hover:text-northpeak-green transition-colors">
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a href="mailto:hola@northpeak.mx" className="flex items-center gap-2.5 text-sm text-northpeak-text-muted hover:text-northpeak-green transition-colors">
                    <Mail className="h-4 w-4" />
                    hola@northpeak.mx
                  </a>
                  <div className="pt-2">
                    <Link
                      href="/analizar"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-bold hover:bg-northpeak-green/90 transition-colors"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Diagnóstico gratis
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-northpeak-surface flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-northpeak-text-dim">
                © {new Date().getFullYear()} NorthPeak Digital. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-4 text-xs text-northpeak-text-dim">
                <Link href="/privacidad" className="hover:text-northpeak-text-muted transition-colors">
                  Aviso de Privacidad
                </Link>
                <span className="font-mono">MTY · NL · MX</span>
              </div>
            </div>
          </div>
        </footer>

      </div>{/* /z-10 wrapper */}
    </div>
  );
}

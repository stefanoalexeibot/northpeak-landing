import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Star, Check, MapPin, Zap, MessageSquare, BarChart2 } from "lucide-react";
import FaqAccordion from "@/components/landing/faq-accordion";
import RoiCalculator from "@/components/landing/roi-calculator";

export const metadata: Metadata = {
  title: "NorthPeak Digital — Marketing Digital para Negocios en Monterrey",
  description:
    "Agencia de marketing digital para restaurantes, clínicas y negocios locales en Monterrey. Redes sociales, publicidad y posicionamiento local con resultados medibles.",
};

// ── Data ────────────────────────────────────────────────────────────────────

const caseStudies = [
  {
    industry: "Restaurante · San Pedro GG",
    headline: "De 180 a 2,100\nseguidores",
    sub: "en 5 meses",
    description: "Sin presencia en Instagram. Con Reels y contenido local logramos crecimiento orgánico sostenido y reservaciones récord.",
    tags: ["Instagram", "Reels", "Contenido"],
    metrics: [{ label: "Nuevos seguidores", value: "+1,920" }, { label: "Reservaciones", value: "+34%" }, { label: "Alcance Reels", value: "4.8M" }],
    accent: "text-purple-400",
    glow: "bg-purple-500/8",
    border: "from-purple-500/30 via-transparent to-transparent",
  },
  {
    industry: "Clínica Dental · MTY Centro",
    headline: "De invisible\na #2 en Google",
    sub: "en 3 meses",
    description: "Solo 8 reseñas y sin optimización. En 90 días llegamos al top 3 en búsquedas locales y duplicamos citas semanales.",
    tags: ["Google Maps", "SEO Local", "Reseñas"],
    metrics: [{ label: "Reseñas", value: "8→142" }, { label: "Posición", value: "#2 MTY" }, { label: "Citas/semana", value: "+58%" }],
    accent: "text-blue-400",
    glow: "bg-blue-500/8",
    border: "from-blue-500/30 via-transparent to-transparent",
  },
  {
    industry: "Constructora · Cumbres, NL",
    headline: "22 leads\ncalificados",
    sub: "en el primer mes",
    description: "Necesitaban prospectos con poder adquisitivo real. Con Meta Ads + WhatsApp logramos un CPL por debajo de la industria.",
    tags: ["Meta Ads", "WhatsApp Biz", "Segmentación"],
    metrics: [{ label: "Leads/mes", value: "22" }, { label: "Costo por lead", value: "$168" }, { label: "Ventas cerradas", value: "3" }],
    accent: "text-northpeak-green",
    glow: "bg-northpeak-green/8",
    border: "from-northpeak-green/30 via-transparent to-transparent",
  },
];

const services = [
  {
    num: "01",
    name: "Gestión de Redes",
    price: "$4,500",
    period: "/mes",
    description: "Contenido que conecta con tu cliente local en Instagram y Facebook.",
    includes: ["12–16 posts mensuales", "Diseño + copywriting", "Reels y stories", "Reporte mensual"],
    color: "text-purple-400",
    ring: "ring-purple-500/20",
  },
  {
    num: "02",
    name: "Posicionamiento Local",
    price: "$3,500",
    period: "/mes",
    description: "Domina Google Maps y aparece primero cuando te buscan.",
    includes: ["Google Business Profile", "Estrategia de reseñas", "SEO local", "Reportes de posición"],
    color: "text-blue-400",
    ring: "ring-blue-500/20",
  },
  {
    num: "03",
    name: "Publicidad Digital",
    price: "$6,000",
    period: "/mes",
    description: "Anuncios en Meta y Google que traen clientes, no solo clics.",
    includes: ["Meta Ads (FB + IG)", "Google Ads", "Retargeting por zona", "Reportes semanales"],
    color: "text-yellow-400",
    ring: "ring-yellow-500/20",
    featured: true,
  },
  {
    num: "04",
    name: "Estrategia Completa",
    price: "$12,000",
    period: "/mes",
    description: "Todo integrado: redes, publicidad, posicionamiento y portal de cliente.",
    includes: ["Todo lo anterior", "Estrategia mensual", "Sesión de resultados", "Portal exclusivo"],
    color: "text-northpeak-green",
    ring: "ring-northpeak-green/20",
  },
];

const steps = [
  { num: "01", title: "Analizamos", description: "Diagnóstico gratuito y honesto de tu presencia digital actual. Sin vender aire." },
  { num: "02", title: "Estrategia", description: "Un plan hecho a la medida de tu negocio, tu zona y tu competencia en Monterrey." },
  { num: "03", title: "Resultados", description: "Publicamos, medimos y te reportamos todo desde tu portal de cliente en tiempo real." },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const supabase = createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id, rating, title, content, clients(name, company)")
    .eq("is_published", true)
    .order("submitted_at", { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen bg-northpeak-bg text-northpeak-text overflow-x-hidden">

      {/* ── Nav ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-northpeak-bg/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="NorthPeak" className="h-7" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {["#casos", "#servicios", "#preguntas"].map((href, i) => (
              <a key={href} href={href} className="text-sm text-northpeak-text-muted hover:text-northpeak-text transition-colors tracking-wide">
                {["Casos", "Servicios", "FAQ"][i]}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/portal/dashboard" className="hidden sm:block text-sm text-northpeak-text-dim hover:text-northpeak-text-muted transition-colors">
              Portal
            </Link>
            <Link
              href="/analizar"
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-bold hover:bg-northpeak-green/90 transition-all"
            >
              Analizar mi negocio
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center px-5 sm:px-8 py-20 overflow-hidden">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-20%] left-[10%] h-[600px] w-[600px] rounded-full bg-northpeak-green/6 blur-[120px] animate-gradient-shift-1" />
          <div className="absolute top-[30%] right-[5%] h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px] animate-gradient-shift-2" />
          <div className="absolute bottom-0 left-1/2 h-px w-full bg-gradient-to-r from-transparent via-northpeak-green/20 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_auto] gap-12 items-center">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-northpeak-green/25 bg-northpeak-green/8 px-4 py-1.5 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-northpeak-green animate-pulse" />
              <span className="font-mono text-[11px] tracking-[0.15em] text-northpeak-green uppercase">
                Agencia Digital · Monterrey, N.L.
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-heading font-extrabold leading-[0.92] tracking-tight mb-6">
              <span className="block text-[clamp(3.5rem,10vw,7rem)] text-northpeak-text">
                Tu negocio
              </span>
              <span className="block text-[clamp(3.5rem,10vw,7rem)] text-northpeak-text">
                en internet.
              </span>
              <span className="block text-[clamp(3.5rem,10vw,7rem)] text-northpeak-green">
                En serio.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-northpeak-text-muted max-w-xl leading-relaxed mb-10">
              Ayudamos a restaurantes, clínicas y negocios locales en Monterrey a ganar clientes
              por internet — con estrategia real y resultados medibles.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/analizar"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-base hover:bg-northpeak-green/90 transition-all hover:scale-[1.02] shadow-[0_8px_32px_rgba(0,229,160,0.25)]"
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
              </a>
            </div>

            <p className="mt-5 text-xs text-northpeak-text-dim font-mono tracking-wide">
              Gratis · Sin registro · Resultados en 5 min
            </p>
          </div>

          {/* Floating proof cards */}
          <div className="hidden lg:flex flex-col gap-3 w-56">
            {[
              { val: "+1,920", label: "seguidores nuevos", sub: "Restaurante · 5 meses", color: "text-purple-400" },
              { val: "#2", label: "Google Maps", sub: "Clínica dental · 3 meses", color: "text-blue-400" },
              { val: "22", label: "leads calificados", sub: "Constructora · 1 mes", color: "text-northpeak-green" },
            ].map((card) => (
              <div key={card.val} className="rounded-xl border border-northpeak-surface bg-northpeak-card/80 backdrop-blur p-4">
                <p className={`font-mono font-bold text-2xl ${card.color} leading-none mb-0.5`}>{card.val}</p>
                <p className="text-xs font-medium text-northpeak-text">{card.label}</p>
                <p className="text-[10px] text-northpeak-text-dim mt-1">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="border-y border-northpeak-surface">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-northpeak-surface">
            {[
              { val: "+50", label: "negocios activos" },
              { val: "3.2×", label: "crecimiento promedio" },
              { val: "$2.4M", label: "en ventas generadas" },
              { val: "4.9★", label: "satisfacción" },
            ].map((s) => (
              <div key={s.label} className="py-8 px-6 text-center">
                <p className="font-mono font-bold text-3xl sm:text-4xl text-northpeak-green leading-none mb-1.5">{s.val}</p>
                <p className="text-xs text-northpeak-text-muted uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Case Studies ───────────────────────────────────────── */}
      <section id="casos" className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">
              — Resultados reales
            </p>
            <h2 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-northpeak-text leading-tight">
              No prometemos.
              <br />
              <span className="text-northpeak-text-muted">Demostramos.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {caseStudies.map((cs) => (
              <div
                key={cs.industry}
                className="group relative rounded-2xl p-[1px] overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${cs.border.includes("purple") ? "rgba(168,85,247,0.25)" : cs.border.includes("blue") ? "rgba(59,130,246,0.25)" : "rgba(0,229,160,0.25)"}, transparent, transparent)` }}
              >
                <div className={`relative rounded-2xl ${cs.glow} bg-northpeak-card p-6 flex flex-col gap-5 h-full`}>
                  {/* Industry */}
                  <p className={`font-mono text-[10px] tracking-[0.15em] uppercase ${cs.accent}`}>{cs.industry}</p>

                  {/* Big headline */}
                  <div>
                    <h3 className={`font-heading font-extrabold text-3xl sm:text-4xl ${cs.accent} leading-tight whitespace-pre-line`}>
                      {cs.headline}
                    </h3>
                    <p className="text-northpeak-text-muted text-sm mt-1">{cs.sub}</p>
                  </div>

                  <p className="text-sm text-northpeak-text-muted leading-relaxed flex-1">{cs.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {cs.tags.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-full bg-northpeak-surface text-northpeak-text-dim text-[10px] font-medium tracking-wide">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-northpeak-surface">
                    {cs.metrics.map((m) => (
                      <div key={m.label}>
                        <p className={`font-mono font-bold text-xl ${cs.accent}`}>{m.value}</p>
                        <p className="text-[10px] text-northpeak-text-dim mt-0.5 leading-snug">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/analizar" className="group inline-flex items-center gap-2 text-northpeak-green text-sm font-medium hover:gap-3 transition-all">
              ¿Puede funcionar para tu negocio? Averígualo gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Process ────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8 border-y border-northpeak-surface bg-northpeak-card">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— El proceso</p>
            <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-northpeak-text">Así funciona</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.666%+1rem)] right-[calc(16.666%+1rem)] h-px bg-gradient-to-r from-northpeak-green/40 via-northpeak-green/20 to-northpeak-green/40" />

            {steps.map((step) => (
              <div key={step.num} className="relative flex flex-col items-center md:items-start text-center md:text-left px-6 py-8">
                {/* Step number */}
                <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-northpeak-bg border border-northpeak-surface mb-6 relative z-10">
                  <span className="font-mono font-bold text-2xl text-northpeak-green">{step.num}</span>
                </div>
                <h3 className="font-heading font-bold text-2xl text-northpeak-text mb-3">{step.title}</h3>
                <p className="text-northpeak-text-muted text-sm leading-relaxed max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ───────────────────────────────────────────── */}
      <section id="servicios" className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Servicios y precios</p>
            <h2 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-northpeak-text leading-tight">
              Sin letras
              <br />
              <span className="text-northpeak-text-muted">chiquitas.</span>
            </h2>
            <p className="text-northpeak-text-muted mt-4 max-w-lg text-base leading-relaxed">
              Rangos de inversión reales para que sepas con qué esperar antes de hablar con nosotros.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((svc) => (
              <div
                key={svc.num}
                className={`relative rounded-2xl border ${svc.featured ? "border-northpeak-green/30 bg-northpeak-green/5" : "border-northpeak-surface bg-northpeak-card"} p-5 flex flex-col gap-5 hover:border-opacity-60 transition-all`}
              >
                {svc.featured && (
                  <div className="absolute -top-3 left-4">
                    <span className="font-mono text-[10px] font-bold tracking-wider px-3 py-1 rounded-full bg-northpeak-green text-northpeak-bg">
                      + POPULAR
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <span className={`font-mono text-xs font-bold ${svc.color} tracking-widest`}>{svc.num}</span>
                  <BarChart2 className={`h-4 w-4 ${svc.color} opacity-50`} />
                </div>

                <div>
                  <h3 className="font-heading font-bold text-lg text-northpeak-text leading-snug mb-1">{svc.name}</h3>
                  <div className="flex items-baseline gap-0.5">
                    <span className={`font-mono font-bold text-2xl ${svc.color}`}>{svc.price}</span>
                    <span className="text-northpeak-text-dim text-sm">{svc.period}</span>
                  </div>
                </div>

                <p className="text-sm text-northpeak-text-muted leading-relaxed">{svc.description}</p>

                <ul className="space-y-2 flex-1">
                  {svc.includes.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-northpeak-text-muted">
                      <Check className={`h-3.5 w-3.5 shrink-0 ${svc.color}`} />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/analizar"
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    svc.featured
                      ? "bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
                      : "border border-northpeak-surface text-northpeak-text-muted hover:text-northpeak-text hover:border-northpeak-green/30"
                  }`}
                >
                  Empezar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-northpeak-text-dim mt-8">
            ¿No sabes cuál te conviene?{" "}
            <Link href="/analizar" className="text-northpeak-green hover:underline">
              Haz el diagnóstico gratis
            </Link>{" "}
            y te orientamos.
          </p>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-24 px-5 sm:px-8 border-y border-northpeak-surface bg-northpeak-card">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Clientes</p>
              <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-northpeak-text">Lo que dicen</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((t) => {
                const client = t.clients as unknown as { name: string; company: string } | null;
                return (
                  <div key={t.id} className="relative rounded-2xl border border-northpeak-surface bg-northpeak-bg p-6 flex flex-col gap-4">
                    {/* Quote mark */}
                    <span className="absolute top-4 right-5 font-heading text-6xl text-northpeak-surface leading-none select-none">&ldquo;</span>

                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-northpeak-surface fill-northpeak-surface"}`} />
                      ))}
                    </div>

                    {t.title && (
                      <p className="font-heading font-bold text-northpeak-text text-base leading-snug">&ldquo;{t.title}&rdquo;</p>
                    )}
                    <p className="text-sm text-northpeak-text-muted leading-relaxed flex-1">{t.content}</p>

                    {client && (
                      <div className="pt-3 border-t border-northpeak-surface">
                        <p className="text-sm font-semibold text-northpeak-text">{client.name}</p>
                        {client.company && <p className="text-xs text-northpeak-text-dim mt-0.5">{client.company}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── ROI Calculator ─────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Calculadora</p>
            <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-northpeak-text mb-4">
              ¿Cuánto podrías ganar?
            </h2>
            <p className="text-northpeak-text-muted max-w-lg mx-auto leading-relaxed">
              Ajusta los números de tu negocio y ve el retorno proyectado con una inversión en marketing.
            </p>
          </div>

          <div className="rounded-2xl border border-northpeak-surface bg-northpeak-card p-6 sm:p-10">
            <RoiCalculator />
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section id="preguntas" className="py-24 px-5 sm:px-8 border-y border-northpeak-surface bg-northpeak-card">
        <div className="max-w-3xl mx-auto">
          <div className="mb-16 text-center">
            <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— FAQ</p>
            <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-northpeak-text mb-4">
              Lo que todos preguntan
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <section className="relative py-32 px-5 sm:px-8 overflow-hidden">
        {/* Green ambient glow */}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-0">
          <div className="h-64 w-[600px] rounded-full bg-northpeak-green/10 blur-[80px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 border-y border-northpeak-green/5" />

        <div className="relative max-w-4xl mx-auto text-center">
          <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-6">— Empieza ahora</p>
          <h2 className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl text-northpeak-text leading-tight mb-6">
            ¿Listo para
            <br />
            <span className="text-northpeak-green">crecer?</span>
          </h2>
          <p className="text-northpeak-text-muted text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            Diagnóstico gratuito en 5 minutos. Sin registro, sin compromiso. Te decimos exactamente en qué mejorar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/analizar"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-xl bg-northpeak-green text-northpeak-bg text-lg font-bold hover:bg-northpeak-green/90 transition-all hover:scale-[1.02] shadow-[0_12px_40px_rgba(0,229,160,0.3)]"
            >
              <Zap className="h-5 w-5" />
              Analizar mi negocio gratis
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://wa.me/528110000000"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-northpeak-surface text-northpeak-text-muted text-base font-medium hover:border-northpeak-green/30 hover:text-northpeak-text transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-northpeak-surface bg-northpeak-card py-12 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="NorthPeak" className="h-7" />
              <p className="text-sm text-northpeak-text-muted max-w-xs leading-relaxed">
                Agencia de marketing digital para negocios locales en Monterrey, N.L.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-northpeak-text-dim font-mono">
                <MapPin className="h-3 w-3" />
                Monterrey, Nuevo León — México
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-16 gap-y-3">
              {[
                { label: "Casos de éxito", href: "#casos" },
                { label: "Portal de clientes", href: "/portal/dashboard" },
                { label: "Servicios", href: "#servicios" },
                { label: "Analizador gratuito", href: "/analizar" },
                { label: "Preguntas", href: "#preguntas" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-northpeak-text-muted hover:text-northpeak-text transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div>
              <Link
                href="/analizar"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-bold hover:bg-northpeak-green/90 transition-colors"
              >
                <Zap className="h-4 w-4" />
                Diagnóstico gratis
              </Link>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-northpeak-surface flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-northpeak-text-dim">
              © {new Date().getFullYear()} NorthPeak Digital. Todos los derechos reservados.
            </p>
            <p className="text-xs text-northpeak-text-dim font-mono">MTY · NL · MX</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

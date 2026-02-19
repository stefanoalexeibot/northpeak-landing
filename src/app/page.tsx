import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  Star,
  Check,
  TrendingUp,
  MapPin,
  Zap,
  BarChart2,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import FaqAccordion from "@/components/landing/faq-accordion";
import RoiCalculator from "@/components/landing/roi-calculator";

export const metadata: Metadata = {
  title: "NorthPeak Digital — Marketing Digital para Negocios en Monterrey",
  description:
    "Agencia de marketing digital para restaurantes, clínicas y negocios locales en Monterrey. Redes sociales, publicidad y posicionamiento local con resultados medibles.",
};

// ── Static data ─────────────────────────────────────────────────────────────

const stats = [
  { value: "+50", label: "negocios impactados" },
  { value: "3.2x", label: "crecimiento promedio" },
  { value: "$2.4M", label: "en ventas generadas" },
  { value: "4.9★", label: "satisfacción promedio" },
];

const caseStudies = [
  {
    client: "El Mezquite",
    industry: "Restaurante — San Pedro Garza García",
    headline: "De 180 a 2,100 seguidores en 5 meses",
    description:
      "Sin presencia real en Instagram. Con estrategia de Reels y contenido local logramos un crecimiento orgánico sostenido y reservaciones récord.",
    tags: ["Instagram", "Reels", "Contenido local"],
    metrics: [
      { label: "Nuevos seguidores", value: "+1,920" },
      { label: "Aumento en reservaciones", value: "+34%" },
      { label: "Alcance en Reels", value: "4.8M" },
    ],
    color: "from-purple-500/10 to-pink-500/5",
    accent: "text-purple-400",
    border: "border-purple-500/20",
  },
  {
    client: "Clínica Dental Sonrisa Plus",
    industry: "Salud — Monterrey Centro",
    headline: "De invisible a #2 en Google Maps",
    description:
      "Solo 8 reseñas y sin optimización en Google. En 3 meses llegamos al top 3 en búsquedas de dentistas en su zona y duplicamos citas semanales.",
    tags: ["Google Maps", "SEO Local", "Reseñas"],
    metrics: [
      { label: "Reseñas", value: "8 → 142" },
      { label: "Posición Google", value: "#2" },
      { label: "Nuevas citas/semana", value: "+58%" },
    ],
    color: "from-blue-500/10 to-cyan-500/5",
    accent: "text-blue-400",
    border: "border-blue-500/20",
  },
  {
    client: "Constructora Novo",
    industry: "Desarrolladora — Nuevo León",
    headline: "22 leads calificados en el primer mes",
    description:
      "Necesitaban prospectos con poder adquisitivo real para proyectos residenciales. Con Meta Ads + WhatsApp Business logramos CPL por debajo de la industria.",
    tags: ["Meta Ads", "WhatsApp Business", "Segmentación"],
    metrics: [
      { label: "Leads/mes", value: "22" },
      { label: "Costo por lead", value: "$168 MXN" },
      { label: "Ventas cerradas", value: "3" },
    ],
    color: "from-green-500/10 to-emerald-500/5",
    accent: "text-northpeak-green",
    border: "border-northpeak-green/20",
  },
];

const services = [
  {
    name: "Gestión de Redes Sociales",
    price: "desde $4,500/mes",
    description: "Creamos y publicamos contenido profesional que conecta con tu cliente local.",
    includes: [
      "Instagram + Facebook",
      "12-16 posts mensuales",
      "Diseño + copywriting",
      "Reels y stories",
      "Reporte mensual",
    ],
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    name: "Posicionamiento Local",
    price: "desde $3,500/mes",
    description: "Domina Google Maps y aparece primero cuando alguien busca tu negocio.",
    includes: [
      "Google Business Profile",
      "Estrategia de reseñas",
      "SEO local",
      "Fotos y actualización",
      "Reportes de posición",
    ],
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    name: "Publicidad Digital",
    price: "desde $6,000/mes",
    description: "Anuncios en Meta y Google que traen clientes reales, no solo clics.",
    includes: [
      "Meta Ads (FB + Instagram)",
      "Google Ads",
      "Retargeting",
      "Segmentación por zona",
      "Reportes semanales",
    ],
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    highlight: true,
  },
  {
    name: "Estrategia Digital Completa",
    price: "desde $12,000/mes",
    description: "Todo integrado: redes, publicidad, posicionamiento y portal exclusivo.",
    includes: [
      "Todo lo anterior incluido",
      "Estrategia mensual",
      "Sesión de resultados",
      "Portal de cliente",
      "WhatsApp directo con tu equipo",
    ],
    color: "text-northpeak-green",
    bg: "bg-northpeak-green/10",
  },
];

const steps = [
  {
    number: "01",
    title: "Analizamos tu presencia",
    description:
      "Hacemos un diagnóstico gratuito y honesto de tu situación actual: redes, Google Maps, sitio web y publicidad. Sin vender aire.",
    icon: BarChart2,
  },
  {
    number: "02",
    title: "Diseñamos tu estrategia",
    description:
      "Creamos un plan específico para tu negocio, tu zona y tu competencia en Monterrey. No plantillas genéricas.",
    icon: MapPin,
  },
  {
    number: "03",
    title: "Ejecutamos y medimos",
    description:
      "Publicamos, lanzamos anuncios y gestionamos tu presencia. Tú ves cada resultado desde tu portal en tiempo real.",
    icon: TrendingUp,
  },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  // Fetch published testimonials (requires RLS policy: anon SELECT WHERE is_published=true)
  const supabase = createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id, rating, title, content, clients(name, company)")
    .eq("is_published", true)
    .order("submitted_at", { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen bg-northpeak-bg text-northpeak-text">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-northpeak-surface bg-northpeak-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="NorthPeak Digital" className="h-7" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-northpeak-text-muted">
            <a href="#casos" className="hover:text-northpeak-text transition-colors">Casos de éxito</a>
            <a href="#servicios" className="hover:text-northpeak-text transition-colors">Servicios</a>
            <a href="#preguntas" className="hover:text-northpeak-text transition-colors">Preguntas</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/portal/dashboard"
              className="hidden sm:block text-sm text-northpeak-text-muted hover:text-northpeak-text transition-colors"
            >
              Portal
            </Link>
            <Link
              href="/analizar"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-semibold hover:bg-northpeak-green/90 transition-colors"
            >
              Analizar mi negocio
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4 sm:px-6">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-northpeak-green/5 blur-3xl animate-gradient-shift-1" />
          <div className="absolute top-20 right-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl animate-gradient-shift-2" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-northpeak-green/20 bg-northpeak-green/5 text-northpeak-green text-xs font-medium mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-northpeak-green animate-pulse" />
            Agencia de marketing digital — Monterrey, N.L.
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-northpeak-text leading-tight mb-6">
            Tu negocio en internet.{" "}
            <span className="text-northpeak-green">En serio.</span>
          </h1>

          <p className="text-lg sm:text-xl text-northpeak-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Ayudamos a restaurantes, clínicas y negocios locales en Monterrey a ganar clientes
            por internet — con estrategia, resultados medibles y sin vender humo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/analizar"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-northpeak-green text-northpeak-bg text-base font-bold hover:bg-northpeak-green/90 transition-all hover:scale-105 shadow-lg shadow-northpeak-green/20"
            >
              <Zap className="h-4 w-4" />
              Analiza tu presencia gratis
            </Link>
            <a
              href="#casos"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-northpeak-surface text-northpeak-text-muted text-base font-medium hover:border-northpeak-green/30 hover:text-northpeak-text transition-colors"
            >
              Ver casos de éxito
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-10 px-4 sm:px-6 border-y border-northpeak-surface bg-northpeak-card">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-heading font-bold text-northpeak-green mb-1">{stat.value}</p>
              <p className="text-sm text-northpeak-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Case Studies ── */}
      <section id="casos" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-northpeak-green uppercase tracking-widest mb-3">
              Resultados reales
            </p>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-northpeak-text mb-4">
              No prometemos, demostramos
            </h2>
            <p className="text-northpeak-text-muted max-w-xl mx-auto">
              Negocios en Monterrey que transformaron su presencia digital con NorthPeak.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {caseStudies.map((cs) => (
              <div
                key={cs.client}
                className={`relative rounded-2xl border ${cs.border} bg-gradient-to-br ${cs.color} p-6 flex flex-col gap-4`}
              >
                <div>
                  <p className={`text-xs font-mono uppercase tracking-wider ${cs.accent} mb-1`}>
                    {cs.industry}
                  </p>
                  <h3 className="text-xl font-heading font-bold text-northpeak-text leading-snug">
                    {cs.headline}
                  </h3>
                </div>

                <p className="text-sm text-northpeak-text-muted leading-relaxed flex-1">
                  {cs.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {cs.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full bg-northpeak-surface text-northpeak-text-muted text-[11px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-northpeak-surface">
                  {cs.metrics.map((m) => (
                    <div key={m.label} className="text-center">
                      <p className={`text-lg font-heading font-bold ${cs.accent}`}>{m.value}</p>
                      <p className="text-[10px] text-northpeak-text-dim leading-tight">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4 sm:px-6 bg-northpeak-card border-y border-northpeak-surface">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-northpeak-green uppercase tracking-widest mb-3">
              Proceso
            </p>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-northpeak-text mb-4">
              Cómo trabajamos
            </h2>
            <p className="text-northpeak-text-muted max-w-xl mx-auto">
              Sin reuniones interminables ni procesos complicados. Empezamos a trabajar rápido.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-northpeak-green/10 border border-northpeak-green/20 shrink-0">
                      <step.icon className="h-5 w-5 text-northpeak-green" />
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs font-mono text-northpeak-text-dim mb-1">{step.number}</p>
                    <h3 className="font-heading font-bold text-northpeak-text mb-2">{step.title}</h3>
                    <p className="text-sm text-northpeak-text-muted leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services / Pricing ── */}
      <section id="servicios" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-northpeak-green uppercase tracking-widest mb-3">
              Servicios y precios
            </p>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-northpeak-text mb-4">
              Sin letras chiquitas
            </h2>
            <p className="text-northpeak-text-muted max-w-xl mx-auto">
              Mostramos rangos de inversión para que sepas con qué esperar antes de hablar con nosotros.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((svc) => (
              <div
                key={svc.name}
                className={`rounded-2xl border border-northpeak-surface bg-northpeak-card p-5 flex flex-col gap-4 hover:border-northpeak-green/20 transition-colors ${svc.highlight ? "ring-1 ring-northpeak-green/20" : ""}`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${svc.bg}`}>
                  <BarChart2 className={`h-4 w-4 ${svc.color}`} />
                </div>

                <div>
                  <h3 className="font-heading font-bold text-northpeak-text text-base leading-snug mb-1">
                    {svc.name}
                  </h3>
                  <p className={`text-sm font-mono font-bold ${svc.color}`}>{svc.price}</p>
                </div>

                <p className="text-sm text-northpeak-text-muted leading-relaxed flex-1">
                  {svc.description}
                </p>

                <ul className="space-y-1.5">
                  {svc.includes.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-northpeak-text-muted">
                      <Check className={`h-3.5 w-3.5 shrink-0 ${svc.color}`} />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/analizar"
                  className={`mt-auto flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    svc.highlight
                      ? "bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
                      : "border border-northpeak-surface text-northpeak-text-muted hover:text-northpeak-text hover:border-northpeak-green/30"
                  }`}
                >
                  Empezar
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-northpeak-text-dim mt-6">
            ¿No sabes por dónde empezar?{" "}
            <Link href="/analizar" className="text-northpeak-green hover:underline">
              Haz el diagnóstico gratis
            </Link>{" "}
            y te recomendamos.
          </p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-20 px-4 sm:px-6 bg-northpeak-card border-y border-northpeak-surface">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-mono text-northpeak-green uppercase tracking-widest mb-3">
                Lo que dicen nuestros clientes
              </p>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-northpeak-text mb-4">
                Opiniones reales
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((t) => {
                const client = t.clients as unknown as { name: string; company: string } | null;
                return (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-northpeak-surface bg-northpeak-bg p-5 flex flex-col gap-3"
                  >
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-northpeak-surface fill-northpeak-surface"
                          }`}
                        />
                      ))}
                    </div>

                    {t.title && (
                      <p className="font-heading font-semibold text-northpeak-text text-sm">
                        &ldquo;{t.title}&rdquo;
                      </p>
                    )}
                    <p className="text-sm text-northpeak-text-muted leading-relaxed flex-1">
                      {t.content}
                    </p>

                    {client && (
                      <div className="pt-2 border-t border-northpeak-surface">
                        <p className="text-xs font-medium text-northpeak-text">{client.name}</p>
                        {client.company && (
                          <p className="text-[11px] text-northpeak-text-dim">{client.company}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── ROI Calculator ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-northpeak-green uppercase tracking-widest mb-3">
              Calculadora
            </p>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-northpeak-text mb-4">
              ¿Cuánto podrías ganar?
            </h2>
            <p className="text-northpeak-text-muted max-w-xl mx-auto">
              Ajusta los números de tu negocio y ve qué retorno realista esperar con una inversión
              en marketing digital.
            </p>
          </div>

          <div className="rounded-2xl border border-northpeak-surface bg-northpeak-card p-6 sm:p-8">
            <RoiCalculator />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="preguntas" className="py-20 px-4 sm:px-6 bg-northpeak-card border-y border-northpeak-surface">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-northpeak-green uppercase tracking-widest mb-3">
              Preguntas frecuentes
            </p>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-northpeak-text mb-4">
              Lo que todos preguntan
            </h2>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-northpeak-green/5 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-northpeak-text mb-4">
            ¿Listo para crecer?
          </h2>
          <p className="text-northpeak-text-muted text-lg mb-10 max-w-xl mx-auto">
            Analiza tu presencia digital gratis en 5 minutos. Sin registro, sin compromiso. Te
            decimos exactamente en qué mejorar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/analizar"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-northpeak-green text-northpeak-bg text-base font-bold hover:bg-northpeak-green/90 transition-all hover:scale-105 shadow-xl shadow-northpeak-green/20"
            >
              <Zap className="h-4 w-4" />
              Analizar mi negocio gratis
            </Link>
            <a
              href="https://wa.me/528110000000"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-northpeak-surface text-northpeak-text-muted text-base font-medium hover:border-northpeak-green/30 hover:text-northpeak-text transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-northpeak-surface bg-northpeak-card py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center sm:items-start gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="NorthPeak Digital" className="h-6" />
              <div className="flex items-center gap-1 text-xs text-northpeak-text-dim">
                <MapPin className="h-3 w-3" />
                Monterrey, Nuevo León — México
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-northpeak-text-muted">
              <a href="#casos" className="hover:text-northpeak-text transition-colors">Casos de éxito</a>
              <a href="#servicios" className="hover:text-northpeak-text transition-colors">Servicios</a>
              <a href="#preguntas" className="hover:text-northpeak-text transition-colors">Preguntas</a>
              <Link href="/analizar" className="hover:text-northpeak-text transition-colors">Analizador</Link>
              <Link href="/portal/dashboard" className="hover:text-northpeak-text transition-colors">Portal</Link>
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="/analizar"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-semibold hover:bg-northpeak-green/90 transition-colors"
              >
                Diagnóstico gratis
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-northpeak-surface text-center text-xs text-northpeak-text-dim">
            © {new Date().getFullYear()} NorthPeak Digital. Todos los derechos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
}

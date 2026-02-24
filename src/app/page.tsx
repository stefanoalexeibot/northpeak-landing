import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight, Star, Zap, Bot, Search, Settings2, Clock,
  TrendingUp, ChevronRight,
} from "lucide-react";
import FaqAccordion from "@/components/landing/faq-accordion";
import FadeIn from "@/components/landing/fade-in";
import AnimatedCounter from "@/components/landing/animated-counter";
import ChatbotDemo from "@/components/landing/chatbot-demo";
import QuickCaptureForm from "@/components/landing/quick-capture-form";
import MobileNav from "@/components/landing/mobile-nav";
import HeroLiveFeed from "@/components/landing/hero-live-feed";
import StatsMarquee from "@/components/landing/stats-marquee";
import AnimatedBackground from "@/components/portal/animated-background";
import DotGrid from "@/components/portal/dot-grid";
import RotatingText from "@/components/reactbits/RotatingText";
import GradientText from "@/components/reactbits/GradientText";
import ScrollToTop from "@/components/landing/scroll-to-top";
import StickyMobileCta from "@/components/landing/sticky-mobile-cta";
import ParallaxHeroGlow from "@/components/landing/parallax-hero-glow";
import HeroEffects from "@/components/landing/hero-effects";
import HeroBadge from "@/components/landing/hero-badge";
import ClickSparkWrapper from "@/components/landing/click-spark-wrapper";

// ── Extracted section components ─────────────────────────────────────────────
import ServicesSection from "@/components/landing/services-section";
import OneTimeServicesSection from "@/components/landing/one-time-services-section";
import CaseStudiesSection from "@/components/landing/case-studies-section";
import ProcessSection from "@/components/landing/process-section";
import DifferentiatorsSection from "@/components/landing/differentiators-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import RoiSection from "@/components/landing/roi-section";
import FinalCtaSection from "@/components/landing/final-cta-section";
import FooterSection from "@/components/landing/footer-section";

export const metadata: Metadata = {
  title: "NorthPeak — IA para Incrementar Ventas · Monterrey",
  description:
    "Infraestructura de inteligencia artificial para captar leads, calificarlos automáticamente y cerrar más ventas. Negocios en Monterrey que venden en piloto automático.",
  openGraph: {
    title: "NorthPeak — La IA que vende. Sin parar.",
    description:
      "Construimos la infraestructura de IA que tu negocio necesita para captar leads, calificarlos automáticamente y cerrar más ventas — sin contratar más personal.",
    url: "https://northpeak.mx",
    siteName: "NorthPeak",
    locale: "es_MX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NorthPeak — IA para ventas" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NorthPeak — La IA que vende. Sin parar.",
    description: "Infraestructura de IA para incrementar ventas en Monterrey.",
  },
};

export default async function LandingPage() {
  // Fetch testimonials from Supabase
  const supabase = createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id, rating, title, content, clients(name, company)")
    .eq("visible", true)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="relative min-h-screen bg-northpeak-bg text-northpeak-text font-sans antialiased">
      {/* ── Global effects ── */}
      <AnimatedBackground />
      <DotGrid />

      <div className="relative z-10">

        {/* ── Navbar ── */}
        <header className="sticky top-0 z-40 border-b border-northpeak-surface bg-northpeak-bg/80 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-5 sm:px-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="NorthPeak" className="h-8" />

            <nav className="hidden md:flex items-center gap-7 font-mono text-xs tracking-wider text-northpeak-text-muted uppercase">
              <a href="#servicios" className="hover:text-northpeak-text transition-colors">Servicios</a>
              <a href="#pago-unico" className="hover:text-northpeak-text transition-colors">Pago único</a>
              <a href="#casos" className="hover:text-northpeak-text transition-colors">Resultados</a>
              <a href="#preguntas" className="hover:text-northpeak-text transition-colors">FAQ</a>
              <Link href="/portal/dashboard" className="hover:text-northpeak-text transition-colors">Portal</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/analizar"
                className="hidden md:flex group items-center gap-2 px-4 py-2 rounded-lg bg-northpeak-green text-northpeak-bg text-sm font-bold hover:bg-northpeak-green/90 transition-all"
              >
                Analizar mi negocio
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <MobileNav />
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="relative min-h-[92vh] flex items-center px-5 sm:px-8 pt-16 pb-24 overflow-hidden">
          <ParallaxHeroGlow />
          <HeroEffects />

          <div className="relative max-w-6xl mx-auto w-full grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-12 xl:gap-16 items-center">
            <div>
              <HeroBadge />

              <h1 className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-tight tracking-tight text-northpeak-text mb-6 max-w-4xl">
                La IA que vende.{" "}
                <GradientText
                  colors={["#00e5a0", "#00d4ff", "#00e5a0"]}
                  animationSpeed={4}
                  className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl"
                >
                  Sin parar.
                </GradientText>
              </h1>

              <div className="flex items-center gap-3 mb-4 text-northpeak-text-muted text-lg sm:text-xl">
                <span>Expertos en</span>
                <RotatingText
                  texts={["Marketing Digital", "Redes Sociales", "Google My Business", "Chatbots con IA", "Automatización"]}
                  rotationInterval={2500}
                  staggerDuration={0.03}
                  staggerFrom="first"
                  mainClassName="text-northpeak-green font-bold overflow-hidden py-1"
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              </div>

              <p className="text-lg sm:text-xl text-northpeak-text-muted max-w-2xl leading-relaxed mb-10">
                Construimos la infraestructura de inteligencia artificial que tu negocio necesita
                para captar leads, calificarlos automáticamente y cerrar más ventas — sin contratar
                más personal.
              </p>

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

              <div className="mb-10">
                <QuickCaptureForm />
              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Bot, val: <><AnimatedCounter to={40} prefix="+" />  empresas</>, sub: "automatizadas con IA", color: "text-northpeak-green", key: "empresas" },
                  { icon: TrendingUp, val: <><AnimatedCounter to={3.2} decimals={1} suffix="×" /> más ventas</>, sub: "promedio de clientes", color: "text-blue-400", key: "ventas" },
                  { icon: Star, val: <><AnimatedCounter to={4.9} decimals={1} suffix="★" /> satisfacción</>, sub: "clientes activos", color: "text-yellow-400", key: "rating" },
                ].map((chip) => (
                  <div
                    key={chip.key}
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

            <div className="hidden xl:flex items-center justify-center">
              <HeroLiveFeed />
            </div>
          </div>
        </section>

        {/* ── Stats marquee ── */}
        <StatsMarquee />

        {/* ── Chatbot Demo ── */}
        <section className="py-24 px-5 sm:px-8 border-t border-northpeak-surface">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <FadeIn direction="left">
                <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Demo en vivo</p>
                <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight leading-tight mb-5">
                  Tu agente de IA.<br />
                  <span className="text-northpeak-green">En acción.</span>
                </h2>
                <p className="text-northpeak-text-muted leading-relaxed mb-8 max-w-md">
                  Así responde tu agente en WhatsApp: atiende, califica y agenda citas — sin que muevas un dedo, a cualquier hora del día.
                </p>

                <ul className="space-y-4 mb-10">
                  {[
                    { icon: Bot, text: "Atiende el 100% de los mensajes en segundos" },
                    { icon: Search, text: "Califica leads con preguntas inteligentes" },
                    { icon: Settings2, text: "Agenda citas y conecta con tu operación" },
                    { icon: Clock, text: "Opera 24/7 sin costo adicional por hora" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-northpeak-green/10 border border-northpeak-green/20 mt-0.5">
                        <item.icon className="h-3.5 w-3.5 text-northpeak-green" />
                      </div>
                      <span className="text-sm text-northpeak-text-muted leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/analizar"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-northpeak-green text-northpeak-bg font-bold text-sm hover:bg-northpeak-green/90 transition-all hover:scale-[1.02]"
                >
                  <Zap className="h-4 w-4" />
                  Quiero este agente en mi negocio
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </FadeIn>

              <FadeIn delay={0.15}>
                <ChatbotDemo />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── Extracted sections ── */}
        <ClickSparkWrapper>
          <ServicesSection />
          <OneTimeServicesSection />
          <CaseStudiesSection />
          <ProcessSection />
          <DifferentiatorsSection />
          <TestimonialsSection testimonials={testimonials ?? []} />
          <RoiSection />

          {/* ── FAQ ── */}
          <section id="preguntas" className="py-24 px-5 sm:px-8 border-t border-northpeak-surface">
            <div className="max-w-3xl mx-auto">
              <FadeIn className="text-center mb-14">
                <p className="font-mono text-[11px] tracking-[0.2em] text-northpeak-green uppercase mb-4">— Preguntas frecuentes</p>
                <h2 className="font-heading font-bold text-4xl sm:text-5xl text-northpeak-text tracking-tight mb-3">
                  Lo que todos preguntan.
                </h2>
                <p className="text-northpeak-text-muted max-w-md mx-auto">
                  Sin tecnicismos. Respuestas directas sobre cómo funciona la infraestructura de IA para tu negocio.
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <FaqAccordion />
              </FadeIn>
            </div>
          </section>

          <FinalCtaSection />
          <FooterSection />
        </ClickSparkWrapper>

      </div>{/* /z-10 wrapper */}

      <ScrollToTop />
      <StickyMobileCta />
    </div>
  );
}
   
 
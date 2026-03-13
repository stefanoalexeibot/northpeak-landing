"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  CheckCircle2, Globe, Database, TrendingUp, 
  ShieldCheck, Sparkles, Building2,
  PhoneCall, Rocket
} from "lucide-react";
import AnimatedBackground from "@/components/portal/animated-background";
import DotGrid from "@/components/portal/dot-grid";
import FadeIn from "@/components/landing/fade-in";
import { cn } from "@/lib/utils";

/* eslint-disable @next/next/no-img-element */

// --- Componentes Locales ---

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  why: string;
  forWhat: string;
  color: string;
}

const FeatureCard = ({ icon: Icon, title, why, forWhat, color }: FeatureCardProps) => (
  <div className="group p-6 rounded-3xl bg-northpeak-card/30 border border-northpeak-surface hover:border-northpeak-green/40 transition-all duration-500 backdrop-blur-sm relative overflow-hidden">
    <div className={cn("absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity blur-2xl rounded-full -mr-8 -mt-8", color)} />
    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6 border border-northpeak-surface shadow-inner", color.replace('bg-', 'text-').replace('-500', '/10'))}>
      <Icon className={cn("h-6 w-6", color.replace('bg-', 'text-'))} />
    </div>
    <h4 className="text-xl font-bold text-northpeak-text mb-4">{title}</h4>
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-northpeak-green mb-1">¿Por qué?</p>
        <p className="text-sm text-northpeak-text-muted leading-relaxed italic">&quot;{why}&quot;</p>
      </div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-1">¿Para qué?</p>
        <p className="text-sm text-northpeak-text-muted leading-relaxed">{forWhat}</p>
      </div>
    </div>
  </div>
);

interface PlanItemProps {
  item: {
    title: string;
    price: number;
    desc: string;
  };
  isSelected: boolean;
  onToggle: () => void;
}

const PlanItem = ({ item, isSelected, onToggle }: PlanItemProps) => (
  <div 
    onClick={onToggle}
    className={cn(
      "cursor-pointer group flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300",
      isSelected 
        ? "bg-northpeak-green/10 border-northpeak-green/50 shadow-[0_0_20px_rgba(0,229,160,0.1)]" 
        : "bg-northpeak-card/20 border-northpeak-surface hover:border-northpeak-surface-hover"
    )}
  >
    <div className={cn(
      "mt-1 h-5 w-5 rounded-md border flex items-center justify-center transition-colors",
      isSelected ? "bg-northpeak-green border-northpeak-green" : "border-northpeak-surface"
    )}>
      {isSelected && <CheckCircle2 className="h-3 w-3 text-northpeak-bg" />}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <h5 className={cn("font-bold text-sm", isSelected ? "text-northpeak-green" : "text-northpeak-text")}>
          {item.title}
        </h5>
        <span className="font-mono text-xs font-bold">${item.price.toLocaleString()}</span>
      </div>
      <p className="text-xs text-northpeak-text-dim leading-relaxed">{item.desc}</p>
    </div>
  </div>
);

export default function RemodelacionesNovaPremiumProposal() {
  const [selectedServices, setSelectedServices] = useState<string[]>(["web", "infra", "seo", "auto"]);

  const services: Record<string, { id: string; title: string; price: number; desc: string }> = useMemo(() => ({
    infra: { id: "infra", title: "Cimentación Digital", price: 4500, desc: "Dominio .com + Google Workspace + Hosting de alta velocidad." },
    web: { id: "web", title: "Plataforma Premium", price: 12500, desc: "Web interactiva Next.js con portafolio de impacto y SEO inicial." },
    auto: { id: "auto", title: "Cierre en Caliente (IA)", price: 5000, desc: "Automatización de leads a WhatsApp y CRM básico." },
    seo: { id: "seo", title: "Imán de Clientes (SEO)", price: 2500, desc: "Optimización profunda para Monterrey y área metropolitana." },
  }), []);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((acc, curr) => acc + services[curr].price, 0);
  }, [selectedServices, services]);

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative min-h-screen bg-[#05060A] text-northpeak-text font-sans antialiased overflow-x-hidden selection:bg-northpeak-green selection:text-northpeak-bg">
      {/* ── Background Elements ── */}
      <AnimatedBackground />
      <DotGrid />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-northpeak-green/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* ── Nav ── */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6 sm:px-10">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="NorthPeak" className="h-7" />
              <div className="hidden sm:block h-5 w-[1px] bg-white/10" />
              <span className="hidden sm:block font-mono text-[9px] uppercase tracking-[0.3em] text-northpeak-text-dim">
                Partner Estratégico & Innovación
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="hidden md:block font-mono text-[10px] text-northpeak-green animate-pulse">● PROPUESTA ACTIVA</span>
              <Link href="https://wa.me/8124262186" className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-northpeak-green/30 rounded-lg hover:bg-northpeak-green/5 transition-all text-northpeak-green">
                Hablar con Estratega
              </Link>
            </div>
          </div>
        </header>

        {/* ── Hero: The Message ── */}
        <section className="pt-24 pb-20 px-6 sm:px-10">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full border border-northpeak-green/20 bg-northpeak-green/5 mb-8 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-northpeak-green" />
                <span className="text-[11px] font-mono font-extrabold text-northpeak-green uppercase tracking-[0.2em]">Exclusivo para Remodelaciones Nova</span>
              </div>
              <h1 className="font-heading font-black text-5xl sm:text-7xl lg:text-8xl leading-[1.05] tracking-tight text-white mb-8">
                Cerrar proyectos <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-northpeak-green via-blue-400 to-northpeak-green bg-300% animate-gradient">no debería ser manual.</span>
              </h1>
              <p className="text-xl sm:text-2xl text-northpeak-text-muted max-w-3xl leading-relaxed mb-12">
                Su trabajo es remodelar hogares, el nuestro es remodelar su sistema de ventas 
                para que cada visita a su perfil se convierta en una cotización real.
              </p>
              
              <div className="flex flex-wrap gap-5">
                <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                  <div className="h-10 w-10 rounded-full bg-northpeak-green/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-northpeak-green" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-northpeak-text-dim uppercase tracking-tighter">Alcance</p>
                    <p className="text-sm font-bold text-white">Dominio del Mercado</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-northpeak-text-dim uppercase tracking-tighter">Confianza</p>
                    <p className="text-sm font-bold text-white">Autoridad Institucional</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── Value Proposition: Why and For What ── */}
        <section className="py-24 px-6 sm:px-10 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="mb-16">
              <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white mb-4 tracking-tight">¿Por qué este ecosistema?</h2>
              <p className="text-northpeak-text-muted text-lg max-w-xl">Desglosamos el valor real detrás de cada pieza técnica de su nueva infraestructura.</p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FadeIn delay={0.1}>
                <FeatureCard 
                  icon={Globe}
                  title="Presencia Institucional"
                  why="Hoy en día, un perfil de Instagram es una tarjeta de presentación, pero una página web es su oficina central en Monterrey."
                  forWhat="Para que cuando un cliente de alto nivel busque su empresa, encuentre una entidad sólida que dé confianza para invertir millones."
                  color="bg-northpeak-green"
                />
              </FadeIn>
              <FadeIn delay={0.2}>
                <FeatureCard 
                  icon={Database}
                  title="Estrategia Paneles Solares"
                  why="La tendencia 2026 en Monterrey es el ahorro energético. Su empresa ya lo hace, pero no lo explota digitalmente."
                  forWhat="Para atraer leads calificados mediante una calculadora de ahorro energético que capture datos antes de dar el resultado."
                  color="bg-blue-500"
                />
              </FadeIn>
              <FadeIn delay={0.3}>
                <FeatureCard 
                  icon={PhoneCall}
                  title="Respuesta en 2 Segundos"
                  why="El lead (prospecto) se enfría a los 5 minutos. Si no responde rápido, su competencia lo hará."
                  forWhat="Para que su equipo reciba una alerta inmediata en WhatsApp con el presupuesto aproximado del cliente ya calculado."
                  color="bg-yellow-500"
                />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── Scalability Message ── */}
        <section className="py-24 px-6 sm:px-10">
          <div className="max-w-6xl mx-auto">
            <div className="p-10 sm:p-16 rounded-[40px] bg-gradient-to-br from-northpeak-card/80 to-northpeak-bg border border-northpeak-surface relative overflow-hidden">
               <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute top-[-50%] right-[-20%] w-[100%] h-[150%] bg-blue-400 rotate-45 blur-[100px]" />
               </div>
               
               <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div>
                   <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white mb-6 tracking-tight">Crezca a su ritmo. <br /><span className="text-northpeak-green">Sin presiones.</span></h2>
                   <p className="text-lg text-northpeak-text-muted leading-relaxed mb-8">
                     Entendemos que cada negocio tiene su proceso. Nuestra propuesta es 100% modular: 
                     podemos comenzar estableciendo su <span className="text-white font-bold">Autoridad Digital (Web)</span> hoy mismo, 
                     y escalar a la automatización de leads en la siguiente etapa.
                   </p>
                   <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-3">
                       <div className="h-6 w-6 rounded-full bg-northpeak-green/20 flex items-center justify-center">
                         <span className="text-xs font-bold text-northpeak-green italic">01</span>
                       </div>
                       <span className="text-sm font-medium">Fase 1: Identidad y Portafolio Web</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                         <span className="text-xs font-bold text-white/50 italic">02</span>
                       </div>
                       <span className="text-sm font-medium text-northpeak-text-dim italic">Fase 2: Automatización de Ventas (IA)</span>
                     </div>
                   </div>
                 </div>
                 <div className="h-[300px] rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center backdrop-blur-md">
                   <Building2 className="h-32 w-32 text-northpeak-text-dim opacity-20" />
                   <p className="absolute bottom-6 font-mono text-[9px] uppercase tracking-widest text-northpeak-text-dim">Esquema Evolutivo de Negocio</p>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* ── Interactive Quote ── */}
        <section className="py-24 px-6 sm:px-10 bg-white/[0.01]">
          <div className="max-w-4xl mx-auto">
            <FadeIn className="text-center mb-16">
              <p className="font-mono text-[10px] tracking-[0.3em] text-northpeak-green uppercase mb-4">Inversión Transparente</p>
              <h2 className="font-heading font-black text-4xl sm:text-6xl text-white mb-6">Cotización Modular</h2>
              <p className="text-northpeak-text-muted">Seleccione los módulos que desea activar para su lanzamiento.</p>
            </FadeIn>

            <div className="space-y-4 mb-12">
              {Object.values(services).map((item) => (
                <FadeIn key={item.id}>
                  <PlanItem 
                    item={item} 
                    isSelected={selectedServices.includes(item.id)}
                    onToggle={() => toggleService(item.id)}
                  />
                </FadeIn>
              ))}
            </div>

            <FadeIn>
              <div className="p-8 rounded-3xl bg-gradient-to-r from-northpeak-card to-northpeak-bg border border-northpeak-green/30 text-center">
                <p className="text-sm font-mono text-northpeak-text-muted uppercase tracking-widest mb-2">Total de la Inversión</p>
                <div className="flex items-baseline justify-center gap-2 mb-8">
                  <span className="text-6xl font-black text-white">${totalPrice.toLocaleString()}</span>
                  <span className="text-xl font-bold text-northpeak-text-dim">MXN</span>
                </div>

                <Link 
                  href={`https://wa.me/8124262186?text=Hola,%20me%20interesa%20la%20propuesta%20de%20Remodelaciones%20Nova%20con%20los%20modulos:%20${selectedServices.join(',%20')}`}
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-northpeak-green text-northpeak-bg font-black text-lg hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,229,160,0.2)]"
                >
                  <Rocket className="h-6 w-6" />
                  Iniciar Mi Transformación
                </Link>
                <p className="mt-6 text-[11px] text-northpeak-text-dim italic">* Precios sujetos a vigencia de 15 días.</p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── Irresistible Offer ── */}
        <section className="py-32 px-6 sm:px-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-northpeak-green/50 to-transparent" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <FadeIn>
              <div className="mb-10 inline-block px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <Sparkles className="h-6 w-6 text-yellow-500 mx-auto mb-2 animate-bounce" />
                <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Oportunidad Única</span>
              </div>
              <h2 className="font-heading font-black text-5xl sm:text-7xl text-white mb-8">La Promoción <br /> <span className="text-northpeak-green italic">Irrechazable.</span></h2>
              
              <div className="p-10 rounded-[3rem] bg-white text-black text-left shadow-[0_50px_100px_rgba(255,255,255,0.05)] relative">
                <div className="absolute top-[-10px] right-10 px-4 py-1 bg-northpeak-bg text-northpeak-green text-[10px] font-mono font-bold rounded-full border border-northpeak-green/50">
                  SÓLO MARZO 2026
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase leading-none">Si activas el Proyecto Integral hoy:</h3>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 font-bold text-lg">
                    <CheckCircle2 className="h-6 w-6 text-northpeak-green" />
                    Bonificación de $2,500 MXN en su primer mes de Google Ads.
                  </li>
                  <li className="flex items-center gap-3 font-bold text-lg">
                    <CheckCircle2 className="h-6 w-6 text-northpeak-green" />
                    Sesión de Fotografía Profesional para un proyecto insignia.
                  </li>
                  <li className="flex items-center gap-3 font-bold text-lg">
                    <CheckCircle2 className="h-6 w-6 text-northpeak-green" />
                    Soporte Prioritario de por vida en campañas de Monterrey.
                  </li>
                </ul>
                
                <p className="text-sm font-medium text-black/60 italic leading-relaxed">
                  &quot;No queremos ser un gasto, queremos ser la inversión que pague sus próximas remodelaciones.&quot;
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="py-20 px-6 sm:px-10 border-t border-white/5 relative bg-black">
          <div className="max-w-6xl mx-auto flex flex-col items-center">
            <img src="/logo.png" alt="NorthPeak" className="h-8 mb-8 grayscale hover:grayscale-0 transition-all opacity-50" />
            <p className="text-[11px] font-mono uppercase tracking-[0.5em] text-northpeak-text-dim text-center mb-4">
              Impulsando el crecimiento real mediante tecnología y diseño.
            </p>
            <div className="flex gap-8 text-[10px] font-bold text-northpeak-text-dim uppercase tracking-widest">
              <span>Monterrey, México</span>
              <span>© 2026 NorthPeak Digital</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

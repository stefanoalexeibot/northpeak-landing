"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, Globe, 
  Shield, 
  Rocket, Plus, Info, 
  BookOpen, Timer, Tag,
  ArrowRight, MousePointer2, MessageSquare,
  Construction, Truck,
  Wrench, Building2, MapPin
} from "lucide-react";
import AnimatedBackground from "@/components/portal/animated-background";
import DotGrid from "@/components/portal/dot-grid";
import FadeIn from "@/components/landing/fade-in";
import { cn } from "@/lib/utils";

/* eslint-disable @next/next/no-img-element */

// --- Interfaces ---

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  why: string;
  forWhat: string;
  color: string;
}

interface PlanItemProps {
  item: {
    title: string;
    price: number;
    desc: string;
    tag?: string;
  };
  isSelected: boolean;
  onToggle: () => void;
}

// --- Componentes Locales ---

const FeatureCard = ({ icon: Icon, title, why, forWhat, color }: FeatureCardProps) => (
  <div className="group p-8 rounded-[2.5rem] bg-northpeak-card/30 border border-northpeak-surface hover:border-yellow-500/40 transition-all duration-500 backdrop-blur-sm relative overflow-hidden flex flex-col h-full">
    <div className={cn("absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity blur-3xl rounded-full -mr-12 -mt-12", color)} />
    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-8 border border-northpeak-surface shadow-inner", color.replace('bg-', 'text-').replace('-500', '/10'))}>
      <Icon className={cn("h-7 w-7", color.replace('bg-', 'text-'))} />
    </div>
    <h4 className="text-2xl font-bold text-white mb-5">{title}</h4>
    <div className="space-y-6 flex-1">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-yellow-500 mb-2">Realidad del Sector:</p>
        <p className="text-sm text-northpeak-text-muted leading-relaxed italic">&quot;{why}&quot;</p>
      </div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-northpeak-green mb-2">Estrategia NorthPeak:</p>
        <p className="text-sm text-northpeak-text-muted leading-relaxed">{forWhat}</p>
      </div>
    </div>
  </div>
);

const PlanItem = ({ item, isSelected, onToggle }: PlanItemProps) => (
  <div 
    onClick={onToggle}
    className={cn(
      "cursor-pointer group flex items-start gap-5 p-6 rounded-[2rem] border transition-all duration-300",
      isSelected 
        ? "bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.1)]" 
        : "bg-northpeak-card/20 border-white/5 hover:border-white/10"
    )}
  >
    <div className={cn(
      "mt-1.5 h-6 w-6 rounded-lg border flex items-center justify-center transition-all duration-500",
      isSelected ? "bg-yellow-500 border-yellow-500 scale-110" : "border-white/10"
    )}>
      {isSelected ? <CheckCircle2 className="h-4 w-4 text-black" /> : <Plus className="h-3 w-3 text-white/20" />}
    </div>
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h5 className={cn("font-bold text-base", isSelected ? "text-yellow-500" : "text-white")}>
            {item.title}
          </h5>
          {item.tag && (
            <span className="text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-northpeak-text-dim">
              {item.tag}
            </span>
          )}
        </div>
        <span className="font-mono text-sm font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5">${item.price.toLocaleString()}</span>
      </div>
      <p className="text-sm text-northpeak-text-dim leading-relaxed">{item.desc}</p>
    </div>
  </div>
);

const GlossaryItem = ({ term, meaning }: { term: string; meaning: string }) => (
  <div className="p-6 rounded-3xl bg-northpeak-card/20 border border-white/5 hover:bg-white/[0.03] transition-colors">
    <h5 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">
      <Info className="h-4 w-4" />
      {term}
    </h5>
    <p className="text-sm text-northpeak-text-muted leading-relaxed">{meaning}</p>
  </div>
);

export default function CrauzProposalPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>(["web", "infra", "seo", "auto"]);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  // Countdown Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const services: Record<string, { id: string; title: string; price: number; desc: string; tag: string }> = useMemo(() => ({
    infra: { id: "infra", tag: "Propiedad Digital", title: "Infraestructura de Obra", price: 4500, desc: "Dominio crauz.mx blindado, correos de alta capacidad (proyectos@crauz.mx) y servidor de nivel industrial." },
    web: { id: "web", tag: "Portafolio Industrial", title: "Showcase de Proyectos y Mantenimiento", price: 12500, desc: "Tu portafolio de construcción en HD. Galería de proyectos, fichas de servicios y plataforma optimizada para licitaciones." },
    auto: { id: "auto", tag: "Automatización", title: "Asistente de Cotización 24/7", price: 7500, desc: "IA experta en construcción que califica prospectos por WhatsApp, solicita m2 y ubicaciones de obra automáticamente." },
    seo: { id: "seo", tag: "Expansión Comercial", title: "Posicionamiento 'Autoridad en Construcción'", price: 3500, desc: "Aparecerás cuando directivos busquen 'Mantenimiento de naves industriales' o 'Construcción comercial' en tu zona." },
  }), []);

  const subtotal = useMemo(() => {
    return selectedServices.reduce((acc, curr) => acc + services[curr].price, 0);
  }, [selectedServices, services]);

  const discount = Math.round(subtotal * 0.10);
  const totalWithDiscount = subtotal - discount;

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0B] text-[#A0A0B0] font-sans antialiased overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      {/* ── Background Elements ── */}
      <AnimatedBackground />
      <DotGrid />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-yellow-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-slate-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* ── Nav ── */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0B]/60 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-6 sm:px-12">
            <div className="flex items-center gap-5">
              <img src="/logo.png" alt="NorthPeak" className="h-8" />
              <div className="hidden lg:block h-6 w-[1px] bg-white/10" />
              <span className="hidden lg:block font-mono text-[10px] uppercase tracking-[0.4em] text-northpeak-text-dim">
                Partner Estratégico CRAUZ INDUSTRIAL
              </span>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-8">
               <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                 <Timer className="h-4 w-4 text-yellow-500 animate-pulse" />
                 <span className="font-mono text-xs font-bold text-yellow-500">
                   {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                 </span>
               </div>
               <Link href="https://wa.me/528121980008" className="text-[11px] font-bold uppercase tracking-widest px-4 py-2 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/5 transition-all text-yellow-500">
                 Hablar con Estratega
               </Link>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="pt-28 pb-24 px-6 sm:px-12">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 mb-10 backdrop-blur-sm">
                <Construction className="h-4 w-4 text-yellow-500" />
                <span className="text-[11px] font-mono font-black text-yellow-500 uppercase tracking-[0.3em]">Propuesta de Infraestructura Digital 2026</span>
              </div>
              <h1 className="font-heading font-black text-5xl sm:text-7xl lg:text-9xl leading-[0.9] tracking-tighter text-white mb-10">
                Liderazgo en obra,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-white to-yellow-500 bg-300% animate-gradient italic">autoridad en la red.</span>
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl text-northpeak-text-muted max-w-3xl leading-snug mb-16">
                En Crauz Industrial, la confianza se construye con hechos. Creamos la <span className="text-white font-bold underline decoration-yellow-500">oficina digital</span> que 
                proyecta tu capacidad técnica y capta proyectos de gran escala sin descanso.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                {[
                  { icon: Building2, label: "Construcción", val: "Naves & Infraestructura" },
                  { icon: Wrench, label: "Mantenimiento", val: "Eficiencia Técnica" },
                  { icon: MapPin, label: "Presencia", val: "Local & Nacional" }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-5 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                    <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                      <stat.icon className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-northpeak-text-dim uppercase tracking-widest">{stat.label}</p>
                      <p className="text-lg font-bold text-white leading-none mt-1">{stat.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── Persuasion Section ── */}
        <section className="py-24 px-6 sm:px-12 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto">
            <FadeIn className="mb-20 text-center lg:text-left">
              <h2 className="font-heading font-black text-4xl sm:text-6xl text-white mb-6">La ventaja técnica de Crauz</h2>
              <p className="text-northpeak-text-muted text-lg max-w-2xl lg:mx-0 mx-auto">Tu presencia digital debe ser tan sólida como tus cimientos.</p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FadeIn delay={0.1}>
                <FeatureCard 
                  icon={Shield}
                  title="Solidez Industrial"
                  why="Las naves industriales no se cierran por folleto; se cierran por demostración de capacidad técnica y confianza."
                  forWhat="Tendrás una plataforma de impacto que muestra tus obras en alta resolución, certificaciones y procesos de seguridad, eliminando dudas de compra."
                  color="bg-yellow-600"
                />
              </FadeIn>
              <FadeIn delay={0.2}>
                <FeatureCard 
                  icon={Construction}
                  title="Showcase de Obra"
                  why="Un cliente de mantenimiento necesita ver que sabes manejar la escala de su infraestructura."
                  forWhat="Diseñamos un catálogo interactivo de servicios y proyectos terminados que funciona como tu mejor vendedor ante juntas directivas."
                  color="bg-zinc-800"
                />
              </FadeIn>
              <FadeIn delay={0.3}>
                <FeatureCard 
                  icon={Truck}
                  title="Filtro de Calidad"
                  why="Tu equipo no debe perder tiempo en cotizaciones sin sentido; necesitas prospectos que sepan lo que quieren."
                  forWhat="Implementamos una IA que solicita especificaciones de obra, m2 y alcance antes de pasarte el lead listo para firmar."
                  color="bg-northpeak-green"
                />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── Glossary: Industrial Construction ── */}
        <section className="py-24 px-6 sm:px-12">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="mb-16">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 text-yellow-500 mb-4">
                    <BookOpen className="h-6 w-6" />
                    <span className="font-mono text-sm uppercase tracking-widest font-bold">Conceptos de Alianza</span>
                  </div>
                  <h2 className="font-heading font-black text-3xl sm:text-5xl text-white mb-4 italic">Glosario Crauz Pro</h2>
                  <p className="text-northpeak-text-muted text-lg">Hablamos claro: traducimos tecnología en herramientas de crecimiento para tu constructora.</p>
                </div>
                <div className="px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5">
                   <p className="text-xs font-medium italic text-yellow-500/70">&quot;Cimentando el futuro digital de Crauz.&quot;</p>
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FadeIn delay={0.1}>
                <GlossaryItem 
                  term="SEO de Infraestructura" 
                  meaning="Que cuando busquen 'Mantenimiento preventivo naves', Crauz Industrial sea la primera opción profesional en Google." 
                />
              </FadeIn>
              <FadeIn delay={0.2}>
                <GlossaryItem 
                  term="UX Industrial" 
                  meaning="Diseño optimizado para que un jefe de planta o arquitecto vea tus trabajos con 1 solo clic." 
                />
              </FadeIn>
              <FadeIn delay={0.3}>
                <GlossaryItem 
                  term="Asistente IA Crauz" 
                  meaning="Un 'Ingeniero de Ventas' virtual que atiende WhatsApp 24/7 y califica el tipo de obra automáticamente." 
                />
              </FadeIn>
              <FadeIn delay={0.4}>
                <GlossaryItem 
                  term="Showcase Dinámico" 
                  meaning="Sistema para que subas fotos de tus avances de obra de forma sencilla, manteniendo tu web siempre viva." 
                />
              </FadeIn>
              <FadeIn delay={0.5}>
                <GlossaryItem 
                  term="Hosting de Obra" 
                  meaning="Servidores ultra-rápidos para que tus galerías de fotos carguen al instante en cualquier dispositivo." 
                />
              </FadeIn>
              <FadeIn delay={0.6}>
                <GlossaryItem 
                  term="Dominio Blindado" 
                  meaning="Gestión profesional de crauz.mx asegurando que tu identidad digital esté protegida y sea 100% tuya." 
                />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── Sales Funnel Strategy: Construction ── */}
        <section className="py-24 px-6 sm:px-12 bg-yellow-500/5 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-20">
             <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-yellow-500/10 blur-[100px] rounded-full" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <FadeIn className="text-center mb-20">
              <h2 className="font-heading font-black text-4xl sm:text-6xl text-white mb-6">El Embudo Crauz Industrial</h2>
              <p className="text-northpeak-text-muted text-lg max-w-2xl mx-auto italic">
                &quot;De la búsqueda en Google a la firma de contrato de obra.&quot;
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {[
                { 
                  icon: Globe, 
                  step: "1. Captación", 
                  desc: "Ubicamos a Crauz ante tomadores de decisión que buscan mantenimiento y construcción profesional.",
                  color: "text-yellow-500"
                },
                { 
                  icon: MousePointer2, 
                  step: "2. Verificación", 
                  desc: "El cliente valida tu experiencia mediante el showcase de proyectos y testimonios industriales.",
                  color: "text-white"
                },
                { 
                  icon: MessageSquare, 
                  step: "3. Calificación IA", 
                  desc: "Nuestra IA recopila m2, alcance y ubicación en WhatsApp, entregándote el lead filtrado.",
                  color: "text-northpeak-green"
                },
                { 
                  icon: Rocket, 
                  step: "4. Ejecución", 
                  desc: "Cierre comercial de Crauz. Tu equipo se enfoca solo en propuestas con alta probabilidad de cierre.",
                  color: "text-yellow-600"
                }
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.1} className="relative group">
                  <div className="p-10 rounded-[3rem] bg-northpeak-bg border border-white/5 hover:border-yellow-500/20 transition-all duration-500 text-center flex flex-col items-center h-full">
                    <div className={cn("h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform", item.color)}>
                      <item.icon className="h-8 w-8" />
                    </div>
                    <h5 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">{item.step}</h5>
                    <p className="text-sm text-northpeak-text-muted leading-relaxed">{item.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-20">
                      <ArrowRight className="h-8 w-8 text-white/10" />
                    </div>
                  )}
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Infrastructure & Mockup ── */}
        <section className="py-24 px-6 sm:px-12 bg-white/[0.01]">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <FadeIn className="lg:w-1/2">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-[10px] font-mono tracking-widest mb-6">
                 SHOWCASE INDUSTRIAL
               </div>
               <h2 className="font-heading font-black text-4xl sm:text-6xl text-white mb-8 leading-tight tracking-tighter">
                 Arquitectura digital <br /> para líderes en obra.
               </h2>
               <div className="space-y-6">
                 {[
                   { title: "Gestión de Portafolio", desc: "Muestra la escala de tus naves industriales y mantenimientos con claridad absoluta." },
                   { title: "Correos de Negocios", desc: "ventas@crauz.mx. Proyecta una imagen corporativa ganadora ante licitaciones." },
                   { title: "IA de Atención Obra", desc: "Recopilación de datos técnicos 24/7 sin intervención humana." }
                 ].map((feat, i) => (
                   <div key={i} className="flex gap-5 group">
                     <div className="h-6 w-6 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0 mt-1">
                       <CheckCircle2 className="h-3 w-3 text-yellow-500" />
                     </div>
                     <div>
                       <h4 className="text-white font-bold mb-1 group-hover:text-yellow-500 transition-colors">{feat.title}</h4>
                       <p className="text-sm text-northpeak-text-dim">{feat.desc}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </FadeIn>
            <FadeIn delay={0.3} className="lg:w-1/2 w-full flex justify-center">
               <div className="p-2 rounded-[3.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-2xl overflow-hidden group max-w-[450px]">
                  <div className="rounded-[3rem] bg-northpeak-bg overflow-hidden relative">
                    <div className="relative group-hover:scale-[1.02] transition-transform duration-700">
                      <img 
                        src="/crauz-mockup.png" 
                        alt="Mockup de la nueva presencia de Crauz Industrial" 
                        className="w-full h-auto opacity-95 group-hover:opacity-100 transition-all duration-700 block"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    </div>
                    <div className="absolute inset-x-0 bottom-6 text-center pointer-events-none z-20">
                      <p className="text-[10px] font-mono text-white/50 uppercase tracking-[0.3em] italic font-black">*Imagen con fines ilustrativos</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center p-10 rounded-[2.5rem] bg-black/60 backdrop-blur-xl border border-white/10 group-hover:opacity-0 transition-opacity duration-700">
                        <Construction className="h-14 w-14 text-yellow-500 mx-auto mb-6" />
                        <p className="font-mono text-sm uppercase tracking-[0.5em] font-black text-white">Tu Futura Presencia</p>
                      </div>
                    </div>
                  </div>
               </div>
            </FadeIn>
          </div>
        </section>

        {/* ── Interactive Modular Pricing: Crauz Industrial ── */}
        <section className="py-24 px-6 sm:px-12 bg-yellow-500/[0.01]">
          <div className="max-w-5xl mx-auto">
             <div className="p-8 sm:p-14 rounded-[3.5rem] bg-northpeak-card/20 border border-white/5 backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-yellow-500/5 blur-[100px] rounded-full -mr-20 -mt-20" />
                
                <FadeIn className="text-center mb-16 relative z-10">
                   <p className="font-mono text-[10px] tracking-[0.4em] text-yellow-500 uppercase mb-4 font-black">Plan de Inversión CRAUZ</p>
                   <h2 className="font-heading font-black text-4xl sm:text-6xl text-white mb-6">Modulariza tu Obra Digital</h2>
                   <p className="text-northpeak-text-muted text-lg max-w-2xl mx-auto italic underline decoration-white/10 decoration-dashed">
                     &quot;Elige las fases de crecimiento de Crauz Industrial.&quot;
                   </p>
                </FadeIn>

                <div className="space-y-4 mb-14 relative z-10 max-w-4xl mx-auto">
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

                <div className="relative z-10 flex flex-col items-center pt-8 border-t border-white/10">
                   <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 mb-10 w-full justify-between">
                      <div className="text-left">
                        <p className="text-xs font-mono uppercase tracking-widest text-northpeak-text-dim mb-1">Inversión Crauz</p>
                        <p className="text-3xl font-bold text-white/50 line-through decoration-yellow-500/50 decoration-2">${subtotal.toLocaleString()} MXN</p>
                      </div>
                      
                      <div className="text-center lg:text-right bg-yellow-500/5 px-8 py-5 rounded-3xl border border-yellow-500/20 scale-110 shadow-2xl shadow-black/50">
                        <div className="flex items-center gap-2 mb-1 justify-center lg:justify-end">
                           <Tag className="h-4 w-4 text-yellow-500" />
                           <span className="text-[10px] font-mono font-black text-yellow-500 uppercase tracking-widest">Bono de Alianza Industrial (10%)</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                           <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter">${totalWithDiscount.toLocaleString()}</span>
                           <span className="text-xl font-bold text-northpeak-text-dim">MXN</span>
                        </div>
                      </div>
                   </div>

                   <Link 
                     href={`https://wa.me/528121980008?text=Hola%20NorthPeak!%20Acepto%20la%20propuesta%20de%20CRAUZ%20con%20descuento%20(Modulos:%20${selectedServices.join(',%20')})`}
                     className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-14 py-7 rounded-[2rem] bg-yellow-500 text-black font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-yellow-500/30 active:scale-95"
                   >
                     <Rocket className="h-7 w-7" />
                     INICIAR PROYECTO
                   </Link>
                </div>
             </div>
          </div>
        </section>

        {/* ── Irresistible Offer: Crauz Industrial ── */}
        <section className="py-32 px-6 sm:px-12 relative overflow-hidden">
           <div className="max-w-4xl mx-auto text-center relative z-10">
              <FadeIn>
                <div className="mb-14 relative inline-block">
                  <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 animate-pulse rounded-full" />
                  <div className="relative px-6 py-3 rounded-2xl bg-[#0A0A0B] border border-yellow-400/40 text-yellow-400 font-mono text-[10px] font-black uppercase tracking-[0.5em]">
                    Socio Estratégico Exclusivo
                  </div>
                </div>
                
                <h2 className="font-heading font-black text-5xl sm:text-8xl text-white mb-10 tracking-tighter leading-none">
                  Construye tu <br /> 
                  <span className="italic text-yellow-500 underline decoration-white/10">Autoridad.</span>
                </h2>

                <div className="group p-12 sm:p-16 rounded-[4rem] bg-white text-black text-left relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_100px_rgba(255,255,255,0.05)]">
                   <div className="absolute top-0 right-0 p-8 sm:p-12">
                      <div className="flex flex-col items-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">Oferta expira en:</p>
                        <div className="flex gap-2">
                          {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((t, i) => (
                             <div key={i} className="bg-black text-white font-mono text-xl px-2 py-1 rounded-md shadow-lg">
                               {String(t).padStart(2, '0')}
                             </div>
                          ))}
                        </div>
                      </div>
                   </div>

                   <h3 className="text-3xl sm:text-4xl font-black mb-10 uppercase leading-none pr-32">Garantía Crauz:</h3>
                   
                   <div className="space-y-8 mb-12">
                      <div className="flex items-start gap-5">
                         <div className="h-10 w-10 shrink-0 rounded-full bg-yellow-500 flex items-center justify-center text-black">
                            <Tag className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-xl font-black uppercase leading-none mb-2">Bono de Alta Disponibilidad (-10%)</p>
                            <p className="text-lg text-black/70 leading-snug">Al iniciar en las primeras 24 horas, bloqueamos este precio preferencial para todas las actualizaciones de obra de 2026.</p>
                         </div>
                      </div>
                      
                      <div className="flex items-start gap-5">
                         <div className="h-10 w-10 shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-white">
                            <Shield className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-xl font-black uppercase leading-none mb-2">Compromiso Industrial</p>
                            <p className="text-lg text-black/70 leading-snug">Nuestra plataforma está diseñada para cumplir con los estándares visuales de las naves industriales más modernas del mundo.</p>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 rounded-3xl bg-black/5 border border-black/10">
                      <p className="text-xl font-bold italic leading-relaxed text-black/80">
                        &quot;Queremos que Crauz sea la primera constructora en la mente de tus prospectos cuando piensen en escala y profesionalismo.&quot;
                      </p>
                   </div>
                   
                   <p className="text-[10px] font-mono mt-8 uppercase tracking-widest text-black/40 font-bold">* Propuesta diseñada exclusivamente para Crauz Industrial.</p>
                </div>
              </FadeIn>
           </div>
        </section>

        {/* ── Footer ── */}
        <footer className="py-24 px-6 sm:px-12 bg-black border-t border-white/5 text-center">
           <img src="/logo.png" alt="NorthPeak" className="h-8 mx-auto mb-10 grayscale opacity-40" />
           <p className="text-[11px] font-mono uppercase tracking-[0.5em] text-northpeak-text-dim max-w-lg mx-auto mb-10 leading-loose">
             Ingeniería • Estrategia • Resultados
           </p>
           <div className="flex justify-center gap-10 text-[10px] font-black text-northpeak-text-dim uppercase tracking-widest">
              <span>Monterrey, NL</span>
              <span>© 2026 NorthPeak Digital</span>
           </div>
        </footer>
      </div>
    </div>
  );
}

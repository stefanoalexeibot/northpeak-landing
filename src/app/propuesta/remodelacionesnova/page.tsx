"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, Globe, TrendingUp, 
  Sparkles, Building2,
  PhoneCall, Rocket, Plus, Info, 
  BookOpen, Timer, Tag, AlertCircle,
  ArrowRight, MousePointer2, MessageSquare
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
  };
  isSelected: boolean;
  onToggle: () => void;
}

// --- Componentes Locales ---

const FeatureCard = ({ icon: Icon, title, why, forWhat, color }: FeatureCardProps) => (
  <div className="group p-8 rounded-[2.5rem] bg-northpeak-card/30 border border-northpeak-surface hover:border-northpeak-green/40 transition-all duration-500 backdrop-blur-sm relative overflow-hidden flex flex-col h-full">
    <div className={cn("absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity blur-3xl rounded-full -mr-12 -mt-12", color)} />
    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-8 border border-northpeak-surface shadow-inner", color.replace('bg-', 'text-').replace('-500', '/10'))}>
      <Icon className={cn("h-7 w-7", color.replace('bg-', 'text-'))} />
    </div>
    <h4 className="text-2xl font-bold text-white mb-5">{title}</h4>
    <div className="space-y-6 flex-1">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-northpeak-green mb-2">La Realidad:</p>
        <p className="text-sm text-northpeak-text-muted leading-relaxed italic">&quot;{why}&quot;</p>
      </div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400 mb-2">Nuestra Solución:</p>
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
        ? "bg-northpeak-green/10 border-northpeak-green/50 shadow-[0_0_30px_rgba(0,229,160,0.1)]" 
        : "bg-northpeak-card/20 border-white/5 hover:border-white/10"
    )}
  >
    <div className={cn(
      "mt-1.5 h-6 w-6 rounded-lg border flex items-center justify-center transition-all duration-500",
      isSelected ? "bg-northpeak-green border-northpeak-green scale-110" : "border-white/10"
    )}>
      {isSelected ? <CheckCircle2 className="h-4 w-4 text-northpeak-bg" /> : <Plus className="h-3 w-3 text-white/20" />}
    </div>
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h5 className={cn("font-bold text-base", isSelected ? "text-northpeak-green" : "text-white")}>
          {item.title}
        </h5>
        <span className="font-mono text-sm font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5">${item.price.toLocaleString()}</span>
      </div>
      <p className="text-sm text-northpeak-text-dim leading-relaxed">{item.desc}</p>
    </div>
  </div>
);

const GlossaryItem = ({ term, meaning }: { term: string; meaning: string }) => (
  <div className="p-6 rounded-3xl bg-northpeak-card/20 border border-white/5 hover:bg-white/[0.03] transition-colors">
    <h5 className="font-bold text-northpeak-green mb-2 flex items-center gap-2">
      <Info className="h-4 w-4" />
      {term}
    </h5>
    <p className="text-sm text-northpeak-text-muted leading-relaxed">{meaning}</p>
  </div>
);

export default function RemodelacionesNovaFinalProposal() {
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

  const services: Record<string, { id: string; title: string; price: number; desc: string }> = useMemo(() => ({
    infra: { id: "infra", title: "Cimentación Digital", price: 4500, desc: "Tu marca protegida en internet: Dominio (.com), correos profesionales con tu nombre y el lugar donde vivirá tu web." },
    web: { id: "web", title: "Exhibición Premium Moderno", price: 12500, desc: "Tu portafolio de lujo adaptado a celulares. Rápido, elegante y diseñado para que te contacten." },
    auto: { id: "auto", title: "Aviso Inmediato (Vendedor 24/7)", price: 5000, desc: "Sistema que te avisa por WhatsApp en segundos cuando alguien pide informes, para que no pierdas ventas." },
    seo: { id: "seo", title: "Presencia en Google Monterrey", price: 2500, desc: "Configuramos todo para que cuando la gente busque remodelaciones en NL, tú seas la primera opción." },
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
    <div className="relative min-h-screen bg-[#020305] text-[#A0A0B0] font-sans antialiased overflow-x-hidden selection:bg-northpeak-green selection:text-northpeak-bg">
      {/* ── Background Elements ── */}
      <AnimatedBackground />
      <DotGrid />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-northpeak-green/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* ── Nav ── */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020305]/60 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-6 sm:px-12">
            <div className="flex items-center gap-5">
              <img src="/logo.png" alt="NorthPeak" className="h-8" />
              <div className="hidden lg:block h-6 w-[1px] bg-white/10" />
              <span className="hidden lg:block font-mono text-[10px] uppercase tracking-[0.4em] text-northpeak-text-dim">
                Partner Estratégico Nova
              </span>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-8">
               <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-northpeak-green/10 border border-northpeak-green/20">
                 <Timer className="h-4 w-4 text-northpeak-green animate-pulse" />
                 <span className="font-mono text-xs font-bold text-northpeak-green">
                   {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                 </span>
               </div>
               <Link href="https://wa.me/528121980008" className="text-[11px] font-bold uppercase tracking-widest px-4 py-2 border border-northpeak-green/30 rounded-lg hover:bg-northpeak-green/5 transition-all text-northpeak-green">
                 Hablar con Estratega
               </Link>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="pt-28 pb-24 px-6 sm:px-12">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-northpeak-green/20 bg-northpeak-green/5 mb-10 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-northpeak-green" />
                <span className="text-[11px] font-mono font-black text-northpeak-green uppercase tracking-[0.3em]">Propuesta de Transformación Integral 2026</span>
              </div>
              <h1 className="font-heading font-black text-5xl sm:text-7xl lg:text-9xl leading-[0.9] tracking-tighter text-white mb-10">
                Tu talento en obras, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-northpeak-green via-blue-400 to-northpeak-green bg-300% animate-gradient italic">ahora en digital.</span>
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl text-northpeak-text-muted max-w-3xl leading-snug mb-16">
                No construimos simples páginas. Creamos la <span className="text-white font-bold underline decoration-northpeak-green">maquinaria de ventas</span> que 
                posicionará a Remodelaciones Nova como la empresa número 1 de Monterrey.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                {[
                  { icon: Building2, label: "Estatus", val: "Autoridad Regional" },
                  { icon: PhoneCall, label: "Velocidad", val: "Cierre en Tiempo Real" },
                  { icon: TrendingUp, label: "Escalabilidad", val: "Crecimiento Continuo" }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-5 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                    <div className="h-12 w-12 rounded-2xl bg-northpeak-green/10 flex items-center justify-center border border-northpeak-green/20">
                      <stat.icon className="h-6 w-6 text-northpeak-green" />
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
              <h2 className="font-heading font-black text-4xl sm:text-6xl text-white mb-6">¿Para qué sirve todo esto?</h2>
              <p className="text-northpeak-text-muted text-lg max-w-2xl lg:mx-0 mx-auto">Hablamos de resultados, no de tecnicismos. Así es como ayudamos a tu negocio a facturar más.</p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FadeIn delay={0.1}>
                <FeatureCard 
                  icon={Globe}
                  title="Tu Oficina Digital"
                  why="Muchas empresas se pierden en Instagram. Un cliente que va a invertir en su hogar quiere ver una empresa seria."
                  forWhat="Tendrás una página profesional que será tu oficina de atención 24/7, donde tus fotos de obras relucirán y darán confianza total."
                  color="bg-northpeak-green"
                />
              </FadeIn>
              <FadeIn delay={0.2}>
                <FeatureCard 
                  icon={Sparkles}
                  title="Especialistas en Lujo"
                  why="El mercado residencial premium en Monterrey exige acabados de alta gama como Lambrín, Decks y carpintería fina."
                  forWhat="Tu web resaltará estos detalles mediante galerías táctiles de alta definición, posicionándote como un artesano del lujo, no solo un constructor."
                  color="bg-blue-500"
                />
              </FadeIn>
              <FadeIn delay={0.3}>
                <FeatureCard 
                  icon={Building2}
                  title="Poder Industrial"
                  why="El sector industrial busca proveedores con capacidad de mantenimiento mayor, instalaciones HVAC y albañilería pesada."
                  forWhat="Diseñamos una sección técnica específica para empresas, detallando tu capacidad operativa en plomería, electricidad y aire acondicionado."
                  color="bg-yellow-500"
                />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── Glossary: Terms for Humans ── */}
        <section className="py-24 px-6 sm:px-12">
          <div className="max-w-6xl mx-auto">
            <FadeIn className="mb-16">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 text-northpeak-green mb-4">
                    <BookOpen className="h-6 w-6" />
                    <span className="font-mono text-sm uppercase tracking-widest font-bold">Diccionario NorthPeak</span>
                  </div>
                  <h2 className="font-heading font-black text-3xl sm:text-5xl text-white mb-4 italic">Glosario para Humanos</h2>
                  <p className="text-northpeak-text-muted text-lg">En el mundo digital sobran los términos difíciles. Aquí te explicamos qué significan realmente para Remodelaciones Nova.</p>
                </div>
                <div className="px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5">
                   <p className="text-xs font-medium italic">&quot;Hablamos el lenguaje de tu negocio, no solo de código.&quot;</p>
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FadeIn delay={0.1}>
                <GlossaryItem 
                  term="SEO" 
                  meaning="Lograr que cuando alguien busque 'Remodelaciones en Monterrey' tú aparezcas primero sin tener que pagar publicidad cada vez." 
                />
              </FadeIn>
              <FadeIn delay={0.2}>
                <GlossaryItem 
                  term="Responsivo" 
                  meaning="Que tu página se vea perfecta y rápida en cualquier iPhone o Android, ya que el 90% de tus clientes te verán desde ahí." 
                />
              </FadeIn>
              <FadeIn delay={0.3}>
                <GlossaryItem 
                  term="Hosting / Alojamiento" 
                  meaning="Es el 'terreno' donde construimos tu oficina digital. Nosotros nos encargamos de que nunca se caiga y siempre esté abierta." 
                />
              </FadeIn>
              <FadeIn delay={0.4}>
                <GlossaryItem 
                  term="Lead / Prospecto" 
                  meaning="Una persona real interesada que ya dejó su nombre y teléfono diciendo: 'Coticenme mi remodelación'." 
                />
              </FadeIn>
              <FadeIn delay={0.5}>
                <GlossaryItem 
                  term="Dominio" 
                  meaning="Tu dirección única en el mundo: remodelacionesnova.com. Es tu propiedad y nadie más puede tenerla." 
                />
              </FadeIn>
              <FadeIn delay={0.6}>
                <GlossaryItem 
                  term="Automatización" 
                  meaning="Tener empleados digitales que trabajan gratis enviándote avisos al WhatsApp cada vez que alguien quiere comprarte." 
                />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── Sales Funnel Strategy ── */}
        <section className="py-24 px-6 sm:px-12 bg-northpeak-green/5 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-20">
             <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-northpeak-green/20 blur-[100px] rounded-full" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <FadeIn className="text-center mb-20">
              <h2 className="font-heading font-black text-4xl sm:text-6xl text-white mb-6">Tu Maquinaria de Ventas</h2>
              <p className="text-northpeak-text-muted text-lg max-w-2xl mx-auto italic">
                &quot;No es solo una página, es un embudo diseñado para convertir desconocidos en clientes leales.&quot;
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {[
                { 
                  icon: Globe, 
                  step: "1. Tráfico Elevado", 
                  desc: "La gente te encuentra en Google o Instagram buscando 'Deck Monterrey' o 'Diseño de Interiores'.",
                  color: "text-blue-400"
                },
                { 
                  icon: MousePointer2, 
                  step: "2. Convencimiento", 
                  desc: "Llegan a tu nueva página premium. Ven tus mejores obras y el estatus de excelencia de Nova.",
                  color: "text-northpeak-green"
                },
                { 
                  icon: MessageSquare, 
                  step: "3. Contacto Directo", 
                  desc: "Con un solo clic, te escriben por WhatsApp. La IA los califica y te avisa al instante.",
                  color: "text-yellow-500"
                },
                { 
                  icon: Rocket, 
                  step: "4. Cierre de Obra", 
                  desc: "Tú cierras la venta. El sistema sigue trabajando para traerte el siguiente proyecto.",
                  color: "text-red-500"
                }
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.1} className="relative group">
                  <div className="p-10 rounded-[3rem] bg-northpeak-bg border border-white/5 hover:border-northpeak-green/20 transition-all duration-500 text-center flex flex-col items-center h-full">
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

        {/* ── Infrastructure & Domain ── */}
        <section className="py-24 px-6 sm:px-12 bg-white/[0.01]">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <FadeIn className="lg:w-1/2">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-northpeak-green/20 bg-northpeak-green/5 text-northpeak-green text-[10px] font-mono tracking-widest mb-6">
                 INFRAESTRUCTURA PREMIUM
               </div>
               <h2 className="font-heading font-black text-4xl sm:text-6xl text-white mb-8 leading-tight tracking-tighter">
                 Tu nueva propiedad <br /> en el mundo digital.
               </h2>
               <div className="space-y-6">
                 {[
                   { title: "Dominio Propio", desc: "remodelacionesnova.com será tuyo. Da una imagen de empresa sólida y establecida." },
                   { title: "Correos Corporativos", desc: "vendedores@remodelacionesnova.com. Deja de usar @gmail para cerrar contratos de lujo." },
                   { title: "Hosting de Alta Velocidad", desc: "Tu página cargará en milisegundos. Un cliente de lujo no espera." }
                 ].map((feat, i) => (
                   <div key={i} className="flex gap-5 group">
                     <div className="h-6 w-6 rounded-full bg-northpeak-green/20 border border-northpeak-green/30 flex items-center justify-center shrink-0 mt-1">
                       <CheckCircle2 className="h-3 w-3 text-northpeak-green" />
                     </div>
                     <div>
                       <h4 className="text-white font-bold mb-1 group-hover:text-northpeak-green transition-colors">{feat.title}</h4>
                       <p className="text-sm text-northpeak-text-dim">{feat.desc}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </FadeIn>
            <FadeIn delay={0.3} className="lg:w-1/2 w-full">
               <div className="p-3 rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-2xl overflow-hidden group">
                  <div className="aspect-video rounded-[2.5rem] bg-northpeak-bg overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500/50" />
                      <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                      <div className="h-2 w-2 rounded-full bg-green-500/50" />
                      <div className="ml-2 h-4 w-32 bg-white/10 rounded-full" />
                    </div>
                    <div className="flex items-center justify-center h-full p-20 opacity-30 blur-[2px] group-hover:opacity-100 group-hover:blur-0 transition-all duration-700">
                      <div className="text-center">
                        <Building2 className="h-16 w-16 text-northpeak-green mx-auto mb-6" />
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] font-black">Tu Página de Ejemplo</p>
                      </div>
                    </div>
                  </div>
               </div>
            </FadeIn>
          </div>
        </section>

        {/* ── Interactive Modular Pricing ── */}
        <section className="py-24 px-6 sm:px-12 bg-northpeak-green/[0.01]">
          <div className="max-w-5xl mx-auto">
             <div className="p-8 sm:p-14 rounded-[3.5rem] bg-northpeak-card/20 border border-white/5 backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-northpeak-green/5 blur-[100px] rounded-full -mr-20 -mt-20" />
                
                <FadeIn className="text-center mb-16 relative z-10">
                   <p className="font-mono text-[10px] tracking-[0.4em] text-northpeak-green uppercase mb-4 font-black">Plan de Inversión</p>
                   <h2 className="font-heading font-black text-4xl sm:text-6xl text-white mb-6">Arma tu Propuesta</h2>
                   <p className="text-northpeak-text-muted text-lg max-w-2xl mx-auto italic underline decoration-white/10 decoration-dashed">
                     &quot;Puedes empezar con la Fase Web y escalar lo demás después, tú tienes el control.&quot;
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
                        <p className="text-xs font-mono uppercase tracking-widest text-northpeak-text-dim mb-1">Subtotal de Inversión</p>
                        <p className="text-3xl font-bold text-white/50 line-through decoration-northpeak-green/50 decoration-2">${subtotal.toLocaleString()} MXN</p>
                      </div>
                      
                      <div className="text-center lg:text-right bg-northpeak-green/5 px-8 py-5 rounded-3xl border border-northpeak-green/20 scale-110 shadow-2xl shadow-black/50">
                        <div className="flex items-center gap-2 mb-1 justify-center lg:justify-end">
                           <Tag className="h-4 w-4 text-northpeak-green" />
                           <span className="text-[10px] font-mono font-black text-northpeak-green uppercase tracking-widest">Ahorro del 10% Aplicado</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                           <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter">${totalWithDiscount.toLocaleString()}</span>
                           <span className="text-xl font-bold text-northpeak-text-dim">MXN</span>
                        </div>
                      </div>
                   </div>

                   <Link 
                     href={`https://wa.me/528121980008?text=Hola%20NorthPeak!%20Acepto%20la%20propuesta%20de%20Nova%20con%20descuento%20(Modulos:%20${selectedServices.join(',%20')})`}
                     className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-14 py-7 rounded-[2rem] bg-northpeak-green text-northpeak-bg font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-northpeak-green/30 active:scale-95"
                   >
                     <Rocket className="h-7 w-7" />
                     INICIAR AHORA
                   </Link>
                </div>
             </div>
          </div>
        </section>

        {/* ── Irresistible Offer: The Closing ── */}
        <section className="py-32 px-6 sm:px-12 relative overflow-hidden">
           <div className="max-w-4xl mx-auto text-center relative z-10">
              <FadeIn>
                <div className="mb-14 relative inline-block">
                  <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 animate-pulse rounded-full" />
                  <div className="relative px-6 py-3 rounded-2xl bg-[#020305] border border-yellow-500/40 text-yellow-500 font-mono text-[10px] font-black uppercase tracking-[0.5em]">
                    Oportunidad de Lanzamiento
                  </div>
                </div>
                
                <h2 className="font-heading font-black text-5xl sm:text-8xl text-white mb-10 tracking-tighter leading-none">
                  La Oferta <br /> 
                  <span className="italic text-northpeak-green underline decoration-yellow-500/30">Irrechazable.</span>
                </h2>

                <div className="group p-12 sm:p-16 rounded-[4rem] bg-white text-black text-left relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_100px_rgba(255,255,255,0.05)]">
                   <div className="absolute top-0 right-0 p-8 sm:p-12">
                      <div className="flex flex-col items-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">Cierra en:</p>
                        <div className="flex gap-2">
                          {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((t, i) => (
                             <div key={i} className="bg-black text-white font-mono text-xl px-2 py-1 rounded-md shadow-lg">
                               {String(t).padStart(2, '0')}
                             </div>
                          ))}
                        </div>
                      </div>
                   </div>

                   <h3 className="text-3xl sm:text-4xl font-black mb-10 uppercase leading-none pr-32">Garantía de Crecimiento:</h3>
                   
                   <div className="space-y-8 mb-12">
                      <div className="flex items-start gap-5">
                         <div className="h-10 w-10 shrink-0 rounded-full bg-northpeak-green flex items-center justify-center text-white">
                            <Tag className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-xl font-black uppercase leading-none mb-2">Bono de Decisión Rápida (-10%)</p>
                            <p className="text-lg text-black/70 leading-snug">Si liquidas el anticipo del 50% en las próximas 24h, mantenemos el descuento especial aplicado hoy.</p>
                         </div>
                      </div>
                      
                      <div className="flex items-start gap-5">
                         <div className="h-10 w-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white">
                            <AlertCircle className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-xl font-black uppercase leading-none mb-2">Garantía de Satisfacción NorthPeak</p>
                            <p className="text-lg text-black/70 leading-snug">Si no estás conforme con el diseño inicial tras la primera semana de construcción, pausamos todo sin penalización.</p>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 rounded-3xl bg-black/5 border border-black/10">
                      <p className="text-xl font-bold italic leading-relaxed text-black/80">
                        &quot;Queremos ser el acelerador que lleve tus remodelaciones a otro nivel de rentabilidad.&quot;
                      </p>
                   </div>
                   
                   <p className="text-[10px] font-mono mt-8 uppercase tracking-widest text-black/40 font-bold">* Oferta válida exclusivamente para el equipo de Remodelaciones Nova.</p>
                </div>
              </FadeIn>
           </div>
        </section>

        {/* ── Footer ── */}
        <footer className="py-24 px-6 sm:px-12 bg-black border-t border-white/5 text-center">
           <img src="/logo.png" alt="NorthPeak" className="h-8 mx-auto mb-10 grayscale opacity-40" />
           <p className="text-[11px] font-mono uppercase tracking-[0.5em] text-northpeak-text-dim max-w-lg mx-auto mb-10 leading-loose">
             Estrategia • Innovación • Crecimiento
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

import Link from "next/link";
import { 
  ArrowRight, Zap, CheckCircle2, Clock, 
  MapPin, PenTool, Layout, Database, 
  Settings2, Smartphone, Globe, Mail 
} from "lucide-react";
import AnimatedBackground from "@/components/portal/animated-background";
import DotGrid from "@/components/portal/dot-grid";
import FadeIn from "@/components/landing/fade-in";

export default function RemodelacionesNovaProposal() {
  return (
    <div className="relative min-h-screen bg-northpeak-bg text-northpeak-text font-sans antialiased overflow-x-hidden">
      {/* ── Global effects ── */}
      <AnimatedBackground />
      <DotGrid />

      <div className="relative z-10">
        {/* ── Navbar ── */}
        <header className="sticky top-0 z-40 border-b border-northpeak-surface bg-northpeak-bg/80 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-5 sm:px-8">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="NorthPeak" className="h-6" />
              <div className="h-4 w-[1px] bg-northpeak-surface mx-2 hidden sm:block" />
              <span className="font-mono text-[10px] tracking-widest text-northpeak-text-muted uppercase hidden sm:block">Propuesta Digital</span>
            </div>
            
            <Link 
              href="https://northpeak.mx"
              className="text-[10px] font-mono uppercase tracking-wider text-northpeak-text-muted hover:text-northpeak-green transition-colors"
            >
              volver a northpeak.mx
            </Link>
          </div>
        </header>

        {/* ── Hero Section ── */}
        <section className="relative pt-20 pb-16 px-5 sm:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-northpeak-green/30 bg-northpeak-green/5 mb-6">
                <Zap className="h-3 w-3 text-northpeak-green" />
                <span className="text-[10px] font-mono font-bold text-northpeak-green uppercase tracking-wider">Transformación Digital 2026</span>
              </div>
              <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-northpeak-text leading-tight tracking-tight mb-6">
                Ecosistema de Ventas para <br />
                <span className="text-northpeak-green">Remodelaciones Nova</span>
              </h1>
              <p className="text-lg text-northpeak-text-muted max-w-2xl mx-auto mb-10">
                Propuesta estratégica para automatizar la captación de proyectos premium y 
                consolidar la autoridad digital de Nova en el mercado de Monterrey.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-northpeak-card/50 border border-northpeak-surface backdrop-blur-sm">
                  <MapPin className="h-4 w-4 text-northpeak-green" />
                  <span className="text-sm font-medium">Monterrey, N.L.</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-northpeak-card/50 border border-northpeak-surface backdrop-blur-sm">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">3 Semanas de Ejecución</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── Content Grid ── */}
        <section className="py-12 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Scope & Values */}
            <div className="lg:col-span-2 space-y-8">
              <FadeIn delay={0.1}>
                <div className="p-8 rounded-3xl bg-northpeak-card/40 border border-northpeak-surface backdrop-blur-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 bg-northpeak-green/5 blur-3xl rounded-full -mr-12 -mt-12" />
                  <h3 className="font-heading font-bold text-2xl text-northpeak-text mb-6 flex items-center gap-3">
                    <Layout className="h-6 w-6 text-northpeak-green" />
                    Infraestructura Digital de Alta Gama
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-northpeak-bg/50 border border-northpeak-surface">
                        <Globe className="h-5 w-5 text-northpeak-green mb-2" />
                        <h4 className="font-bold text-sm text-northpeak-text mb-1">Dominio Pro</h4>
                        <p className="text-xs text-northpeak-text-muted leading-relaxed">Adquisición y hosting de <strong>remodelacionesnova.com</strong> por 1 año.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-northpeak-bg/50 border border-northpeak-surface">
                        <Mail className="h-5 w-5 text-blue-400 mb-2" />
                        <h4 className="font-bold text-sm text-northpeak-text mb-1">Correo Corporativo</h4>
                        <p className="text-xs text-northpeak-text-muted leading-relaxed">Configuración de Google Workspace (ej. proyectos@remodelacionesnova.com).</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-northpeak-bg/50 border border-northpeak-surface">
                        <PenTool className="h-5 w-5 text-yellow-400 mb-2" />
                        <h4 className="font-bold text-sm text-northpeak-text mb-1">Diseño Premium</h4>
                        <p className="text-xs text-northpeak-text-muted leading-relaxed">Web responsiva con galería interactiva y enfoque en conversión (leads).</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-northpeak-bg/50 border border-northpeak-surface">
                        <Settings2 className="h-5 w-5 text-purple-400 mb-2" />
                        <h4 className="font-bold text-sm text-northpeak-text mb-1">SEO Local</h4>
                        <p className="text-xs text-northpeak-text-muted leading-relaxed">Optimización específica para Monterrey para captar clientes locales.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="p-8 rounded-3xl bg-northpeak-card/40 border border-northpeak-surface backdrop-blur-md">
                  <h3 className="font-heading font-bold text-2xl text-northpeak-text mb-6 flex items-center gap-3">
                    <Database className="h-6 w-6 text-northpeak-green" />
                    Motor de Ventas Automatizado
                  </h3>
                  <p className="text-northpeak-text-muted mb-8 leading-relaxed">
                    Integramos su sitio web directamente con su canal de ventas favorito. 
                    El objetivo es reducir el tiempo de respuesta a cero.
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      { title: "Captación Inteligente", desc: "Formularios que califican al lead según su presupuesto y tipo de proyecto." },
                      { title: "Notificación Instantánea", desc: "Alerta en tiempo real vía WhatsApp para que su equipo cierre la venta en caliente." },
                      { title: "Registro Automático", desc: "Base de datos de prospectos para seguimiento semanal sin errores manuales." }
                    ].map((item, id) => (
                      <div key={id} className="flex items-start gap-4 p-4 rounded-2xl bg-northpeak-bg/30 border border-northpeak-surface/50">
                        <CheckCircle2 className="h-4 w-4 text-northpeak-green mt-1 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-northpeak-text">{item.title}</p>
                          <p className="text-xs text-northpeak-text-muted">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right Column: Pricing & CTA */}
            <div className="space-y-8">
              <FadeIn delay={0.3}>
                <div className="p-8 rounded-3xl bg-northpeak-green text-northpeak-bg shadow-[0_20px_50px_rgba(0,229,160,0.3)] relative overflow-hidden">
                  <Zap className="absolute -bottom-6 -right-6 h-32 w-32 text-northpeak-bg opacity-10 rotate-12" />
                  
                  <h3 className="font-heading font-bold text-xl mb-2">Inversión Total</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold">$24,500</span>
                    <span className="text-sm font-bold opacity-80">MXN</span>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                      "Hosting & Dominio Incluido",
                      "Correo Profesional Google",
                      "Web Alta Velocidad (Next.js)",
                      "Automatización n8n",
                      "Soporte 30 días"
                    ].map((item, id) => (
                      <div key={id} className="flex items-center gap-2 text-xs font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <Link 
                    href="https://wa.me/8124262186"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-northpeak-bg text-northpeak-green font-extrabold text-sm hover:scale-[1.02] transition-transform shadow-xl"
                  >
                    Aceptar Propuesta
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="p-6 rounded-3xl bg-northpeak-card/20 border border-dashed border-northpeak-surface text-center">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-northpeak-text-dim mb-2 text-center">Próximos Pasos</p>
                  <ol className="text-left space-y-3">
                    <li className="text-[11px] text-northpeak-text-muted"><span className="text-northpeak-green font-bold">1.</span> Pago del 50% de anticipo.</li>
                    <li className="text-[11px] text-northpeak-text-muted"><span className="text-northpeak-green font-bold">2.</span> Registro de marca y correos.</li>
                    <li className="text-[11px] text-northpeak-text-muted"><span className="text-northpeak-green font-bold">3.</span> Lanzamiento en 18 días hábiles.</li>
                  </ol>
                </div>
              </FadeIn>
            </div>

          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="py-12 px-5 sm:px-8 border-t border-northpeak-surface">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 grayscale">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="NorthPeak" className="h-5" />
              <img src="https://www.instagram.com/static/images/ico/favicon-192.png/ed9763c19594.png" alt="IG" className="h-5 rounded-full" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest">Creado por NorthPeak Digital — 2026</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

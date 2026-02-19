"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  TrendingUp,
  Users,
  Target,
  Clock,
  MessageCircle,
  Zap,
  AlertCircle,
  ThumbsUp,
  DollarSign,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

interface AnalisisMeta {
  etapa: string;
  created_at: string;
  etapa_updated_at?: string;
}

interface Metrics {
  total: number;
  activos: number;
  ganados: number;
  perdidos: number;
  tasaCierre: number;
  promedioDias: number;
  bottleneck: string;
}

// ─── Section accordion ────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  iconColor = "text-northpeak-green",
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: typeof TrendingUp;
  iconColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-northpeak-surface rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-4 bg-northpeak-card hover:bg-northpeak-surface/20 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
          <span className="text-sm font-semibold text-northpeak-text">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-northpeak-text-dim" />
        ) : (
          <ChevronDown className="h-4 w-4 text-northpeak-text-dim" />
        )}
      </button>
      {open && (
        <div className="bg-northpeak-bg px-5 py-4 border-t border-northpeak-surface space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Objection card ────────────────────────────────────────────────────────

function Objection({ obj, resp }: { obj: string; resp: string }) {
  return (
    <div className="rounded-lg border border-northpeak-surface overflow-hidden">
      <div className="bg-red-500/5 px-4 py-2.5 border-b border-northpeak-surface">
        <p className="text-sm text-red-300 font-medium">❝ {obj} ❞</p>
      </div>
      <div className="bg-northpeak-card px-4 py-3">
        <p className="text-sm text-northpeak-text-muted leading-relaxed">{resp}</p>
      </div>
    </div>
  );
}

// ─── Script card (copyable) ────────────────────────────────────────────────

function Script({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-northpeak-surface overflow-hidden">
      <div className="flex items-center justify-between bg-northpeak-card px-4 py-2 border-b border-northpeak-surface">
        <p className="text-xs font-medium text-northpeak-green">{label}</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1 text-xs text-northpeak-text-muted hover:text-northpeak-text transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-northpeak-green" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <div className="px-4 py-3 bg-northpeak-bg">
        <p className="text-sm text-northpeak-text-muted leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

// ─── Conversation step ─────────────────────────────────────────────────────

function ConvStep({
  speaker,
  text,
  note,
}: {
  speaker: "vendedor" | "cliente";
  text: string;
  note?: string;
}) {
  return (
    <div className={cn("flex gap-3", speaker === "vendedor" ? "flex-row" : "flex-row-reverse")}>
      <div
        className={cn(
          "h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5",
          speaker === "vendedor"
            ? "bg-northpeak-green text-northpeak-bg"
            : "bg-northpeak-surface text-northpeak-text"
        )}
      >
        {speaker === "vendedor" ? "NP" : "C"}
      </div>
      <div className={cn("max-w-[85%]", speaker === "cliente" && "text-right")}>
        <div
          className={cn(
            "inline-block px-3 py-2 rounded-xl text-sm leading-relaxed",
            speaker === "vendedor"
              ? "bg-northpeak-green/10 text-northpeak-text border border-northpeak-green/20"
              : "bg-northpeak-surface text-northpeak-text-muted"
          )}
        >
          {text}
        </div>
        {note && (
          <p className="text-[10px] text-northpeak-text-dim mt-1 italic">{note}</p>
        )}
      </div>
    </div>
  );
}

function StepLabel({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-6 w-6 rounded-full bg-northpeak-green/10 border border-northpeak-green/30 flex items-center justify-center text-xs font-bold text-northpeak-green shrink-0">
        {n}
      </div>
      <p className="text-sm font-medium text-northpeak-text">{text}</p>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function VentasPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analisis")
      .then((r) => r.ok ? r.json() : [])
      .then((data: AnalisisMeta[]) => {
        const total = data.length;
        const ganados = data.filter((d) => d.etapa === "cerrado_ganado").length;
        const perdidos = data.filter((d) => d.etapa === "cerrado_perdido").length;
        const activos = total - ganados - perdidos;
        const tasaCierre = total > 0 ? Math.round((ganados / total) * 100) : 0;

        // Average days to close for won deals
        const closedData = data.filter(
          (d) => d.etapa === "cerrado_ganado" && d.etapa_updated_at
        );
        const promedioDias =
          closedData.length > 0
            ? Math.round(
                closedData.reduce((sum, d) => {
                  return (
                    sum +
                    (new Date(d.etapa_updated_at!).getTime() -
                      new Date(d.created_at).getTime()) /
                      86400000
                  );
                }, 0) / closedData.length
              )
            : 0;

        // Find the stage with most active prospects (bottleneck)
        const stages = ["nuevo", "cuestionario_enviado", "cuestionario_completado", "en_negociacion"];
        const counts = stages.map((s) => ({
          s,
          n: data.filter((d) => d.etapa === s).length,
        }));
        const bottleneckStage = counts.reduce((a, b) => (b.n > a.n ? b : a), counts[0]);
        const bottleneckLabels: Record<string, string> = {
          nuevo: "Nuevos sin contactar",
          cuestionario_enviado: "Cuestionario enviado",
          cuestionario_completado: "Propuesta pendiente",
          en_negociacion: "En negociación",
        };

        setMetrics({
          total,
          activos,
          ganados,
          perdidos,
          tasaCierre,
          promedioDias,
          bottleneck: bottleneckLabels[bottleneckStage?.s] || "—",
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-northpeak-text">Guía de Ventas</h1>
        <p className="text-sm text-northpeak-text-muted mt-1">
          Playbook, scripts, objeciones y métricas del proceso de venta
        </p>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Prospectos activos", value: metrics.activos, icon: Users, color: "text-blue-400" },
            { label: "Tasa de cierre", value: `${metrics.tasaCierre}%`, icon: Target, color: "text-northpeak-green" },
            { label: "Días prom. de cierre", value: metrics.promedioDias > 0 ? `${metrics.promedioDias}d` : "—", icon: Clock, color: "text-yellow-400" },
            { label: "Embudo atascado en", value: metrics.bottleneck, icon: AlertCircle, color: "text-orange-400", small: true },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-northpeak-card border border-northpeak-surface rounded-xl p-4 space-y-1"
            >
              <m.icon className={cn("h-4 w-4", m.color)} />
              <p className={cn("font-heading font-bold text-northpeak-text", m.small ? "text-sm" : "text-2xl")}>
                {m.value}
              </p>
              <p className="text-xs text-northpeak-text-muted">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── PROCESO ── */}
      <Section title="Proceso de venta — 5 pasos" icon={TrendingUp} defaultOpen>
        <div className="space-y-3">
          <StepLabel n={1} text="Primer contacto — máximo 2 horas después del diagnóstico" />
          <p className="text-xs text-northpeak-text-muted ml-9 leading-relaxed">
            Cuando un prospecto llena el autodiagnóstico o tú lo analizas, el primer mensaje debe
            salir ese mismo día. Cada hora que pasa reduce la probabilidad de respuesta.
          </p>

          <StepLabel n={2} text="Reunión de diagnóstico (15–20 min)" />
          <p className="text-xs text-northpeak-text-muted ml-9 leading-relaxed">
            No vendas todavía. Comparte pantalla con el reporte, muestra el problema en datos. Haz
            dos preguntas clave: <span className="text-northpeak-text">¿Cuánto gana ahora?</span> y{" "}
            <span className="text-northpeak-text">¿Cuánto le gustaría ganar?</span> La diferencia es
            tu argumento de venta.
          </p>

          <StepLabel n={3} text="Propuesta — ese mismo día de la reunión" />
          <p className="text-xs text-northpeak-text-muted ml-9 leading-relaxed">
            No esperes días para mandar la propuesta. Si la mandas ese día, el interés está fresco.
            Siempre ofrece 3 opciones (básico, crecimiento, premium). El cliente casi siempre elige
            la del medio.
          </p>

          <StepLabel n={4} text="Seguimiento — 48 horas si no hay respuesta" />
          <p className="text-xs text-northpeak-text-muted ml-9 leading-relaxed">
            Un solo mensaje amable. No preguntes "¿lo revisó?", pregunta "¿tiene alguna duda?".
            Si no responde en otros 2 días, un tercer mensaje y luego esperar.
          </p>

          <StepLabel n={5} text="Cierre — negocia, no te rajes" />
          <p className="text-xs text-northpeak-text-muted ml-9 leading-relaxed">
            Si piden precio más bajo, ofrece un paquete de entrada más pequeño, no descuento.
            Protege el valor de tu trabajo. El cliente que negocia duro al inicio suele ser el
            mejor cliente a largo plazo porque es exigente.
          </p>
        </div>
      </Section>

      {/* ── SITUACIÓN: INTERNET ── */}
      <Section title="Situación 1 — Cliente que te encuentra por internet" icon={Zap} iconColor="text-blue-400">
        <p className="text-xs text-northpeak-text-muted leading-relaxed">
          Llegó por un Reel, un post, un anuncio o el link del autodiagnóstico. Ya tiene cierto
          interés. Tu trabajo es confirmarlo rápido y no perder el momentum.
        </p>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-northpeak-text-muted uppercase tracking-wider">Primer mensaje (WA, mismo día)</p>
          <ConvStep
            speaker="vendedor"
            text="Hola Fernanda, vi que hiciste el diagnóstico de Lumi Beauty. Tu score fue de 38/100. Hay varias cosas que podemos mejorar rápido. ¿Tienes 15 minutos esta semana para que te explique qué está pasando?"
            note="Siempre menciona el score. Le hace ver que ya tienes información concreta de su negocio."
          />
          <ConvStep speaker="cliente" text="Sí claro, ¿cuándo?" />
          <ConvStep
            speaker="vendedor"
            text="¿Te funciona el jueves a las 11am por videollamada o prefieres en persona?"
            note="Siempre da 2 opciones, nunca preguntes abierto '¿cuándo puedes?'"
          />
        </div>
        <div className="space-y-2 mt-2">
          <p className="text-xs font-semibold text-northpeak-text-muted uppercase tracking-wider">Reunión — la pregunta clave</p>
          <ConvStep
            speaker="vendedor"
            text="¿Cuánto estima que gana en un mes actualmente?"
          />
          <ConvStep speaker="cliente" text="Entre 45 y 55 mil pesos." />
          <ConvStep speaker="vendedor" text="¿Y cuánto le gustaría ganar?" />
          <ConvStep speaker="cliente" text="Con 80 estaría muy bien." />
          <ConvStep
            speaker="vendedor"
            text="Perfecto. Esos 25–30 mil de diferencia van a venir de clientes nuevos. Y los clientes nuevos hoy te encuentran en Google e Instagram. Eso es exactamente lo que no está funcionando todavía. ¿Le mando la propuesta hoy?"
            note="Conecta directamente la diferencia de ingresos con tu servicio. Pausa después de la pregunta."
          />
        </div>
      </Section>

      {/* ── SITUACIÓN: EN FRÍO ── */}
      <Section title="Situación 2 — Venta en frío (visitas a negocios)" icon={Lightbulb} iconColor="text-yellow-400">
        <p className="text-xs text-northpeak-text-muted leading-relaxed">
          Pasas por un negocio, ves que tiene baja presencia digital. Buscas en Google y no aparece
          o tiene pocas reseñas. Entras a presentarte.
        </p>
        <div className="space-y-1 mb-3">
          <p className="text-xs font-semibold text-northpeak-text-muted uppercase tracking-wider">Antes de entrar — prepara en 30 segundos</p>
          <ul className="text-xs text-northpeak-text-muted space-y-1 ml-3">
            <li>• Busca el negocio en Google Maps — ¿cuántas reseñas tiene? ¿aparece en búsquedas?</li>
            <li>• Busca su Instagram — ¿existe? ¿cuántos seguidores? ¿publican seguido?</li>
            <li>• Anota mentalmente 1 o 2 problemas concretos que vas a mencionar</li>
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-northpeak-text-muted uppercase tracking-wider">Entrada al negocio</p>
          <ConvStep
            speaker="vendedor"
            text="Don Rodrigo, buen provecho. Vengo a mostrarle algo que creo que le va a interesar. No le voy a tomar más de 5 minutos. ¿Me permite?"
            note="Pide permiso antes de vender. Nunca empieces diciendo 'vengo a ofrecerle...'"
          />
          <ConvStep speaker="cliente" text="¿De qué es?" />
          <ConvStep
            speaker="vendedor"
            text="Le voy a mostrar cómo aparece su negocio cuando alguien busca tacos en la zona. Con esto en mano."
            note="Saca el teléfono, busca frente a él. Ver que no aparece es más poderoso que cualquier argumento."
          />
          <ConvStep speaker="cliente" text="Pues sí, nunca me había fijado..." />
          <ConvStep
            speaker="vendedor"
            text="¿Me permite hacerle un análisis rápido? Es gratis y le lleva 3 minutos. Le digo exactamente cuáles son las áreas de mejora."
          />
        </div>
        <div className="bg-northpeak-card border border-northpeak-surface rounded-lg p-3 mt-2">
          <p className="text-xs font-medium text-northpeak-text mb-1">Si dice no o está ocupado:</p>
          <p className="text-xs text-northpeak-text-muted leading-relaxed">
            "Entiendo perfectamente. ¿Me puedo dejar su número para mandarle el análisis por
            WhatsApp? Lo hace en 3 minutos cuando tenga tiempo." — Nunca te vayas sin un contacto.
          </p>
        </div>
        <div className="space-y-2 mt-2">
          <p className="text-xs font-semibold text-northpeak-text-muted uppercase tracking-wider">Cierre del primer contacto (no vendas ese día)</p>
          <ConvStep
            speaker="vendedor"
            text="Lo que haríamos tiene tres partes. Pero no le voy a cerrar nada hoy. Lo que sí le voy a pedir es 20 minutos el próximo miércoles para mostrarle el plan completo. ¿Le late?"
            note="El objetivo del primer contacto en frío es conseguir la reunión formal, no cerrar."
          />
        </div>
      </Section>

      {/* ── SITUACIÓN: REFERIDO ── */}
      <Section title="Situación 3 — Cliente referido por otro cliente" icon={ThumbsUp} iconColor="text-northpeak-green">
        <p className="text-xs text-northpeak-text-muted leading-relaxed">
          Alguien que ya te contrató lo recomendó. La confianza ya está construida parcialmente —
          es tu situación más fácil de cerrar. No la desperdicies.
        </p>
        <div className="space-y-2">
          <ConvStep
            speaker="vendedor"
            text="Hola Marco, me pasó tu contacto Luis de Café del Centro. Me comentó que llevas tiempo queriendo mejorar tu presencia digital. ¿Tienes 15 minutos esta semana?"
            note="Menciona el nombre del referidor en el primer mensaje. Eso abre la puerta."
          />
          <ConvStep speaker="cliente" text="Sí, Luis me habló muy bien de ustedes." />
          <ConvStep
            speaker="vendedor"
            text="Perfecto. Antes de la llamada te mando el análisis de tu negocio para que veas en qué estamos. ¿Cómo se llama tu restaurante?"
            note="Haz el análisis ANTES de la reunión. Llegas a la llamada con datos de su negocio. Eso impresiona."
          />
        </div>
        <div className="bg-northpeak-green/5 border border-northpeak-green/20 rounded-lg p-3">
          <p className="text-xs text-northpeak-green font-medium mb-1">Clave del referido</p>
          <p className="text-xs text-northpeak-text-muted">
            Pregúntale a tu cliente actual qué fue lo que más le gustó del servicio.
            Eso es lo que vas a resaltar con el referido: "Luis me dijo que lo que más valora
            es que siempre sabe qué se está haciendo en su cuenta. Eso es lo que hacemos."
          </p>
        </div>
      </Section>

      {/* ── SITUACIÓN: LO PIENSO ── */}
      <Section title='Situación 4 — "Lo pienso / necesito tiempo"' icon={Clock} iconColor="text-purple-400">
        <p className="text-xs text-northpeak-text-muted leading-relaxed">
          El cliente mostró interés pero no cierra. Normalmente significa que tiene una duda no
          expresada o que no tiene completamente claro el valor. No presiones — haz seguimiento
          estratégico.
        </p>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-northpeak-text mb-2">Día 1 — Después de que dice "lo pienso"</p>
            <ConvStep
              speaker="vendedor"
              text="Perfecto, tómate el tiempo que necesites. Solo una pregunta rápida: ¿hay alguna duda específica que te esté generando la decisión? A veces puedo aclarar algo que ayuda."
              note="Invita a expresar la duda real. Casi siempre hay una razón específica detrás del 'lo pienso'."
            />
          </div>
          <div>
            <p className="text-xs font-medium text-northpeak-text mb-2">Día 3 — Sin respuesta</p>
            <ConvStep
              speaker="vendedor"
              text="Hola [nombre], solo para no perderte de vista. ¿Sigues evaluando la propuesta o ya tomaste una decisión? Sin presión, solo quiero saber si hay algo más que pueda hacer para ayudarte."
            />
          </div>
          <div>
            <p className="text-xs font-medium text-northpeak-text mb-2">Día 7 — Último intento</p>
            <ConvStep
              speaker="vendedor"
              text="Hola [nombre], este es mi último mensaje para no molestarte. Si en algún momento decides avanzar con la presencia digital de [negocio], aquí estoy. Que te vaya muy bien."
              note="El 'último mensaje' a veces desbloquea al cliente. La urgencia psicológica de 'se van a ir' funciona."
            />
          </div>
        </div>
      </Section>

      {/* ── SITUACIÓN: MALA EXPERIENCIA PREVIA ── */}
      <Section title="Situación 5 — Cliente quemado con agencia anterior" icon={AlertCircle} iconColor="text-orange-400">
        <p className="text-xs text-northpeak-text-muted leading-relaxed">
          El cliente contrató a alguien antes y no vio resultados o lo trataron mal. Tiene
          desconfianza. Tu trabajo es diferenciarte con transparencia, no atacando a la competencia.
        </p>
        <div className="space-y-2">
          <ConvStep speaker="cliente" text="Ya lo intenté con otra agencia y no funcionó. Perdí dinero." />
          <ConvStep
            speaker="vendedor"
            text="Entiendo perfectamente, y tiene razón en ser escéptico. ¿Me puede contar qué pasó? ¿Qué prometieron y qué entregaron?"
            note="Escucha primero. No te defiendas de lo que hizo otro."
          />
          <ConvStep speaker="cliente" text="Me prometieron muchos seguidores pero nunca llegaron clientes nuevos." />
          <ConvStep
            speaker="vendedor"
            text="Eso es muy común. Seguidores no son clientes. Lo que nosotros medimos es clientes nuevos, no métricas de vanidad. Por eso al inicio definimos juntos cuántos clientes nuevos quieres por mes y trabajamos hacia ese número. ¿Le parece si empezamos con un mes de prueba para que vea cómo trabajamos antes de comprometerse a más?"
            note="Ofrece un mes de entrada sin compromiso largo. Reduce el riesgo percibido."
          />
        </div>
      </Section>

      {/* ── OBJECIONES ── */}
      <Section title="Objeciones comunes y respuestas" icon={MessageCircle} iconColor="text-red-400">
        <div className="space-y-3">
          <Objection
            obj="Es muy caro"
            resp="Entiendo. ¿Comparado con qué? Si logramos traerte 3 clientes nuevos al mes y cada uno vale $2,000, el servicio se paga solo en el primer mes. La pregunta no es cuánto cuesta, sino cuánto cuesta no tenerlo."
          />
          <Objection
            obj="Lo pienso / dame más tiempo"
            resp="Claro, tómate el tiempo que necesites. Solo una pregunta: ¿hay alguna duda específica que te esté frenando? A veces puedo aclarar algo que ayuda a decidir más rápido."
          />
          <Objection
            obj="Ya tenemos a alguien interno que lo hace"
            resp="Qué bien que ya tienen a alguien. ¿Cuántos clientes nuevos están llegando por redes o Google en un mes? Lo que nosotros agregamos son los sistemas que hacen que ese trabajo tenga resultados medibles: anuncios optimizados, SEO local, reportes mensuales."
          />
          <Objection
            obj="No sé si esto funcione para mi tipo de negocio"
            resp="Entiendo la duda. Tenemos clientes en [giro similar]. Puedo mostrarle resultados de un negocio parecido al suyo. ¿Le gustaría ver los números?"
          />
          <Objection
            obj="¿Qué garantizan?"
            resp="No garantizamos número exacto de clientes porque dependemos de factores externos. Lo que sí garantizamos es el trabajo: publicación constante, optimización de anuncios, reporte mensual con resultados. Si en 60 días no ve movimiento, lo conversamos. Nuestro interés es que funcione porque así nos renuevan."
          />
          <Objection
            obj="Yo lo hago solo / lo hace mi sobrino"
            resp="Perfecto, que bueno que ya están trabajando en eso. ¿Cuántas horas a la semana le dedica? Lo que ofrecemos es que ese tiempo se lo ahorran y lo invierten en lo que saben hacer: atender a sus clientes. Nosotros nos hacemos cargo de lo digital."
          />
          <Objection
            obj="Necesito consultarlo con mi socio / esposa"
            resp="Claro, tiene todo el sentido. ¿Estarían disponibles para una llamada rápida los tres juntos? Así respondo sus preguntas directamente y no hay información perdida en el teléfono descompuesto."
          />
        </div>
      </Section>

      {/* ── SCRIPTS WA ── */}
      <Section title="Scripts de WhatsApp por etapa" icon={MessageCircle} iconColor="text-green-400">
        <div className="space-y-3">
          <Script
            label="Primer contacto — diagnóstico completado"
            text="Hola [nombre], vi que hiciste el diagnóstico digital de *[negocio]* y tu score fue de *[X]/100* ([nivel]). Hay varias cosas que podemos mejorar bastante rápido. ¿Tienes 15 minutos esta semana para que te explique exactamente qué está pasando? — NorthPeak Digital"
          />
          <Script
            label="Seguimiento — sin respuesta (48h)"
            text="Hola [nombre], solo para confirmar que recibiste mi mensaje anterior sobre el diagnóstico de *[negocio]*. Sin presión, solo quiero asegurarme de que te llegó. 🙌"
          />
          <Script
            label="Recordatorio — cuestionario enviado"
            text="Hola [nombre], ¿pudiste ver el cuestionario que te mandé para *[negocio]*? Son 5 minutos y con eso podemos darte una propuesta mucho más personalizada para tu giro y zona. 📋"
          />
          <Script
            label="Propuesta lista"
            text="Hola [nombre], ya tenemos lista tu propuesta personalizada para *[negocio]*. ¿Cuándo tienes 20 minutos para revisarla juntos? Así te explico cada punto y resuelvo dudas. 🚀"
          />
          <Script
            label="Seguimiento propuesta (48h)"
            text="Hola [nombre], ¿tuviste oportunidad de revisar la propuesta de *[negocio]*? Cualquier duda con gusto la aclaro, no hay compromiso. 🙌"
          />
          <Script
            label="Cierre con urgencia"
            text="Hola [nombre], tenemos espacio disponible para arrancar con *[negocio]* esta semana. Mientras esperamos, tu competencia sigue activa en Google e Instagram todos los días. ¿Arrancamos? 💪"
          />
          <Script
            label="Último seguimiento (día 7)"
            text="Hola [nombre], este es mi último mensaje para no molestarte. Si en algún momento decides avanzar con la presencia digital de *[negocio]*, aquí estamos. Que todo te vaya muy bien. 👊"
          />
          <Script
            label="Visita en frío — después de conocer"
            text="Hola [nombre de dueño], mucho gusto, soy [tu nombre] de NorthPeak Digital. Hoy pasé por *[negocio]* y noté algo importante: al buscar '[giro] [zona]' en Google, no aparece entre los primeros resultados. Eso son clientes que buscan exactamente lo que ofreces y se van con la competencia. ¿Me permite mostrarle el análisis completo? Es gratuito y tarda 3 minutos."
          />
        </div>
      </Section>

      {/* ── SEÑALES DE COMPRA ── */}
      <Section title="Señales de compra — cuándo cerrar" icon={DollarSign} iconColor="text-northpeak-green">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-northpeak-green mb-2">Señales positivas — cierra ya</p>
            <ul className="space-y-2">
              {[
                'Pregunta "¿cuándo podríamos empezar?"',
                "Pide detalles sobre el proceso de pago",
                "Empieza a hablar en plural ('nosotros empezaríamos...')",
                "Pregunta por referencias o casos de éxito",
                "Dice 'suena bien' o 'me convence'",
                "Vio la propuesta 2+ veces (la sistema ya lo muestra)",
              ].map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-northpeak-text-muted">
                  <span className="text-northpeak-green shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-orange-400 mb-2">Señales de duda — responde antes de cerrar</p>
            <ul className="space-y-2">
              {[
                "Compara precios con otras opciones",
                "Hace preguntas muy técnicas sin intención clara",
                "Dice 'lo consulto' o 'lo pienso'",
                "Cancela o pospone reuniones",
                "Responde con mensajes muy cortos",
                "No abre la propuesta (sistema lo muestra)",
              ].map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-northpeak-text-muted">
                  <span className="text-orange-400 shrink-0">!</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-northpeak-card border border-northpeak-green/20 rounded-lg p-4 mt-2">
          <p className="text-xs font-semibold text-northpeak-text mb-2">Cómo cerrar cuando hay señales positivas</p>
          <p className="text-xs text-northpeak-text-muted leading-relaxed">
            No esperes. Cuando el cliente muestra señal de compra, pregunta directamente:
            <span className="text-northpeak-text"> "¿Arrancamos esta semana?"</span> o
            <span className="text-northpeak-text"> "¿Le mando el contrato hoy?"</span>. El silencio
            incómodo después de esta pregunta es normal — déjalo. El que habla primero, pierde.
          </p>
        </div>
      </Section>
    </div>
  );
}

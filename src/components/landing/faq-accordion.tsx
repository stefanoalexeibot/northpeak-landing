"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    num: "01",
    tag: "General",
    q: "¿Qué hace exactamente NorthPeak?",
    a: "Construimos la infraestructura de IA que necesita tu negocio para captar leads, calificarlos automáticamente y cerrar más ventas. Integramos publicidad digital, agentes de IA conversacional, seguimiento automatizado y un portal en tiempo real donde ves cada resultado. No somos una agencia de marketing — somos el sistema que pone tu pipeline en piloto automático.",
  },
  {
    num: "02",
    tag: "Comparación",
    q: "¿En qué se diferencia de contratar un vendedor?",
    a: "Un vendedor trabaja 8 horas al día. Nuestros sistemas de IA operan 24/7 sin vacaciones, sin errores de seguimiento y sin costo fijo por comisiones. Además aprenden: cada conversación mejora la conversión del siguiente lead. No reemplazamos a tu equipo — lo amplifican.",
  },
  {
    num: "03",
    tag: "Resultados",
    q: "¿Cuánto tiempo tarda en verse resultados?",
    a: "Publicidad paga: primeros leads desde el día 1, optimizados en 2-3 semanas. Agente de IA por WhatsApp: activo en 5-7 días hábiles tras el onboarding. Posicionamiento en Google Maps: 6-8 semanas. El promedio de nuestros clientes ve conversiones medibles dentro de las primeras 3 semanas.",
  },
  {
    num: "04",
    tag: "Onboarding",
    q: "¿Necesito saber de tecnología o IA para esto?",
    a: "Para nada. Nosotros implementamos todo y te entregamos el sistema funcionando. Tu portal de cliente muestra los resultados en lenguaje de negocio: cuántos leads entraron, cuántos calificaron y cuántos se convirtieron en ventas. Sin tecnicismos, sin reportes incomprensibles.",
  },
  {
    num: "05",
    tag: "Técnico",
    q: "¿Puede integrarse con lo que ya uso?",
    a: "Sí. Integramos con WhatsApp Business, CRMs, sistemas de reservaciones, Google Calendar y las herramientas que ya tengas en operación. Si aún no tienes stack de ventas, te instalamos todo desde cero en el onboarding.",
  },
  {
    num: "06",
    tag: "Garantía",
    q: "¿Qué pasa si no genero los resultados esperados?",
    a: "Nuestros contratos mínimos son de 3 meses porque los resultados reales toman tiempo para madurar. Si al término no ves movimiento real, revisamos la estrategia juntos sin costo adicional. La gran mayoría de nuestros clientes renueva porque ven retorno, no por obligación contractual.",
  },
];

const tagColors: Record<string, string> = {
  General: "text-northpeak-green bg-northpeak-green/10",
  Comparación: "text-purple-400 bg-purple-400/10",
  Resultados: "text-blue-400 bg-blue-400/10",
  Onboarding: "text-yellow-400 bg-yellow-400/10",
  Técnico: "text-orange-400 bg-orange-400/10",
  Garantía: "text-northpeak-green bg-northpeak-green/10",
};

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-0 divide-y divide-northpeak-surface/60">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="group w-full flex items-start gap-5 py-7 text-left transition-colors"
            >
              {/* Number */}
              <span
                className={`font-mono text-xs font-bold tracking-widest shrink-0 mt-0.5 transition-colors duration-200 ${
                  isOpen ? "text-northpeak-green" : "text-northpeak-text-dim group-hover:text-northpeak-text-muted"
                }`}
              >
                {faq.num}
              </span>

              {/* Question + tag */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <p
                    className={`font-heading font-semibold text-lg leading-snug transition-colors duration-200 ${
                      isOpen ? "text-northpeak-text" : "text-northpeak-text-muted group-hover:text-northpeak-text"
                    }`}
                  >
                    {faq.q}
                  </p>
                  <span
                    className={`hidden sm:inline-flex shrink-0 items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-wider ${
                      tagColors[faq.tag]
                    }`}
                  >
                    {faq.tag}
                  </span>
                </div>
              </div>

              {/* Icon */}
              <div
                className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ${
                  isOpen
                    ? "border-northpeak-green bg-northpeak-green/10 text-northpeak-green"
                    : "border-northpeak-surface text-northpeak-text-dim group-hover:border-northpeak-text-dim"
                }`}
              >
                {isOpen ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pl-[52px] pb-7">
                    <div className="border-l-2 border-northpeak-green/30 pl-5">
                      <p className="text-northpeak-text-muted leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

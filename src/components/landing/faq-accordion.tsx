"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "¿Cuánto tiempo tarda en verse resultados?",
    a: "En redes sociales: 2-4 semanas para primeros resultados visibles. Para SEO local en Google Maps: 6-8 semanas. Para publicidad pagada: resultados desde el primer día, optimizados en 2-3 semanas.",
  },
  {
    q: "¿Qué pasa si no me gusta el contenido que crean?",
    a: "Revisas y apruebas todo antes de que se publique. Desde tu portal de cliente puedes aprobar o pedir cambios en cada pieza de contenido. Si algo no te convence, lo ajustamos sin costo extra.",
  },
  {
    q: "¿Debo firmar un contrato de 12 meses?",
    a: "Nuestros contratos son mínimo 3 meses: el tiempo suficiente para ver resultados reales, pero sin amarrarte indefinidamente. La mayoría de nuestros clientes renuevan porque ven resultados, no por obligación.",
  },
  {
    q: "¿Quién maneja mis redes? ¿Puedo conocer a mi equipo?",
    a: "Tienes un estratega asignado desde el día 1. En tu portal de cliente puedes ver quién está trabajando en tu cuenta, mandarles mensajes y revisar en qué están trabajando en tiempo real.",
  },
  {
    q: "¿Por qué no contratar a alguien más barato en Fiverr o freelance?",
    a: "Conocemos Monterrey. Sabemos cómo habla tu cliente local, qué zonas son relevantes, qué competidores existen y qué estrategias funcionan en este mercado específico. Un freelancer genérico no tiene ese contexto.",
  },
  {
    q: "¿Necesito saber de marketing para trabajar con ustedes?",
    a: "Para nada. Te hablamos en términos de negocio: cuántos clientes nuevos llegaron, cuánto costó conseguirlos y cuánto generaste. Sin tecnicismos ni reportes incomprensibles.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="border border-northpeak-surface rounded-xl overflow-hidden bg-northpeak-card"
        >
          <button
            className="w-full flex items-center justify-between p-5 text-left gap-4 hover:bg-northpeak-surface/50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-medium text-northpeak-text">{faq.q}</span>
            <ChevronDown
              className={`h-4 w-4 text-northpeak-text-muted shrink-0 transition-transform duration-200 ${
                open === i ? "rotate-180" : ""
              }`}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-5 text-northpeak-text-muted text-sm leading-relaxed border-t border-northpeak-surface pt-4">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

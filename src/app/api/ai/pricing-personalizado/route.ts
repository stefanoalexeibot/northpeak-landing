import { NextResponse } from "next/server";
import { askClaude } from "@/lib/ai/claude";
import { buildPersonalizedPricingContext } from "@/lib/analizador/pricing";
import type { Oportunidad } from "@/lib/analizador/scoring";
import type { RespuestasCuestionario } from "@/lib/analizador/cuestionario";

const SYSTEM_PROMPT = `Eres un estratega de marketing digital experto en negocios locales en México.
Tu trabajo es crear paquetes de servicios PERSONALIZADOS y estratégicos basados en las oportunidades detectadas y las respuestas del prospecto.

REGLAS:
1. Crea 2-3 paquetes con nombres creativos y relevantes al giro (NO uses "Starter", "Premium", etc.)
2. Cada paquete debe tener un enfoque estratégico diferente (ej: "captar clientes rápido" vs "construir marca")
3. Ajusta precios según:
   - Facturación del negocio (más facturación → precios premium, menos → precios accesibles)
   - Inversión actual en marketing (si ya invierte mucho, el valor percibido es mayor)
   - Urgencia (urgente → incluir setup fees, largo plazo → descuento por compromiso)
   - Si no tiene equipo de marketing → incluir más servicio completo (managed)
4. Prioriza servicios según el objetivo del prospecto:
   - "más clientes" → ads + Google Maps + SEO
   - "más ventas por cliente" → Instagram + CRM + retargeting
   - "lanzar sucursal" → branding + web + Google Maps
   - "posicionamiento" → Instagram + contenido + PR digital
5. Incluye ROI estimado realista para cada paquete
6. Precios en MXN. Todos los precios deben ser divisibles entre 100.

Responde ÚNICAMENTE con JSON puro (sin markdown):
{
  "paquetes": [
    {
      "nombre": "Nombre Creativo",
      "descripcion": "2-3 oraciones explicando la estrategia y por qué le conviene",
      "servicios": ["lista de servicios incluidos en texto libre"],
      "precioMensual": 5000,
      "precioUnico": 0,
      "prioridad": "inmediata|corto_plazo|mediano_plazo",
      "roiEstimado": "Estimación realista del retorno (ej: +20-30 clientes/mes en 3 meses)"
    }
  ],
  "estrategia": "Resumen de la estrategia general en 2-3 oraciones, explicando por qué estos paquetes en este orden",
  "notaIA": "Nota sobre pricing y valor para este prospecto específico (1-2 oraciones)"
}`;

// Public endpoint — called from cuestionario page (no auth)
export async function POST(request: Request) {
  const { oportunidades, respuestas, giro, zona } = (await request.json()) as {
    oportunidades: Oportunidad[];
    respuestas: RespuestasCuestionario;
    giro: string;
    zona: string;
  };

  if (!oportunidades?.length || !respuestas || !giro || !zona) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
  }

  try {
    const context = buildPersonalizedPricingContext(oportunidades, respuestas, giro, zona);
    const response = await askClaude(SYSTEM_PROMPT, context, { maxTokens: 2048 });

    const cleaned = response.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Calculate totals
    const totalMensual = parsed.paquetes.reduce(
      (sum: number, p: { precioMensual: number }) => sum + p.precioMensual,
      0
    );
    const totalUnico = parsed.paquetes.reduce(
      (sum: number, p: { precioUnico: number }) => sum + (p.precioUnico || 0),
      0
    );

    return NextResponse.json({
      ...parsed,
      totalMensual,
      totalUnico,
    });
  } catch (e) {
    console.error("AI personalized pricing error:", e);
    return NextResponse.json({ error: "Error al generar cotización personalizada" }, { status: 500 });
  }
}

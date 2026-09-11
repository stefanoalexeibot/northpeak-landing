import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { generarPreguntas } from "@/lib/analizador/cuestionario";
import { generarReporteHTML } from "@/lib/analizador/report-html";
import { clasificarPrioridad } from "@/lib/analizador/scoring";
import { askClaude } from "@/lib/ai/claude";
import { buildPersonalizedPricingContext } from "@/lib/analizador/pricing";
import { createNotification } from "@/lib/notifications";
import type { Oportunidad, DatosNegocio, Hallazgos } from "@/lib/analizador/scoring";
import type { Cotizacion, CotizacionPersonalizada } from "@/lib/analizador/pricing";
import type { RespuestasCuestionario } from "@/lib/analizador/cuestionario";

const PRICING_SYSTEM_PROMPT = `Eres un estratega de marketing digital experto en negocios locales en México.
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

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET: Return questions + business data for a token
export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const supabase = getSupabase();

  const { data: cuestionario } = await supabase
    .from("cuestionarios")
    .select("id, analisis_id, status, respuestas, cotizacion_personalizada")
    .eq("token", params.token)
    .single();

  if (!cuestionario) {
    return NextResponse.json({ error: "Cuestionario no encontrado" }, { status: 404 });
  }

  if (cuestionario.status === "completed") {
    return NextResponse.json({
      status: "completed",
      cotizacion_personalizada: cuestionario.cotizacion_personalizada,
      analisis_id: cuestionario.analisis_id,
    });
  }

  // Get analysis data
  const { data: analisis } = await supabase
    .from("analisis_digital")
    .select("nombre_negocio, giro, zona, oportunidades, score, nivel")
    .eq("id", cuestionario.analisis_id)
    .single();

  if (!analisis) {
    return NextResponse.json({ error: "Análisis no encontrado" }, { status: 404 });
  }

  const preguntas = generarPreguntas(
    analisis.giro,
    analisis.oportunidades as Oportunidad[]
  );

  return NextResponse.json({
    status: "pending",
    negocio: {
      nombre: analisis.nombre_negocio,
      giro: analisis.giro,
      zona: analisis.zona,
      score: analisis.score,
      nivel: analisis.nivel,
    },
    preguntas,
  });
}

// POST: Submit answers and generate personalized quotation
export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const supabase = getSupabase();

  const { data: cuestionario } = await supabase
    .from("cuestionarios")
    .select("id, analisis_id, status")
    .eq("token", params.token)
    .single();

  if (!cuestionario) {
    return NextResponse.json({ error: "Cuestionario no encontrado" }, { status: 404 });
  }

  if (cuestionario.status === "completed") {
    return NextResponse.json({ error: "Este cuestionario ya fue completado" }, { status: 400 });
  }

  const { respuestas } = await request.json();

  // Get full analysis
  const { data: analisis } = await supabase
    .from("analisis_digital")
    .select("*")
    .eq("id", cuestionario.analisis_id)
    .single();

  if (!analisis) {
    return NextResponse.json({ error: "Análisis no encontrado" }, { status: 404 });
  }

  try {
    // Call AI directly to generate personalized quotation
    const oportunidades = analisis.oportunidades as Oportunidad[];
    const context = buildPersonalizedPricingContext(
      oportunidades,
      respuestas as RespuestasCuestionario,
      analisis.giro,
      analisis.zona
    );

    const aiResponse = await askClaude(PRICING_SYSTEM_PROMPT, context, { maxTokens: 2048 });
    const cleaned = aiResponse.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const cotizacionPersonalizada: CotizacionPersonalizada = {
      ...parsed,
      totalMensual: parsed.paquetes.reduce(
        (sum: number, p: { precioMensual: number }) => sum + p.precioMensual,
        0
      ),
      totalUnico: parsed.paquetes.reduce(
        (sum: number, p: { precioUnico: number }) => sum + (p.precioUnico || 0),
        0
      ),
    };

    // Save answers + personalized quotation
    await supabase
      .from("cuestionarios")
      .update({
        respuestas,
        cotizacion_personalizada: cotizacionPersonalizada,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", cuestionario.id);

    // Regenerate HTML report with personalized quotation
    const datos: DatosNegocio = {
      nombre: analisis.nombre_negocio,
      giro: analisis.giro,
      zona: analisis.zona,
      contacto: analisis.contacto || "",
      telefono: analisis.telefono || "",
    };
    const hallazgos = analisis.hallazgos as Hallazgos;
    const prioridad = clasificarPrioridad(analisis.score);
    const cotizacionGenerica = analisis.cotizacion as Cotizacion | null;

    const html = generarReporteHTML(
      datos,
      hallazgos,
      analisis.score,
      oportunidades,
      prioridad,
      cotizacionGenerica,
      cotizacionPersonalizada
    );

    // Upload updated HTML
    const slug = datos.nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `analisis-${slug}-${Date.now()}.html`;

    await supabase.storage
      .from("reportes")
      .upload(filename, new Blob([html], { type: "text/html" }), {
        contentType: "text/html",
        upsert: false,
      });

    const { data: urlData } = supabase.storage.from("reportes").getPublicUrl(filename);

    // Update analysis with new report URL + etapa
    await supabase
      .from("analisis_digital")
      .update({
        report_url: urlData.publicUrl,
        etapa: "cuestionario_completado",
      })
      .eq("id", cuestionario.analisis_id);

    // Send notification to admin
    await createNotification(supabase, {
      type: "cuestionario_completed",
      title: `${analisis.nombre_negocio} completó el cuestionario`,
      description: `Cotización personalizada generada — ${analisis.giro}, ${analisis.zona}`,
      link: `/admin/analizador`,
    });

    return NextResponse.json({
      success: true,
      cotizacion_personalizada: cotizacionPersonalizada,
      analisis_id: cuestionario.analisis_id,
    });
  } catch (e) {
    console.error("Cuestionario POST error:", e);
    return NextResponse.json(
      { error: "Error al generar cotización personalizada" },
      { status: 500 }
    );
  }
}

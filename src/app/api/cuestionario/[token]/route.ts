import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { generarPreguntas } from "@/lib/analizador/cuestionario";
import { generarReporteHTML } from "@/lib/analizador/report-html";
import { clasificarPrioridad } from "@/lib/analizador/scoring";
import type { Oportunidad, DatosNegocio, Hallazgos } from "@/lib/analizador/scoring";
import type { Cotizacion, CotizacionPersonalizada } from "@/lib/analizador/pricing";

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
    // Call AI to generate personalized quotation
    const aiRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL || "localhost:3000"}`).origin : "http://localhost:3000"}/api/ai/pricing-personalizado`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oportunidades: analisis.oportunidades,
          respuestas,
          giro: analisis.giro,
          zona: analisis.zona,
        }),
      }
    );

    if (!aiRes.ok) {
      const err = await aiRes.json();
      throw new Error(err.error || "AI pricing failed");
    }

    const cotizacionPersonalizada: CotizacionPersonalizada = await aiRes.json();

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
    const oportunidades = analisis.oportunidades as Oportunidad[];
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

    // Update analysis with new report URL
    await supabase
      .from("analisis_digital")
      .update({ report_url: urlData.publicUrl })
      .eq("id", cuestionario.analisis_id);

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

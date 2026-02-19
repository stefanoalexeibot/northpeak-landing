import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { calcularScore, clasificarPrioridad, generarOportunidades } from "@/lib/analizador/scoring";
import { generarReporteHTML } from "@/lib/analizador/report-html";
import { generarCotizacion } from "@/lib/analizador/pricing";
import type { DatosNegocio, Hallazgos } from "@/lib/analizador/scoring";

export async function POST(request: Request) {
  try {
    const { datos, hallazgos } = (await request.json()) as {
      datos: DatosNegocio;
      hallazgos: Hallazgos;
    };

    if (!datos.nombre || !datos.giro || !datos.zona) {
      return NextResponse.json(
        { error: "Nombre, giro y zona son requeridos" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const score = calcularScore(hallazgos);
    const prioridad = clasificarPrioridad(score);
    const oportunidades = generarOportunidades(hallazgos);
    const cotizacion = generarCotizacion(oportunidades, datos.giro, datos.zona);
    const html = generarReporteHTML(datos, hallazgos, score, oportunidades, prioridad, cotizacion);

    const slug = datos.nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `analisis-${slug}-${Date.now()}.html`;

    const { error: uploadError } = await supabase.storage
      .from("reportes")
      .upload(filename, new Blob([html], { type: "text/html" }), {
        contentType: "text/html",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("reportes").getPublicUrl(filename);

    const { data: analisis, error: dbError } = await supabase
      .from("analisis_digital")
      .insert({
        nombre_negocio: datos.nombre,
        giro: datos.giro,
        zona: datos.zona,
        contacto: datos.contacto || null,
        telefono: datos.telefono || null,
        hallazgos,
        score,
        nivel: prioridad.nivel,
        oportunidades,
        cotizacion,
        report_url: urlData.publicUrl,
        etapa: "nuevo",
        vendedor: "Autodiagnóstico",
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: "Error al guardar análisis" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      score,
      nivel: prioridad.nivel,
      prioridad_desc: prioridad.desc,
      oportunidades,
      report_url: `/api/reporte/${analisis.id}`,
    });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

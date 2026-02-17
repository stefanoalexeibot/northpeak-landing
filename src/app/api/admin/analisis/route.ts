import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { calcularScore, clasificarPrioridad, generarOportunidades } from "@/lib/analizador/scoring";
import { generarReporteHTML } from "@/lib/analizador/report-html";
import { generarCotizacion } from "@/lib/analizador/pricing";
import type { DatosNegocio, Hallazgos } from "@/lib/analizador/scoring";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { datos, hallazgos, client_id } = (await request.json()) as {
    datos: DatosNegocio;
    hallazgos: Hallazgos;
    client_id?: string;
  };

  // Calculate score
  const score = calcularScore(hallazgos);
  const prioridad = clasificarPrioridad(score);
  const oportunidades = generarOportunidades(hallazgos);

  // Generate cotizacion
  const cotizacion = generarCotizacion(oportunidades, datos.giro, datos.zona);

  // Generate HTML report
  const html = generarReporteHTML(datos, hallazgos, score, oportunidades, prioridad, cotizacion);

  // Upload HTML to Supabase storage
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
    return NextResponse.json({ error: "Error al subir reporte: " + uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("reportes").getPublicUrl(filename);

  // Save to database
  const { data: analisis, error: dbError } = await supabase
    .from("analisis_digital")
    .insert({
      nombre_negocio: datos.nombre,
      giro: datos.giro,
      zona: datos.zona,
      contacto: datos.contacto,
      telefono: datos.telefono,
      hallazgos,
      score,
      nivel: prioridad.nivel,
      oportunidades,
      cotizacion,
      report_url: urlData.publicUrl,
      client_id: client_id || null,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: "Error al guardar: " + dbError.message }, { status: 500 });
  }

  const viewUrl = `/api/reporte/${analisis.id}`;

  // Create cuestionario with token (uses service role to bypass RLS)
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const token = randomBytes(16).toString("hex");
  const { data: cuestionario } = await serviceSupabase
    .from("cuestionarios")
    .insert({
      analisis_id: analisis.id,
      token,
    })
    .select("id, token")
    .single();

  return NextResponse.json({
    success: true,
    analisis,
    score,
    nivel: prioridad.nivel,
    oportunidades: oportunidades.length,
    report_url: viewUrl,
    cotizacion,
    cuestionario_token: cuestionario?.token || null,
  });
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data, error } = await supabase
    .from("analisis_digital")
    .select("id, nombre_negocio, giro, zona, score, nivel, report_url, client_id, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map report URLs to proxy route
  const mapped = (data ?? []).map((a) => ({
    ...a,
    report_url: `/api/reporte/${a.id}`,
  }));

  return NextResponse.json(mapped);
}

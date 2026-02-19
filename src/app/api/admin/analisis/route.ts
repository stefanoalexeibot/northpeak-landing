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

  const { datos, hallazgos, client_id, vendedor } = (await request.json()) as {
    datos: DatosNegocio;
    hallazgos: Hallazgos;
    client_id?: string;
    vendedor?: string;
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
      vendedor: vendedor || null,
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
    .select("id, nombre_negocio, giro, zona, score, nivel, report_url, client_id, created_at, etapa, contacto, telefono, vendedor, etapa_updated_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get cuestionario tokens for all analyses
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const ids = (data ?? []).map((a) => a.id);
  const { data: cuestionarios } = ids.length > 0
    ? await serviceSupabase
        .from("cuestionarios")
        .select("analisis_id, token")
        .in("analisis_id", ids)
    : { data: [] };

  const tokenMap = new Map(
    (cuestionarios ?? []).map((c) => [c.analisis_id, c.token])
  );

  const mapped = (data ?? []).map((a) => ({
    ...a,
    report_url: `/api/reporte/${a.id}`,
    cuestionario_token: tokenMap.get(a.id) || null,
  }));

  return NextResponse.json(mapped);
}

// DELETE: Remove a prospect
export async function DELETE(request: Request) {
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

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete related cuestionarios first (FK dependency)
  await serviceSupabase.from("cuestionarios").delete().eq("analisis_id", id);
  await serviceSupabase.from("tareas").delete().eq("analisis_id", id);
  await serviceSupabase.from("ai_strategies").delete().eq("analisis_id", id);

  const { error } = await serviceSupabase.from("analisis_digital").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

// PATCH: Update etapa
export async function PATCH(request: Request) {
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

  const body = await request.json();
  const { id, etapa, client_id } = body;
  if (!id) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (etapa) {
    updates.etapa = etapa;
    updates.etapa_updated_at = new Date().toISOString();
  }
  if (client_id !== undefined) {
    updates.client_id = client_id;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const { error } = await supabase
    .from("analisis_digital")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

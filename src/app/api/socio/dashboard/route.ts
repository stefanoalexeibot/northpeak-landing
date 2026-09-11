import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const sb = createAdminClient();

  // Get Socio record
  const { data: Socio, error } = await sb
    .from("socios")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !Socio) {
    return NextResponse.json({ error: "No eres un Socio registrado" }, { status: 403 });
  }

  // Get prospectos referidos
  const { data: prospectos } = await sb
    .from("analisis_digital")
    .select("id, nombre_negocio, giro, zona, score, nivel, etapa, created_at, cuestionario_token, contacto, telefono")
    .eq("socio_id", Socio.id)
    .order("created_at", { ascending: false });

  // Get cuestionario tokens for prospectos
  const ids = (prospectos ?? []).map((p) => p.id);
  let tokenMap: Map<string, string> = new Map();
  if (ids.length > 0) {
    const { data: cuestionarios } = await sb
      .from("cuestionarios")
      .select("analisis_id, token")
      .in("analisis_id", ids);
    tokenMap = new Map((cuestionarios ?? []).map((c) => [c.analisis_id, c.token]));
  }

  const prospectosMapped = (prospectos ?? []).map((p) => ({
    ...p,
    cuestionario_token: tokenMap.get(p.id) || null,
  }));

  // Get comisiones
  const { data: comisiones } = await sb
    .from("comisiones")
    .select("*")
    .eq("socio_id", Socio.id)
    .order("created_at", { ascending: false });

  // Stats
  const total_prospectos = prospectosMapped.length;
  const ganados = prospectosMapped.filter((p) => p.etapa === "cerrado_ganado").length;
  const comisiones_pendientes = (comisiones ?? [])
    .filter((c) => c.status === "pendiente")
    .reduce((sum, c) => sum + Number(c.monto_comision), 0);
  const comisiones_pagadas = (comisiones ?? [])
    .filter((c) => c.status === "pagada")
    .reduce((sum, c) => sum + Number(c.monto_comision), 0);

  return NextResponse.json({
    Socio,
    prospectos: prospectosMapped,
    comisiones: comisiones ?? [],
    stats: {
      total_prospectos,
      ganados,
      comisiones_pendientes,
      comisiones_pagadas,
    },
  });
}

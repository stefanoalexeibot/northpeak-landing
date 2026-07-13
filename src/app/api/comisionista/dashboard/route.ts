import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Verify role is comisionista or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "comisionista" && profile.role !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    // 1. Get all socios
    const { data: socios, error: sociosErr } = await supabase
      .from("socios")
      .select("id, nombre");
      
    if (sociosErr) throw sociosErr;

    const socioIds = (socios || []).map(s => s.id);

    // 2. Get prospectos
    let totalProspectos = 0;
    let totalGanados = 0;
    let latestProspectos: Record<string, unknown>[] = [];

    if (socioIds.length > 0) {
      const { data: prospectos, error: prosErr } = await supabase
        .from("prospectos")
        .select("id, nombre, socio_id, etapa, created_at")
        .order("created_at", { ascending: false });

      if (prosErr) throw prosErr;

      totalProspectos = prospectos?.length || 0;
      totalGanados = prospectos?.filter(p => p.etapa === "ganado").length || 0;
      
      const socioMap = new Map((socios || []).map(s => [s.id, s.nombre]));
      
      latestProspectos = (prospectos || []).slice(0, 5).map(p => ({
        id: p.id,
        nombre: p.nombre,
        socioNombre: socioMap.get(p.socio_id) || "Socio Desconocido",
        fecha: p.created_at
      }));
    }

    // 3. Get comisiones
    let comisionesPendientes = 0;
    let comisionesCobradas = 0;
    let latestComisiones: Record<string, unknown>[] = [];

    if (socioIds.length > 0) {
      const { data: comisiones, error: comErr } = await supabase
        .from("comisiones")
        .select("id, nombre_negocio, socio_id, monto_comision, status, created_at")
        .order("created_at", { ascending: false });

      if (comErr) throw comErr;

      comisionesPendientes = (comisiones || [])
        .filter(c => c.status === "pendiente")
        .reduce((sum, c) => sum + Number(c.monto_comision), 0);

      comisionesCobradas = (comisiones || [])
        .filter(c => c.status === "pagada")
        .reduce((sum, c) => sum + Number(c.monto_comision), 0);

      const socioMap = new Map((socios || []).map(s => [s.id, s.nombre]));

      latestComisiones = (comisiones || []).slice(0, 5).map(c => ({
        id: c.id,
        nombre: c.nombre_negocio,
        socioNombre: socioMap.get(c.socio_id) || "Socio Desconocido",
        monto: Number(c.monto_comision),
        fecha: c.created_at
      }));
    }

    return NextResponse.json({
      stats: {
        totalSocios: socios?.length || 0,
        totalProspectos,
        totalGanados,
        comisionesPendientes,
        comisionesCobradas
      },
      latestProspectos,
      latestComisiones
    });
  } catch (error: unknown) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

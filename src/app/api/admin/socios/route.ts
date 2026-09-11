import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado", status: 401, supabase: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "No autorizado", status: 403, supabase: null };
  return { error: null, status: 200, supabase: createAdminClient() };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sb = auth.supabase!;

  const { data, error } = await sb
    .from("socios")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get stats from analisis_digital
  const ids = (data ?? []).map((c) => c.id);
  const statsMap: Record<string, { prospectos: number; ganados: number }> = {};

  if (ids.length > 0) {
    const { data: analisis } = await sb
      .from("analisis_digital")
      .select("socio_id, etapa")
      .in("socio_id", ids);

    for (const a of analisis ?? []) {
      if (!a.socio_id) continue;
      if (!statsMap[a.socio_id]) statsMap[a.socio_id] = { prospectos: 0, ganados: 0 };
      statsMap[a.socio_id].prospectos++;
      if (a.etapa === "cerrado_ganado") statsMap[a.socio_id].ganados++;
    }
  }

  // Get comision totals
  const comisionMap: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: comisiones } = await sb
      .from("comisiones")
      .select("socio_id, monto_comision, status")
      .in("socio_id", ids);

    for (const c of comisiones ?? []) {
      if (!c.socio_id) continue;
      comisionMap[c.socio_id] = (comisionMap[c.socio_id] || 0) + Number(c.monto_comision);
    }
  }

  const enriched = (data ?? []).map((c) => ({
    ...c,
    stats: statsMap[c.id] || { prospectos: 0, ganados: 0 },
    total_comisiones: comisionMap[c.id] || 0,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sb = auth.supabase!;

  const body = await request.json();
  const { nombre, email, telefono, porcentaje_comision, notas } = body;

  if (!nombre || !email) {
    return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("socios")
    .insert({ nombre, email, telefono: telefono || null, porcentaje_comision: porcentaje_comision || 10, notas: notas || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sb = auth.supabase!;

  const body = await request.json();
  const { id, nombre, email, telefono, porcentaje_comision, activo, notas } = body;

  if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (nombre !== undefined) updates.nombre = nombre;
  if (email !== undefined) updates.email = email;
  if (telefono !== undefined) updates.telefono = telefono;
  if (porcentaje_comision !== undefined) updates.porcentaje_comision = porcentaje_comision;
  if (activo !== undefined) updates.activo = activo;
  if (notas !== undefined) updates.notas = notas;

  const { error } = await sb.from("socios").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sb = auth.supabase!;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

  const { error } = await sb.from("socios").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

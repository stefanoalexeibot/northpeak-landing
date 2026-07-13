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

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sb = auth.supabase!;

  const { searchParams } = new URL(request.url);
  const comisionista_id = searchParams.get("comisionista_id");
  const status = searchParams.get("status");

  let query = sb
    .from("comisiones")
    .select("*, comisionistas(nombre, email)")
    .order("created_at", { ascending: false });

  if (comisionista_id) query = query.eq("comisionista_id", comisionista_id);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sb = auth.supabase!;

  const body = await request.json();
  const {
    comisionista_id,
    analisis_id,
    client_id,
    nombre_negocio,
    monto_venta,
    porcentaje_aplicado,
    notas,
  } = body;

  if (!comisionista_id || !nombre_negocio || monto_venta === undefined || porcentaje_aplicado === undefined) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const monto_comision = (Number(monto_venta) * Number(porcentaje_aplicado)) / 100;

  const { data, error } = await sb
    .from("comisiones")
    .insert({
      comisionista_id,
      analisis_id: analisis_id || null,
      client_id: client_id || null,
      nombre_negocio,
      monto_venta: Number(monto_venta),
      porcentaje_aplicado: Number(porcentaje_aplicado),
      monto_comision,
      notas: notas || null,
    })
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
  const { id, status, notas, monto_venta, porcentaje_aplicado } = body;

  if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (status !== undefined) {
    updates.status = status;
    if (status === "pagada") updates.paid_at = new Date().toISOString();
  }
  if (notas !== undefined) updates.notas = notas;
  if (monto_venta !== undefined && porcentaje_aplicado !== undefined) {
    updates.monto_venta = Number(monto_venta);
    updates.porcentaje_aplicado = Number(porcentaje_aplicado);
    updates.monto_comision = (Number(monto_venta) * Number(porcentaje_aplicado)) / 100;
  }

  const { error } = await sb.from("comisiones").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sb = auth.supabase!;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

  const { error } = await sb.from("comisiones").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

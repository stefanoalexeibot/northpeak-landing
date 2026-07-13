import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireComisionista() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado", status: 401, supabase: null };
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "comisionista" && profile.role !== "admin")) {
    return { error: "No autorizado", status: 403, supabase: null };
  }
  return { error: null, status: 200, supabase };
}

export async function GET() {
  const auth = await requireComisionista();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sb = auth.supabase!;

  try {
    const { data, error } = await sb
      .from("comisiones")
      .select("*, socios(nombre), prospectos(nombre)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireComisionista();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sb = auth.supabase!;

  try {
    const body = await request.json();
    const { socio_id, prospecto_id, nombre_negocio, monto_venta, porcentaje_aplicado, status, notas } = body;

    if (!socio_id || !nombre_negocio || monto_venta === undefined || porcentaje_aplicado === undefined) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const monto_comision = (Number(monto_venta) * Number(porcentaje_aplicado)) / 100;

    const { data, error } = await sb
      .from("comisiones")
      .insert({
        socio_id,
        prospecto_id: prospecto_id || null,
        nombre_negocio,
        monto_venta,
        porcentaje_aplicado,
        monto_comision,
        status: status || "pendiente",
        notas: notas || null,
        paid_at: status === "pagada" ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireComisionista();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sb = auth.supabase!;

  try {
    const body = await request.json();
    const { id, socio_id, prospecto_id, nombre_negocio, monto_venta, porcentaje_aplicado, status, notas } = body;

    if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (socio_id !== undefined) updates.socio_id = socio_id;
    if (prospecto_id !== undefined) updates.prospecto_id = prospecto_id;
    if (nombre_negocio !== undefined) updates.nombre_negocio = nombre_negocio;
    
    if (monto_venta !== undefined || porcentaje_aplicado !== undefined) {
      const current = await sb.from("comisiones").select("monto_venta, porcentaje_aplicado").eq("id", id).single();
      const mv = monto_venta !== undefined ? Number(monto_venta) : Number(current.data?.monto_venta);
      const pa = porcentaje_aplicado !== undefined ? Number(porcentaje_aplicado) : Number(current.data?.porcentaje_aplicado);
      updates.monto_venta = mv;
      updates.porcentaje_aplicado = pa;
      updates.monto_comision = (mv * pa) / 100;
    }

    if (status !== undefined) {
      updates.status = status;
      if (status === "pagada") {
        updates.paid_at = new Date().toISOString();
      } else {
        updates.paid_at = null;
      }
    }
    if (notas !== undefined) updates.notas = notas;

    const { error } = await sb
      .from("comisiones")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireComisionista();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sb = auth.supabase!;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

    const { error } = await sb
      .from("comisiones")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

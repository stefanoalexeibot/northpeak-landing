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
      .from("prospectos")
      .select("*, socios(nombre)")
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
    const { socio_id, nombre, telefono, email, descripcion, etapa, monto_potencial, fuente, notas } = body;

    if (!socio_id || !nombre) {
      return NextResponse.json({ error: "Socio y nombre del prospecto son requeridos" }, { status: 400 });
    }

    const { data, error } = await sb
      .from("prospectos")
      .insert({
        socio_id,
        nombre,
        telefono: telefono || null,
        email: email || null,
        descripcion: descripcion || null,
        etapa: etapa || "nuevo",
        monto_potencial: monto_potencial || null,
        fuente: fuente || null,
        notas: notas || null
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
    const { id, socio_id, nombre, telefono, email, descripcion, etapa, monto_potencial, fuente, notas } = body;

    if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (socio_id !== undefined) updates.socio_id = socio_id;
    if (nombre !== undefined) updates.nombre = nombre;
    if (telefono !== undefined) updates.telefono = telefono;
    if (email !== undefined) updates.email = email;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (etapa !== undefined) updates.etapa = etapa;
    if (monto_potencial !== undefined) updates.monto_potencial = monto_potencial;
    if (fuente !== undefined) updates.fuente = fuente;
    if (notas !== undefined) updates.notas = notas;
    updates.updated_at = new Date().toISOString();

    const { error } = await sb
      .from("prospectos")
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
      .from("prospectos")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

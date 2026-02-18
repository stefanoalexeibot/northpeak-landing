import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function getAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null as never, error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin")
    return { supabase: null as never, error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };

  return { supabase, error: null };
}

export async function GET(request: Request) {
  const { supabase, error: authError } = await getAdmin();
  if (authError) return authError;

  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id");

  let query = supabase
    .from("pagos_recurrentes")
    .select("*")
    .order("created_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, error: authError } = await getAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { client_id, monto, concepto, dia_cobro } = body;

  if (!client_id || !monto || !concepto) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pagos_recurrentes")
    .insert({
      client_id,
      monto: Number(monto),
      concepto,
      dia_cobro: dia_cobro ? Number(dia_cobro) : 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { supabase, error: authError } = await getAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  if (updates.monto !== undefined) updates.monto = Number(updates.monto);
  if (updates.dia_cobro !== undefined) updates.dia_cobro = Number(updates.dia_cobro);

  const { data, error } = await supabase
    .from("pagos_recurrentes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { supabase, error: authError } = await getAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { error } = await supabase.from("pagos_recurrentes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

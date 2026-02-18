import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function getAdminUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return { supabase, user: null, error: "No autorizado" };

  return { supabase, user, error: null };
}

export async function GET(request: Request) {
  const { supabase, error } = await getAdminUser();
  if (error) return NextResponse.json({ error }, { status: error === "No autenticado" ? 401 : 403 });

  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id");
  const analisisId = url.searchParams.get("analisis_id");

  let query = supabase.from("tareas").select("*").order("created_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);
  if (analisisId) query = query.eq("analisis_id", analisisId);

  const { data, error: dbError } = await query;
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, error } = await getAdminUser();
  if (error) return NextResponse.json({ error }, { status: error === "No autenticado" ? 401 : 403 });

  const body = await request.json();
  const { texto, client_id, analisis_id, fecha_limite } = body;

  if (!texto) return NextResponse.json({ error: "Texto requerido" }, { status: 400 });

  const insert: Record<string, unknown> = { texto, completada: false };
  if (client_id) insert.client_id = client_id;
  if (analisis_id) insert.analisis_id = analisis_id;
  if (fecha_limite) insert.fecha_limite = fecha_limite;

  const { data, error: dbError } = await supabase
    .from("tareas")
    .insert(insert)
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { supabase, error } = await getAdminUser();
  if (error) return NextResponse.json({ error }, { status: error === "No autenticado" ? 401 : 403 });

  const body = await request.json();
  const { id, completada, texto } = body;

  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (typeof completada === "boolean") update.completada = completada;
  if (typeof texto === "string") update.texto = texto;

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });

  const { data, error: dbError } = await supabase
    .from("tareas")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { supabase, error } = await getAdminUser();
  if (error) return NextResponse.json({ error }, { status: error === "No autenticado" ? 401 : 403 });

  const body = await request.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { error: dbError } = await supabase.from("tareas").delete().eq("id", id);
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

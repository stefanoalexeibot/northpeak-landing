import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DEFAULT_TASKS = [
  "Accesos recibidos (Google Business, Meta, hosting)",
  "Logo y assets de marca recibidos",
  "Análisis digital completado",
  "Google Maps: perfil optimizado (descripción, fotos, horarios)",
  "Google Maps: verificación/reclamación lista",
  "Redes sociales: calendario del primer mes armado",
  "Redes sociales: primera semana de contenido programado",
  "Primera publicación publicada",
  "Primer reporte mensual entregado",
  "Cliente satisfecho — pedir reseña de Google",
];

async function getAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado", status: 401, supabase: null };
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "No autorizado", status: 403, supabase: null };
  return { error: null, status: 200, supabase: createAdminClient() };
}

// GET: returns tasks for a client, auto-creates defaults if none exist
export async function GET(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id");
  if (!clientId) return NextResponse.json({ error: "Falta client_id" }, { status: 400 });

  const { data: existing } = await supabase
    .from("client_tasks")
    .select("*")
    .eq("client_id", clientId)
    .order("sort_order");

  if (existing && existing.length > 0) {
    return NextResponse.json(existing);
  }

  // Auto-create defaults
  const rows = DEFAULT_TASKS.map((label, i) => ({
    client_id: clientId,
    label,
    sort_order: i,
  }));

  const { data: created, error: insertError } = await supabase
    .from("client_tasks")
    .insert(rows)
    .select()
    .order("sort_order");

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  return NextResponse.json(created);
}

// PATCH: toggle done
export async function PATCH(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const { id, done } = await request.json();
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const { data, error: dbError } = await supabase
    .from("client_tasks")
    .update({
      done,
      done_at: done ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: add custom task
export async function POST(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const { client_id, label } = await request.json();
  if (!client_id || !label) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

  // Get max sort_order
  const { data: existing } = await supabase
    .from("client_tasks")
    .select("sort_order")
    .eq("client_id", client_id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = ((existing?.[0]?.sort_order ?? -1) as number) + 1;

  const { data, error: dbError } = await supabase
    .from("client_tasks")
    .insert({ client_id, label: label.trim(), sort_order: nextOrder })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE: remove a task
export async function DELETE(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  await supabase.from("client_tasks").delete().eq("id", id);
  return NextResponse.json({ success: true });
}

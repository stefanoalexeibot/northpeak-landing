import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function getAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado", status: 401, supabase: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin")
    return { error: "No autorizado", status: 403, supabase: null };

  return { error: null, status: 200, supabase };
}

export async function GET(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("client_id");

  if (!clientId) {
    return NextResponse.json({ error: "client_id es requerido" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("resultados_cliente")
    .select("*")
    .eq("client_id", clientId)
    .order("mes", { ascending: false })
    .order("created_at", { ascending: false });

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const { client_id, mes, categoria, descripcion, valor, unidad } = body;

  if (!client_id || !mes || !categoria || !descripcion) {
    return NextResponse.json(
      { error: "client_id, mes, categoria y descripcion son requeridos" },
      { status: 400 }
    );
  }

  const { data, error: dbError } = await supabase
    .from("resultados_cliente")
    .insert({
      client_id,
      mes,
      categoria,
      descripcion,
      valor: valor || null,
      unidad: unidad || null,
    })
    .select()
    .single();

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

  const { error: dbError } = await supabase
    .from("resultados_cliente")
    .delete()
    .eq("id", id);

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

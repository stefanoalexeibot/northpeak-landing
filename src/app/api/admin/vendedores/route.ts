import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

async function getAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado", status: 401, supabase: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "No autorizado", status: 403, supabase: null };

  return { error: null, status: 200, supabase };
}

export async function GET() {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const { data, error: dbError } = await supabase
    .from("vendedores")
    .select("*")
    .order("nombre", { ascending: true });

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const { nombre, email, telefono } = await request.json();
  if (!nombre) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });

  const { data, error: dbError } = await supabase
    .from("vendedores")
    .insert({ nombre: nombre.trim(), email: email || null, telefono: telefono || null })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

  const allowed: Record<string, unknown> = {};
  if (updates.nombre !== undefined) allowed.nombre = updates.nombre.trim();
  if (updates.email !== undefined) allowed.email = updates.email || null;
  if (updates.telefono !== undefined) allowed.telefono = updates.telefono || null;
  if (updates.activo !== undefined) allowed.activo = updates.activo;

  const { data, error: dbError } = await supabase
    .from("vendedores")
    .update(allowed)
    .eq("id", id)
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { error, status } = await getAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: dbError } = await serviceSupabase.from("vendedores").delete().eq("id", id);
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

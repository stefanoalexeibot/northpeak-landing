import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function checkAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }), supabase: null as never };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin")
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }), supabase: null as never };

  return { error: null, supabase };
}

export async function GET() {
  const { error, supabase } = await checkAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("catalogo_servicios")
    .select("*")
    .order("orden", { ascending: true, nullsFirst: false })
    .order("nombre", { ascending: true });

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { error, supabase } = await checkAdmin();
  if (error) return error;

  const body = await request.json();
  const { nombre, descripcion, categoria, precio_mensual, precio_unico } = body;

  if (!nombre) return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });

  const { data, error: dbError } = await supabase
    .from("catalogo_servicios")
    .insert({
      nombre,
      descripcion: descripcion || null,
      categoria: categoria || "marketing",
      precio_mensual: precio_mensual ?? null,
      precio_unico: precio_unico ?? null,
      activo: true,
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { error, supabase } = await checkAdmin();
  if (error) return error;

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "ID es requerido" }, { status: 400 });

  const { data, error: dbError } = await supabase
    .from("catalogo_servicios")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { error, supabase } = await checkAdmin();
  if (error) return error;

  const body = await request.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: "ID es requerido" }, { status: 400 });

  const { error: dbError } = await supabase.from("catalogo_servicios").delete().eq("id", id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

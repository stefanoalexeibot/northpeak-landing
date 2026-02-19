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

export async function GET() {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const { data, error: dbError } = await supabase
    .from("propuestas")
    .select("*")
    .order("created_at", { ascending: false });

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const { nombre_prospecto, empresa, servicios, precio_total, mensaje, vigencia_dias } = body;

  if (!nombre_prospecto) {
    return NextResponse.json({ error: "nombre_prospecto es requerido" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("propuestas")
    .insert({
      nombre_prospecto,
      empresa: empresa || null,
      servicios: servicios || [],
      precio_total: precio_total || null,
      mensaje: mensaje || null,
      vigencia_dias: vigencia_dias || 7,
    })
    .select()
    .single();

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://northpeak.mx";
  return NextResponse.json({
    ...data,
    url: `${baseUrl}/propuesta/${data.token}`,
  });
}

export async function DELETE(request: Request) {
  const { error, status, supabase } = await getAdmin();
  if (error || !supabase) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

  const { error: dbError } = await supabase
    .from("propuestas")
    .delete()
    .eq("id", id);

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

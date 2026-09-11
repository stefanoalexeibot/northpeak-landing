import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("propuestas")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });
  }

  // Track every view: increment count and timestamp
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    vistas_count: (data.vistas_count ?? 0) + 1,
    ultima_vista_at: now,
  };
  if (data.status === "pendiente") {
    updates.status = "vista";
    updates.visto_at = now;
  }
  await supabase.from("propuestas").update(updates).eq("id", data.id);

  return NextResponse.json({ ...data, ...updates });
}

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;
  const body = await request.json();
  const { action } = body;

  if (action !== "aceptar") {
    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("propuestas")
    .update({ status: "aceptada" })
    .eq("token", token)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

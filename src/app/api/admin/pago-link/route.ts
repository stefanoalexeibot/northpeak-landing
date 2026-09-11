import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();
  const { payment_id, datos_bancarios } = body;

  if (!payment_id || !datos_bancarios) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const { banco, clabe, titular } = datos_bancarios;
  if (!banco || !clabe || !titular) {
    return NextResponse.json(
      { error: "datos_bancarios requiere banco, clabe y titular" },
      { status: 400 }
    );
  }

  const token = randomBytes(16).toString("hex");

  const { error } = await supabase
    .from("payments")
    .update({
      pago_token: token,
      datos_bancarios,
    })
    .eq("id", payment_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ token });
}

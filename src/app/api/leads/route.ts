import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, whatsapp } = await req.json();

    if (!name?.trim() || !whatsapp?.trim()) {
      return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("leads")
      .insert({ name: name.trim(), whatsapp: whatsapp.trim(), source: "landing" });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}

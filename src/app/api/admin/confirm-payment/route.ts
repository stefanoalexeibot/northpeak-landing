import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const authSupabase = createClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await authSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const supabase = createAdminClient();
  const { payment_id } = await request.json();
  if (!payment_id) return NextResponse.json({ error: "Falta payment_id" }, { status: 400 });

  const { error } = await supabase
    .from("payments")
    .update({ status: "completed", paid_at: new Date().toISOString() })
    .eq("id", payment_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePath("/admin", "layout");
  return NextResponse.json({ success: true });
}

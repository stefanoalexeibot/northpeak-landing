import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { data, error } = await supabase
    .from("notifications")
    .select("*, clients(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();

  if (body.markAll) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (body.id) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

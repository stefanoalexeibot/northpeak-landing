import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null as never, error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin")
    return { supabase: null as never, error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };

  return { supabase, error: null };
}

export async function GET(request: Request) {
  const { supabase, error: authError } = await getAdmin();
  if (authError) return authError;

  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id");

  let query = supabase
    .from("pagos_recurrentes")
    .select("*")
    .order("created_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, error: authError } = await getAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { client_id, monto, concepto, dia_cobro } = body;

  if (!client_id || !monto || !concepto) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pagos_recurrentes")
    .insert({
      client_id,
      monto: Number(monto),
      concepto,
      dia_cobro: dia_cobro ? Number(dia_cobro) : 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Auto-create the first upcoming payment so it appears immediately
  try {
    const today = new Date();
    const dayToday = today.getDate();
    const diaCobroNum = Number(dia_cobro) || 1;

    let nextYear = today.getFullYear();
    let nextMonth = today.getMonth();

    if (diaCobroNum <= dayToday) {
      // Day has already passed this month → next month
      nextMonth += 1;
      if (nextMonth > 11) { nextMonth = 0; nextYear += 1; }
    }

    // Build next due date (handles month overflow, e.g. Feb 31 → Feb 28)
    const tentative = new Date(nextYear, nextMonth, diaCobroNum);
    const dueDateStr = tentative.toISOString().split("T")[0];
    const token = randomBytes(16).toString("hex");

    const service = getServiceClient();

    await service.from("payments").insert({
      client_id: data.client_id,
      amount: data.monto,
      concept: data.concepto,
      status: "pending",
      due_date: dueDateStr,
      pago_token: token,
    });

    // Set ultimo_cobro = dueDateStr so the cron skips that month
    await service
      .from("pagos_recurrentes")
      .update({ ultimo_cobro: dueDateStr })
      .eq("id", data.id);
  } catch {
    // Non-fatal — recurring record already saved
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { supabase, error: authError } = await getAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  if (updates.monto !== undefined) updates.monto = Number(updates.monto);
  if (updates.dia_cobro !== undefined) updates.dia_cobro = Number(updates.dia_cobro);

  const { data, error } = await supabase
    .from("pagos_recurrentes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { supabase, error: authError } = await getAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { error } = await supabase.from("pagos_recurrentes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

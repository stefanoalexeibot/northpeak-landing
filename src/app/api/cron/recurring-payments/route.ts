import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const today = new Date();
  const dayOfMonth = today.getDate();
  const currentMonth = today.toISOString().slice(0, 7); // "YYYY-MM"

  // Get active recurring payments where dia_cobro matches today
  const { data: recurrentes, error: fetchError } = await supabase
    .from("pagos_recurrentes")
    .select("*, clients(name)")
    .eq("activo", true)
    .eq("dia_cobro", dayOfMonth);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!recurrentes || recurrentes.length === 0) {
    return NextResponse.json({ processed: 0, message: "No hay pagos para hoy" });
  }

  let processed = 0;
  const errors: string[] = [];

  for (const rec of recurrentes) {
    // Check if already charged this month
    if (rec.ultimo_cobro) {
      const lastChargeMonth = rec.ultimo_cobro.slice(0, 7);
      if (lastChargeMonth === currentMonth) {
        continue; // Already processed this month
      }
    }

    const token = randomBytes(16).toString("hex");
    const todayStr = today.toISOString().split("T")[0];

    // Create pending payment
    const { error: insertError } = await supabase.from("payments").insert({
      client_id: rec.client_id,
      amount: rec.monto,
      concept: rec.concepto,
      status: "pending",
      due_date: todayStr,
      pago_token: token,
    });

    if (insertError) {
      errors.push(`Error creando pago para ${rec.id}: ${insertError.message}`);
      continue;
    }

    // Update ultimo_cobro
    const { error: updateError } = await supabase
      .from("pagos_recurrentes")
      .update({ ultimo_cobro: todayStr })
      .eq("id", rec.id);

    if (updateError) {
      errors.push(`Error actualizando ultimo_cobro para ${rec.id}: ${updateError.message}`);
    }

    processed++;
  }

  return NextResponse.json({
    processed,
    total: recurrentes.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}

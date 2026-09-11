import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

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
  const supabase = getAnonClient();
  const { token } = params;

  const { data: payment, error } = await supabase
    .from("payments")
    .select("id, concept, amount, status, datos_bancarios, due_date, client_id")
    .eq("pago_token", token)
    .single();

  if (error || !payment) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: payment.id,
    concepto: payment.concept,
    monto: payment.amount,
    status: payment.status,
    datos_bancarios: payment.datos_bancarios,
    due_date: payment.due_date,
    client_name: "Cliente",
  });
}

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  // File is uploaded client-side; we receive the URL via JSON
  let comprobanteUrl: string | null = null;
  try {
    const body = await request.json();
    comprobanteUrl = body.comprobanteUrl || null;
  } catch {
    // No body
  }

  // Use anon client for lookup — covered by public RLS policy
  const anon = getAnonClient();
  const { data: payment, error } = await anon
    .from("payments")
    .select("id, concept, amount, client_id")
    .eq("pago_token", token)
    .single();

  if (error || !payment) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  // Service role operations — best effort
  try {
    const supabase = getServiceClient();

    const { data: clientData } = await supabase
      .from("clients")
      .select("name")
      .eq("id", payment.client_id)
      .single();
    const clientName = clientData?.name || "Cliente";
    const amount = Number(payment.amount).toLocaleString("es-MX");

    // Save comprobante URL to payment record
    if (comprobanteUrl) {
      await supabase
        .from("payments")
        .update({ comprobante_url: comprobanteUrl })
        .eq("id", payment.id);
    }

    // Notification (fire-and-forget)
    createNotification(supabase, {
      type: "payment_received",
      title: `${clientName} notificó pago de $${amount}`,
      description: comprobanteUrl
        ? `${payment.concept} — Comprobante adjunto`
        : payment.concept,
      clientId: payment.client_id,
      link: comprobanteUrl || `/admin/clients/${payment.client_id}`,
    }).catch(() => {});

    // n8n → Telegram (fire-and-forget)
    const n8nWebhook = process.env.N8N_WEBHOOK_PAGO;
    if (n8nWebhook) {
      fetch(n8nWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: clientName,
          concepto: payment.concept,
          monto: `$${amount} MXN`,
          comprobante_url: comprobanteUrl,
          admin_link: `${process.env.NEXT_PUBLIC_APP_URL}/admin/clients/${payment.client_id}`,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  } catch {
    // Service role ops failed — still confirm success to client
  }

  return NextResponse.json({ success: true, comprobanteUrl });
}

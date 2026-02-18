import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";

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
  const supabase = getServiceClient();
  const { token } = params;

  const { data: payment, error } = await supabase
    .from("payments")
    .select("id, concept, amount, status, datos_bancarios, due_date, client_id, clients(name)")
    .eq("pago_token", token)
    .single();

  if (error || !payment) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  const clientObj = payment.clients as unknown as { name: string } | null;

  return NextResponse.json({
    id: payment.id,
    concepto: payment.concept,
    monto: payment.amount,
    status: payment.status,
    datos_bancarios: payment.datos_bancarios,
    due_date: payment.due_date,
    client_name: clientObj?.name || "Cliente",
  });
}

export async function POST(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const supabase = getServiceClient();
  const { token } = params;

  const { data: payment, error } = await supabase
    .from("payments")
    .select("id, concept, amount, client_id, clients(name)")
    .eq("pago_token", token)
    .single();

  if (error || !payment) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  const clientObj = payment.clients as unknown as { name: string } | null;
  const clientName = clientObj?.name || "Cliente";
  const amount = Number(payment.amount).toLocaleString("es-MX");

  await createNotification(supabase, {
    type: "payment_received",
    title: `${clientName} notificó que pagó $${amount}`,
    description: payment.concept,
    clientId: payment.client_id,
    link: `/admin/clients/${payment.client_id}`,
  });

  return NextResponse.json({ success: true });
}

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
  request: Request,
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

  // Upload comprobante if provided
  let comprobanteUrl: string | null = null;
  try {
    const formData = await request.formData();
    const file = formData.get("comprobante") as File | null;

    if (file && file.size > 0) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `comprobantes/${payment.client_id}/${payment.id}.${ext}`;
      const bytes = await file.arrayBuffer();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("client-files")
        .upload(path, bytes, { contentType: file.type, upsert: true });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from("client-files")
          .getPublicUrl(path);
        comprobanteUrl = urlData.publicUrl;
      }
    }
  } catch {
    // No file or parsing error — proceed without it
  }

  await createNotification(supabase, {
    type: "payment_received",
    title: `${clientName} notificó pago de $${amount}`,
    description: comprobanteUrl
      ? `${payment.concept} — Comprobante adjunto`
      : payment.concept,
    clientId: payment.client_id,
    link: comprobanteUrl || `/admin/clients/${payment.client_id}`,
  });

  return NextResponse.json({ success: true, comprobanteUrl });
}

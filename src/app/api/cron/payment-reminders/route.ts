import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendPaymentReminder } from "@/lib/email/send-payment-reminder";

// Called by Vercel Cron daily
// vercel.json: { "crons": [{ "path": "/api/cron/payment-reminders", "schedule": "0 14 * * *" }] }
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const in3days = new Date(now.getTime() + 3 * 86400000).toISOString().split("T")[0];
  const portalUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/portal/invoice`
    : "https://northpeakdigital.com.mx/portal/invoice";

  // Get payments due in next 3 days (upcoming) + overdue
  const { data: payments, error } = await serviceClient
    .from("payments")
    .select("id, client_id, concept, amount, due_date, clients(name, email)")
    .eq("status", "pending")
    .not("due_date", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let errors = 0;

  for (const payment of payments || []) {
    const dueDate = payment.due_date!;
    const isOverdue = dueDate < today;
    const isUpcoming = dueDate >= today && dueDate <= in3days;

    if (!isOverdue && !isUpcoming) continue;

    const client = payment.clients as unknown as { name: string; email: string } | null;
    if (!client?.email) continue;

    const result = await sendPaymentReminder({
      to: client.email,
      clientName: client.name,
      concept: payment.concept,
      amount: Number(payment.amount),
      dueDate,
      isOverdue,
      portalUrl,
    });

    if (result.success) {
      sent++;
    } else {
      errors++;
    }
  }

  return NextResponse.json({ sent, errors, total: payments?.length ?? 0 });
}

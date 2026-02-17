import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { clientId } = await request.json();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY no configurada" }, { status: 500 });
  }

  const portalUrl = `${new URL(request.url).origin}/portal/login`;
  const result = await sendWelcomeEmail({
    to: client.email,
    clientName: client.name,
    temporaryPassword: "(usa tu contraseña actual)",
    portalUrl,
  });

  if (!result.success) {
    return NextResponse.json({ error: "Error al enviar email" }, { status: 500 });
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  await serviceClient
    .from("clients")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", clientId);

  return NextResponse.json({ success: true });
}

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";

export async function POST(request: Request) {
  // Verify admin
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

  const { name, email, company, phone, password } = await request.json();

  // Use service role to create user (doesn't affect admin session)
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Create client record
  const { error: clientError } = await serviceClient.from("clients").insert({
    user_id: authData.user.id,
    name,
    email,
    company: company || "",
    phone: phone || null,
  });

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 400 });
  }

  // Send welcome email
  const portalUrl = `${new URL(request.url).origin}/portal/login`;
  if (process.env.RESEND_API_KEY) {
    const emailResult = await sendWelcomeEmail({
      to: email,
      clientName: name,
      temporaryPassword: password,
      portalUrl,
    });

    if (emailResult.success) {
      await serviceClient
        .from("clients")
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq("user_id", authData.user.id);
    }
  }

  return NextResponse.json({ success: true });
}

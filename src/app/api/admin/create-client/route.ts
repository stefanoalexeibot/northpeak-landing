import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

  const { name, email, company, phone, password, onboarding } = await request.json();

  // Use admin client to create user (doesn't affect admin session)
  const serviceClient = createAdminClient();

  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Create client record
  const { data: clientData, error: clientError } = await serviceClient
    .from("clients")
    .insert({
      user_id: authData.user.id,
      name,
      email,
      company: company || "",
      phone: phone || null,
    })
    .select("id")
    .single();

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 400 });
  }

  const clientId = clientData.id;

  // Onboarding automation
  if (onboarding) {
    if (onboarding.autoContract) {
      await serviceClient.from("documents").insert({
        client_id: clientId,
        type: "contract",
        title: `Contrato de servicios — ${company || name}`,
      });
    }

    if (onboarding.autoInvoice && onboarding.invoiceAmount) {
      await serviceClient.from("documents").insert({
        client_id: clientId,
        type: "invoice",
        title: "Nota de venta",
        content: {
          items: [{ concept: onboarding.invoiceConcept || "Servicios", amount: onboarding.invoiceAmount }],
          discount: 0,
          notes: "",
        },
      });
      await serviceClient.from("payments").insert({
        client_id: clientId,
        amount: onboarding.invoiceAmount,
        concept: onboarding.invoiceConcept || "Servicios",
        status: "pending",
        payment_method: "transfer",
      });
    }

    if (onboarding.autoProject) {
      await serviceClient.from("projects").insert({
        client_id: clientId,
        name: onboarding.projectName || `Proyecto ${company || name}`,
        status: "planning",
      });
    }
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

  revalidatePath("/admin", "layout");
  return NextResponse.json({ success: true, clientId });
}

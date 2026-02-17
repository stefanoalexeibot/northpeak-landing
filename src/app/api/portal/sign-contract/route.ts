import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
import { notifyAdmin } from "@/lib/email/notify-admin";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: client } = await supabase
    .from("clients")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

  const { documentId, signatureData } = await request.json();

  // Verify document belongs to this client
  const { data: doc } = await supabase
    .from("documents")
    .select("id, client_id, title")
    .eq("id", documentId)
    .eq("client_id", client.id)
    .single();

  if (!doc) return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });

  const { error } = await supabase
    .from("documents")
    .update({
      signed: true,
      signature_data: signatureData,
      signed_at: new Date().toISOString(),
    })
    .eq("id", documentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Create notification + email
  await createNotification(supabase, {
    type: "contract_signed",
    title: `${client.name} firmó "${doc.title}"`,
    description: "Contrato firmado desde el portal",
    clientId: client.id,
    link: `/admin/clients/${client.id}`,
  });

  await notifyAdmin({
    subject: `Contrato firmado: ${client.name}`,
    body: `<p><strong>${client.name}</strong> ha firmado el documento "${doc.title}".</p>`,
  });

  return NextResponse.json({ success: true });
}

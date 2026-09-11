import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
import { notifyAdmin } from "@/lib/email/notify-admin";
import type { NotificationType } from "@/lib/types";

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

  const { type, title, description } = await request.json() as {
    type: NotificationType;
    title: string;
    description?: string;
  };

  const validTypes: NotificationType[] = [
    "message_received",
    "referral_submitted",
    "testimonial_submitted",
    "file_uploaded",
  ];

  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Tipo no válido" }, { status: 400 });
  }

  await createNotification(supabase, {
    type,
    title,
    description,
    clientId: client.id,
    link: `/admin/clients/${client.id}`,
  });

  await notifyAdmin({
    subject: title,
    body: `<p><strong>${client.name}</strong> ${description || title}</p>`,
  });

  return NextResponse.json({ success: true });
}

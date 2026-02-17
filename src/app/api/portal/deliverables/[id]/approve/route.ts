import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "client") {
    return NextResponse.json({ error: "Solo clientes pueden aprobar" }, { status: 403 });
  }

  // Get client
  const { data: client } = await supabase
    .from("clients")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

  const { approved, feedback } = await request.json();

  // Verify deliverable belongs to this client's project
  const { data: deliverable } = await supabase
    .from("deliverables")
    .select("id, name, project_id, projects!inner(client_id)")
    .eq("id", params.id)
    .single();

  if (!deliverable) {
    return NextResponse.json({ error: "Entregable no encontrado" }, { status: 404 });
  }

  const projectClientId = (deliverable.projects as unknown as { client_id: string }).client_id;
  if (projectClientId !== client.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Update deliverable
  const updateData: Record<string, unknown> = {
    client_approved: approved,
    client_feedback: feedback || null,
  };

  if (approved) {
    updateData.approved_at = new Date().toISOString();
    updateData.status = "completed";
  } else {
    updateData.approved_at = null;
    updateData.status = "review";
  }

  const { error } = await supabase
    .from("deliverables")
    .update(updateData)
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify admin
  await createNotification(supabase, {
    type: "contract_signed",
    title: approved
      ? `${client.name} aprobó: "${deliverable.name}"`
      : `${client.name} solicitó cambios en: "${deliverable.name}"`,
    description: feedback || undefined,
    clientId: client.id,
    link: `/admin/clients/${client.id}`,
  });

  return NextResponse.json({ success: true });
}

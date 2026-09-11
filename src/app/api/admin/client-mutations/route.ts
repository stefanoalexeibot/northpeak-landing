import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const body = await request.json();
    const { action } = body;

    try {
        switch (action) {
            case "update-info": {
                const { clientId, name, company, phone } = body;
                const { error } = await supabase.from("clients").update({ name, company, phone: phone || null }).eq("id", clientId);
                if (error) return NextResponse.json({ error: error.message }, { status: 400 });
                break;
            }

            case "create-payment": {
                const { clientId, amount, concept, payment_method, status, reference_number, notes, due_date } = body;
                const { error } = await supabase.from("payments").insert({
                    client_id: clientId,
                    amount,
                    concept,
                    payment_method,
                    status,
                    reference_number: reference_number || null,
                    notes: notes || null,
                    due_date: due_date || null,
                    paid_at: status === "completed" ? new Date().toISOString() : null,
                });
                if (error) return NextResponse.json({ error: error.message }, { status: 400 });
                break;
            }

            case "upload-document": {
                const { clientId, type, title, file_url } = body;
                const { error } = await supabase.from("documents").insert({
                    client_id: clientId,
                    type,
                    title,
                    file_url: file_url || null,
                });
                if (error) return NextResponse.json({ error: error.message }, { status: 400 });
                break;
            }

            case "save-invoice": {
                const { clientId, content, existingId } = body;
                if (existingId) {
                    const { error } = await supabase.from("documents").update({ content, title: "Nota de venta" }).eq("id", existingId);
                    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
                } else {
                    const { error } = await supabase.from("documents").insert({
                        client_id: clientId,
                        type: "invoice",
                        title: "Nota de venta",
                        content,
                    });
                    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
                }
                break;
            }

            case "create-project": {
                const { clientId, name, description, status } = body;
                const { error } = await supabase.from("projects").insert({
                    client_id: clientId,
                    name,
                    description: description || null,
                    status,
                });
                if (error) return NextResponse.json({ error: error.message }, { status: 400 });
                break;
            }

            case "add-deliverable": {
                const { projectId, name, order_index } = body;
                const { error } = await supabase.from("deliverables").insert({
                    project_id: projectId,
                    name,
                    order_index,
                });
                if (error) return NextResponse.json({ error: error.message }, { status: 400 });
                break;
            }

            case "update-deliverable": {
                const { id, ...updates } = body;
                delete updates.action;
                const { error } = await supabase.from("deliverables").update(updates).eq("id", id);
                if (error) return NextResponse.json({ error: error.message }, { status: 400 });
                break;
            }

            case "update-project-status": {
                const { id, status } = body;
                const { error } = await supabase.from("projects").update({ status }).eq("id", id);
                if (error) return NextResponse.json({ error: error.message }, { status: 400 });
                break;
            }

            case "upload-media": {
                const { clientId, name, file_url, file_type, file_size } = body;
                const { error } = await supabase.from("media").insert({
                    client_id: clientId,
                    name,
                    file_url,
                    file_type,
                    file_size,
                });
                if (error) return NextResponse.json({ error: error.message }, { status: 400 });
                break;
            }

            default:
                return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
        }

        revalidatePath("/admin", "layout");
        return NextResponse.json({ success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Error interno";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

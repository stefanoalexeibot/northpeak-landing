import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ClientDetailTabs from "@/components/admin/client-detail-tabs";
import DeleteClientButton from "@/components/admin/delete-client-button";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!client) notFound();

  const [
    { data: documents },
    { data: projects },
    { data: media },
    { data: payments },
  ] = await Promise.all([
    supabase.from("documents").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
    supabase.from("projects").select("*, deliverables(*)").eq("client_id", client.id).order("created_at", { ascending: false }),
    supabase.from("media").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
    supabase.from("payments").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/clients">
          <Button variant="ghost" size="icon" className="text-northpeak-text-muted hover:text-northpeak-text">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-heading font-bold text-northpeak-text">{client.name}</h1>
          <p className="text-northpeak-text-muted mt-1">
            {client.company ? `${client.company} — ` : ""}{client.email}
          </p>
        </div>
        <DeleteClientButton clientId={client.id} clientName={client.name} />
      </div>

      <ClientDetailTabs
        client={client}
        documents={documents ?? []}
        projects={projects ?? []}
        media={media ?? []}
        payments={payments ?? []}
      />
    </div>
  );
}

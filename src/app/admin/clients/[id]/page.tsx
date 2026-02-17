import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import ClientDetailTabs from "@/components/admin/client-detail-tabs";
import DeleteClientButton from "@/components/admin/delete-client-button";
import OnboardingChecklist from "@/components/admin/onboarding-checklist";
import ClientNotes from "@/components/admin/client-notes";
import ClientStatusSelect from "@/components/admin/client-status-select";

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
    { data: analyses },
  ] = await Promise.all([
    supabase.from("documents").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
    supabase.from("projects").select("*, deliverables(*)").eq("client_id", client.id).order("created_at", { ascending: false }),
    supabase.from("media").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
    supabase.from("payments").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
    supabase.from("analisis_digital").select("id, nombre_negocio, giro, zona, score, nivel, oportunidades, report_url, created_at").eq("client_id", client.id).order("created_at", { ascending: false }),
  ]);

  // Build onboarding checklist
  const docs = documents ?? [];
  const projs = projects ?? [];
  const hasContract = docs.some((d) => d.type === "contract");
  const hasInvoice = docs.some((d) => d.type === "invoice");
  const hasWelcome = docs.some((d) => d.type === "welcome");
  const hasProject = projs.length > 0;
  const welcomeEmailSent = !!client.welcome_email_sent_at;

  const checklistItems = [
    { label: "Email de bienvenida enviado", done: welcomeEmailSent, detail: welcomeEmailSent ? new Date(client.welcome_email_sent_at!).toLocaleDateString("es-MX") : undefined },
    { label: "Contrato subido", done: hasContract },
    { label: "Nota de venta creada", done: hasInvoice },
    { label: "Documento de bienvenida", done: hasWelcome },
    { label: "Proyecto creado", done: hasProject, detail: hasProject ? `${projs.length} proyecto(s)` : undefined },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/clients">
          <Button variant="ghost" size="icon" className="text-northpeak-text-muted hover:text-northpeak-text">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-heading font-bold text-northpeak-text">{client.name}</h1>
            <ClientStatusSelect clientId={client.id} currentStatus={client.status} />
          </div>
          <p className="text-northpeak-text-muted mt-1">
            {client.company ? `${client.company} — ` : ""}{client.email}
          </p>
        </div>
        <DeleteClientButton clientId={client.id} clientName={client.name} />
      </div>

      {/* Onboarding + Notes side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardHeader>
            <CardTitle className="text-northpeak-text font-heading text-base">Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <OnboardingChecklist items={checklistItems} />
          </CardContent>
        </Card>

        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-6">
            <ClientNotes clientId={client.id} initialNotes={client.admin_notes || ""} />
          </CardContent>
        </Card>
      </div>

      <ClientDetailTabs
        client={client}
        documents={docs}
        projects={projs}
        media={media ?? []}
        payments={payments ?? []}
        analyses={analyses ?? []}
      />
    </div>
  );
}

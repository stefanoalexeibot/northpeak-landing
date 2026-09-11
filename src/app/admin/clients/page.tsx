import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExportButton from "./export-button";
import ClientStatusBadge from "@/components/admin/client-status-badge";
import ClientStatusFilter from "./client-status-filter";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createAdminClient();
  let query = supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (searchParams.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status);
  }

  const { data: clients } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-northpeak-text">Clientes</h1>
          <p className="text-northpeak-text-muted mt-1 text-sm">Gestiona tus clientes</p>
        </div>
        <div className="flex gap-2">
          {clients && clients.length > 0 && <ExportButton clients={clients} />}
          <Link href="/admin/clients/new">
            <Button className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nuevo cliente</span>
            </Button>
          </Link>
        </div>
      </div>

      <ClientStatusFilter current={searchParams.status} />

      {!clients || clients.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <p className="text-northpeak-text-muted">No hay clientes registrados.</p>
            <Link href="/admin/clients/new">
              <Button className="mt-4 bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
                Crear primer cliente
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/admin/clients/${client.id}`}>
              <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-northpeak-green/10 text-northpeak-green font-bold text-lg shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-northpeak-text truncate">{client.name}</p>
                      <ClientStatusBadge status={client.status} />
                    </div>
                    <p className="text-sm text-northpeak-text-muted truncate">
                      {client.company ? `${client.company} — ` : ""}{client.email}
                    </p>
                  </div>
                  <p className="text-xs text-northpeak-text-dim hidden sm:block">
                    {new Date(client.created_at).toLocaleDateString("es-MX")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

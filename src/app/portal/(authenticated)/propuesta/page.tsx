import { getClientData } from "@/lib/supabase/get-client-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSearch, Download, ExternalLink, CalendarDays } from "lucide-react";

export default async function PropuestaPage() {
  const { supabase, client } = await getClientData();

  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("client_id", client.id)
    .eq("type", "proposal")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Tu propuesta</h1>
        <p className="text-northpeak-text-muted mt-1">
          La propuesta comercial de tu proyecto con NorthPeak
        </p>
      </div>

      {!docs || docs.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <FileSearch className="h-12 w-12 text-northpeak-text-dim mx-auto mb-4" />
            <p className="text-northpeak-text-muted">
              Tu propuesta aún no está disponible aquí.
            </p>
            <p className="text-northpeak-text-dim text-sm mt-1">
              Contacta a tu equipo por soporte si la necesitas.
            </p>
          </CardContent>
        </Card>
      ) : (
        docs.map((doc) => (
          <Card key={doc.id} className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-northpeak-text font-heading flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-northpeak-green" />
                  {doc.title}
                </CardTitle>
                {doc.created_at && (
                  <div className="flex items-center gap-1.5 text-xs text-northpeak-text-dim shrink-0">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(doc.created_at).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {doc.file_url ? (
                <div className="space-y-4">
                  <div className="aspect-[4/5] max-h-[75vh] rounded-lg overflow-hidden bg-northpeak-bg border border-northpeak-surface">
                    <iframe
                      src={doc.file_url}
                      className="w-full h-full"
                      title={doc.title}
                    />
                  </div>
                  <div className="flex gap-2">
                    <a href={doc.file_url} target="_blank" rel="noreferrer">
                      <Button
                        variant="outline"
                        className="border-northpeak-surface text-northpeak-text-muted hover:text-northpeak-text"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir en nueva pestaña
                      </Button>
                    </a>
                    <a href={doc.file_url} download>
                      <Button className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-northpeak-text-muted text-sm">
                  La propuesta no tiene archivo adjunto. Contacta a tu equipo.
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

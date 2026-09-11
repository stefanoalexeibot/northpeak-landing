import { getClientData } from "@/lib/supabase/get-client-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, CheckCircle } from "lucide-react";
import ContractSignature from "./contract-signature";

export default async function ContractPage() {
  const { supabase, client } = await getClientData();

  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("client_id", client.id)
    .eq("type", "contract")
    .order("created_at", { ascending: false });

  // No need to mark as seen — badge now tracks unsigned contracts

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Contrato</h1>
        <p className="text-northpeak-text-muted mt-1">Tu contrato de servicios con NorthPeak</p>
      </div>

      {!docs || docs.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-northpeak-text-dim mx-auto mb-4" />
            <p className="text-northpeak-text-muted">Tu contrato aún no está disponible.</p>
            <p className="text-xs text-northpeak-text-dim mt-1">Contacta al equipo si tienes dudas.</p>
          </CardContent>
        </Card>
      ) : (
        docs.map((doc) => (
          <Card key={doc.id} className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-northpeak-text font-heading flex items-center gap-2">
                <FileText className="h-5 w-5 text-northpeak-green" />
                {doc.title}
                {doc.signed && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-northpeak-green bg-northpeak-green/10 px-2 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Firmado
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doc.file_url ? (
                <div className="space-y-4">
                  <div className="aspect-[4/5] max-h-[70vh] rounded-lg overflow-hidden bg-northpeak-bg">
                    <iframe
                      src={doc.file_url}
                      className="w-full h-full"
                      title={doc.title}
                    />
                  </div>
                  <div className="flex gap-2">
                    <a href={doc.file_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="border-northpeak-surface text-northpeak-text-muted">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir
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
                <p className="text-northpeak-text-muted text-sm">Documento sin archivo adjunto.</p>
              )}

              {/* Signature section */}
              <ContractSignature
                documentId={doc.id}
                signed={doc.signed}
                signatureData={doc.signature_data}
                signedAt={doc.signed_at}
              />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

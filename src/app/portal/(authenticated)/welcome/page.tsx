import { getClientData } from "@/lib/supabase/get-client-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HandHeart, Download, ExternalLink } from "lucide-react";

export default async function WelcomePage() {
  const { supabase, client } = await getClientData();

  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("client_id", client.id)
    .eq("type", "welcome")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Bienvenida</h1>
        <p className="text-northpeak-text-muted mt-1">Tu documento de bienvenida a NorthPeak</p>
      </div>

      {!docs || docs.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <HandHeart className="h-12 w-12 text-northpeak-text-dim mx-auto mb-4" />
            <p className="text-northpeak-text-muted">Tu documento de bienvenida aún no está disponible.</p>
          </CardContent>
        </Card>
      ) : (
        docs.map((doc) => (
          <Card key={doc.id} className="bg-northpeak-card border-northpeak-surface">
            <CardHeader>
              <CardTitle className="text-northpeak-text font-heading flex items-center gap-2">
                <HandHeart className="h-5 w-5 text-pink-400" />
                {doc.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doc.file_url ? (
                <div className="space-y-4">
                  <div className="aspect-[4/5] max-h-[70vh] rounded-lg overflow-hidden bg-northpeak-bg">
                    <iframe src={doc.file_url} className="w-full h-full" title={doc.title} />
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
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

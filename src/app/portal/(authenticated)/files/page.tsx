import { getClientData } from "@/lib/supabase/get-client-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Download, FileText, Film, Music } from "lucide-react";
import FilesClient from "./files-client";

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return Film;
  if (type.startsWith("audio/")) return Music;
  return FileText;
}

export default async function FilesPage() {
  const { supabase, client } = await getClientData();

  const { data: files } = await supabase
    .from("media")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  // Mark files as seen
  if (files && files.length > 0) {
    const unseenIds = files.filter(f => !f.seen_by_client).map(f => f.id);
    if (unseenIds.length > 0) {
      await supabase.from("media").update({ seen_by_client: true }).in("id", unseenIds);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-northpeak-text">Archivos</h1>
          <p className="text-northpeak-text-muted mt-1">Tus archivos y entregables</p>
        </div>
        <FilesClient clientId={client.id} />
      </div>

      {!files || files.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 text-northpeak-text-dim mx-auto mb-4" />
            <p className="text-northpeak-text-muted">Aún no hay archivos disponibles.</p>
            <p className="text-northpeak-text-dim text-sm mt-1">Sube archivos usando el botón de arriba.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => {
            const Icon = getFileIcon(file.file_type);
            const isImage = file.file_type.startsWith("image/");

            return (
              <Card key={file.id} className="bg-northpeak-card border-northpeak-surface overflow-hidden group">
                {isImage ? (
                  <div className="aspect-video bg-northpeak-bg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.file_url}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-northpeak-bg flex items-center justify-center">
                    <Icon className="h-12 w-12 text-northpeak-text-dim" />
                  </div>
                )}
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-northpeak-text truncate">{file.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-northpeak-text-dim">
                        {(file.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {file.uploaded_by === "client" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-northpeak-green/10 text-northpeak-green">
                          Subido por ti
                        </span>
                      )}
                    </div>
                    <a href={file.file_url} download target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm" className="text-northpeak-green hover:text-northpeak-green/80 h-7 text-xs">
                        <Download className="h-3 w-3 mr-1" />
                        Descargar
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

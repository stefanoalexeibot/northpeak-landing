"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface FileUploadProps {
  clientId: string;
  onUploaded: () => void;
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export default function FileUpload({ clientId, onUploaded }: FileUploadProps) {
  const supabase = createClient();
  const { addToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    let uploaded = 0;

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE) {
        addToast(`${file.name} excede el límite de 50MB`, "error");
        continue;
      }

      const ext = file.name.split(".").pop();
      const path = `${clientId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: storageError } = await supabase.storage
        .from("client-files")
        .upload(path, file);

      if (storageError) {
        addToast(`Error al subir ${file.name}`, "error");
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("client-files")
        .getPublicUrl(path);

      const { error: dbError } = await supabase.from("media").insert({
        client_id: clientId,
        name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type || "application/octet-stream",
        file_size: file.size,
        uploaded_by: "client",
        seen_by_client: true,
      });

      if (dbError) {
        addToast(`Error al registrar ${file.name}`, "error");
        continue;
      }

      uploaded++;
    }

    if (uploaded > 0) {
      addToast(
        `${uploaded} archivo${uploaded > 1 ? "s" : ""} subido${uploaded > 1 ? "s" : ""} correctamente`,
        "success"
      );

      // Notify admin
      fetch("/api/portal/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "file_uploaded",
          title: "Nuevo archivo del cliente",
          description: `Subió ${uploaded} archivo${uploaded > 1 ? "s" : ""}`,
        }),
      }).catch(() => {});

      onUploaded();
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.ai,.psd,.svg,.eps"
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Subir archivos
          </>
        )}
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    setDeleting(true);
    await supabase.from("clients").delete().eq("id", clientId);
    router.push("/admin/clients");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400">Eliminar {clientName}?</span>
        <Button
          onClick={handleDelete}
          disabled={deleting}
          variant="destructive"
          size="sm"
          className="text-xs"
        >
          {deleting ? "Eliminando..." : "Confirmar"}
        </Button>
        <Button
          onClick={() => setConfirming(false)}
          variant="ghost"
          size="sm"
          className="text-xs text-northpeak-text-muted"
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setConfirming(true)}
      variant="ghost"
      size="icon"
      className="text-northpeak-text-muted hover:text-red-400 h-9 w-9"
      title="Eliminar cliente"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

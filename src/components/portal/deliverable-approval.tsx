"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, MessageSquare, Loader2 } from "lucide-react";

export default function DeliverableApproval({
  deliverableId,
  deliverableName,
}: {
  deliverableId: string;
  deliverableName: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "feedback">("idle");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    const res = await fetch(`/api/portal/deliverables/${deliverableId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    }
  }

  async function handleRequestChanges() {
    if (!feedback.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/portal/deliverables/${deliverableId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: false, feedback }),
    });
    setLoading(false);
    if (res.ok) {
      setMode("idle");
      setFeedback("");
      router.refresh();
    }
  }

  if (mode === "feedback") {
    return (
      <div className="space-y-2">
        <p className="text-xs text-northpeak-text-muted">
          Describe los cambios que necesitas para &ldquo;{deliverableName}&rdquo;:
        </p>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Ej: El color del logo no coincide con nuestra marca..."
          className="bg-northpeak-bg border-northpeak-surface text-northpeak-text text-sm min-h-[80px]"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleRequestChanges}
            disabled={loading || !feedback.trim()}
            size="sm"
            className="bg-yellow-500 text-northpeak-bg hover:bg-yellow-500/90 text-xs"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            Enviar cambios
          </Button>
          <Button
            onClick={() => { setMode("idle"); setFeedback(""); }}
            size="sm"
            variant="ghost"
            className="text-northpeak-text-muted text-xs"
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className="text-xs text-purple-400 mr-2">Listo para tu revisión</p>
      <Button
        onClick={handleApprove}
        disabled={loading}
        size="sm"
        className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 text-xs"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
        Aprobar
      </Button>
      <Button
        onClick={() => setMode("feedback")}
        size="sm"
        variant="outline"
        className="border-northpeak-surface text-northpeak-text-muted text-xs"
      >
        <MessageSquare className="h-3 w-3 mr-1" />
        Pedir cambios
      </Button>
    </div>
  );
}

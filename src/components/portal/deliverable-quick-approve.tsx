"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickDeliverable {
  id: string;
  name: string;
  project_name: string;
  project_id: string;
}

export default function DeliverableQuickApprove({
  deliverables,
}: {
  deliverables: QuickDeliverable[];
}) {
  const router = useRouter();
  const [approving, setApproving] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  async function handleApprove(id: string) {
    setApproving(id);
    try {
      const res = await fetch(`/api/portal/deliverables/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      if (res.ok) {
        setDone((prev) => new Set(Array.from(prev).concat(id)));
        router.refresh();
      }
    } finally {
      setApproving(null);
    }
  }

  const visible = deliverables.filter((d) => !done.has(d.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((del) => (
        <div
          key={del.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/20"
        >
          <Clock className="h-4 w-4 text-yellow-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-northpeak-text truncate">{del.name}</p>
            <p className="text-xs text-northpeak-text-dim truncate">{del.project_name}</p>
          </div>
          <Button
            size="sm"
            onClick={() => handleApprove(del.id)}
            disabled={approving === del.id}
            className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 shrink-0 text-xs h-7 px-3"
          >
            {approving === del.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Aprobar
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}

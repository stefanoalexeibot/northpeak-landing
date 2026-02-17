"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Save } from "lucide-react";

interface Props {
  clientId: string;
  initialNotes: string;
}

export default function ClientNotes({ clientId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("clients")
      .update({ admin_notes: notes })
      .eq("id", clientId);
    setSaving(false);
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-yellow-400" />
        <h3 className="text-sm font-medium text-northpeak-text">Notas internas</h3>
        <span className="text-[10px] text-northpeak-text-dim">(solo visible para admin)</span>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setDirty(true);
          setSaved(false);
        }}
        placeholder="Agrega notas privadas sobre este cliente..."
        className="bg-northpeak-bg border-northpeak-surface text-northpeak-text text-sm min-h-[80px] resize-y"
      />
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSave}
          disabled={saving || !dirty}
          size="sm"
          className="bg-northpeak-green text-northpeak-bg hover:bg-northpeak-green/90 text-xs h-8"
        >
          <Save className="h-3 w-3 mr-1" />
          {saving ? "Guardando..." : "Guardar notas"}
        </Button>
        {saved && (
          <span className="text-xs text-northpeak-green">Guardado</span>
        )}
      </div>
    </div>
  );
}

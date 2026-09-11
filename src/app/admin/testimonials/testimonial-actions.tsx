"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, Globe, Trash2, X } from "lucide-react";

interface Props {
  id: string;
  isApproved: boolean;
  isPublished: boolean;
}

export default function TestimonialActions({ id, isApproved, isPublished }: Props) {
  const router = useRouter();
  const supabase = createClient();

  async function toggleApproval() {
    await supabase.from("testimonials").update({ is_approved: !isApproved }).eq("id", id);
    router.refresh();
  }

  async function togglePublish() {
    await supabase.from("testimonials").update({ is_published: !isPublished }).eq("id", id);
    router.refresh();
  }

  async function handleDelete() {
    await supabase.from("testimonials").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleApproval}
        className={`text-xs border-northpeak-surface ${isApproved ? "text-northpeak-green" : "text-northpeak-text-muted"}`}
      >
        {isApproved ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
        {isApproved ? "Aprobada" : "Aprobar"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={togglePublish}
        className={`text-xs border-northpeak-surface ${isPublished ? "text-northpeak-blue" : "text-northpeak-text-muted"}`}
      >
        <Globe className="h-3 w-3 mr-1" />
        {isPublished ? "Publicada" : "Publicar"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        className="text-xs text-northpeak-text-muted hover:text-red-400"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Eliminar
      </Button>
    </div>
  );
}

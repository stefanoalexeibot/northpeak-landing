"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";

interface Deliverable {
  name: string;
  order_index: number;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  deliverables?: Deliverable[];
}

interface Props {
  project: Project;
  clientId: string;
}

export default function DuplicateProject({ project, clientId }: Props) {
  const [duplicating, setDuplicating] = useState(false);
  const router = useRouter();

  async function handleDuplicate() {
    setDuplicating(true);
    const supabase = createClient();

    const { data: newProject } = await supabase
      .from("projects")
      .insert({
        client_id: clientId,
        name: `${project.name} (copia)`,
        description: project.description || null,
        status: "planning",
      })
      .select()
      .single();

    if (newProject && project.deliverables && project.deliverables.length > 0) {
      const deliverables = project.deliverables.map((d) => ({
        project_id: newProject.id,
        name: d.name,
        order_index: d.order_index,
        status: "pending",
      }));

      await supabase.from("deliverables").insert(deliverables);
    }

    setDuplicating(false);
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDuplicate}
      disabled={duplicating}
      className="text-northpeak-text-muted hover:text-northpeak-green h-8 w-8"
      title="Duplicar proyecto"
    >
      {duplicating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

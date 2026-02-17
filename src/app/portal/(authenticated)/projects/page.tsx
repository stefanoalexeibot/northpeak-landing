import { getClientData } from "@/lib/supabase/get-client-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FolderOpen, ChevronRight } from "lucide-react";

const statusColors: Record<string, string> = {
  planning: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  review: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  paused: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const statusLabels: Record<string, string> = {
  planning: "Planeación",
  in_progress: "En progreso",
  review: "Revisión",
  completed: "Completado",
  paused: "Pausado",
};

export default async function ProjectsPage() {
  const { supabase, client } = await getClientData();

  const { data: projects } = await supabase
    .from("projects")
    .select("*, deliverables(id, status)")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Proyectos</h1>
        <p className="text-northpeak-text-muted mt-1">Sigue el progreso de tus proyectos</p>
      </div>

      {!projects || projects.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-12 w-12 text-northpeak-text-dim mx-auto mb-4" />
            <p className="text-northpeak-text-muted">Aún no tienes proyectos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const total = project.deliverables?.length || 0;
            const completed = project.deliverables?.filter((d: { status: string }) => d.status === "completed").length || 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Link key={project.id} href={`/portal/projects/${project.id}`}>
                <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 transition-colors cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-northpeak-text truncate">{project.name}</h3>
                        {project.description && (
                          <p className="text-xs text-northpeak-text-muted mt-0.5 truncate">{project.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <Badge className={statusColors[project.status] || ""}>
                          {statusLabels[project.status] || project.status}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-northpeak-text-dim" />
                      </div>
                    </div>
                    {total > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-northpeak-text-muted">{completed}/{total} entregables</span>
                          <span className="text-northpeak-green font-mono">{progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-northpeak-surface overflow-hidden">
                          <div
                            className="h-full rounded-full bg-northpeak-green transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

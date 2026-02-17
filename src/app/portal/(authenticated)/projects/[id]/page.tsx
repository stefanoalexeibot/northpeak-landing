import { getClientData } from "@/lib/supabase/get-client-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  planning: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  review: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  paused: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  pending: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const statusLabels: Record<string, string> = {
  planning: "Planeación",
  in_progress: "En progreso",
  review: "Revisión",
  completed: "Completado",
  paused: "Pausado",
  pending: "Pendiente",
};

const statusIcons: Record<string, typeof CheckCircle> = {
  pending: Clock,
  in_progress: Loader2,
  review: AlertCircle,
  completed: CheckCircle,
};

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { supabase, client } = await getClientData();

  const { data: project } = await supabase
    .from("projects")
    .select("*, deliverables(*)")
    .eq("id", params.id)
    .eq("client_id", client.id)
    .single();

  if (!project) notFound();

  const deliverables = (project.deliverables || []).sort(
    (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
  );
  const total = deliverables.length;
  const completed = deliverables.filter((d: { status: string }) => d.status === "completed").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/portal/projects">
          <Button variant="ghost" size="icon" className="text-northpeak-text-muted hover:text-northpeak-text">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-heading font-bold text-northpeak-text">{project.name}</h1>
            <Badge className={statusColors[project.status]}>
              {statusLabels[project.status]}
            </Badge>
          </div>
          {project.description && (
            <p className="text-northpeak-text-muted mt-1">{project.description}</p>
          )}
        </div>
      </div>

      {/* Progress card */}
      {total > 0 && (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-northpeak-text-muted">Progreso general</p>
              <p className="text-2xl font-bold font-mono text-northpeak-green">{progress}%</p>
            </div>
            <div className="h-3 rounded-full bg-northpeak-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-northpeak-green to-northpeak-blue transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-northpeak-text-dim mt-2">
              {completed} de {total} entregables completados
            </p>
          </CardContent>
        </Card>
      )}

      {/* Deliverables */}
      <Card className="bg-northpeak-card border-northpeak-surface">
        <CardHeader>
          <CardTitle className="text-northpeak-text font-heading">Entregables</CardTitle>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <p className="text-northpeak-text-muted text-sm">No hay entregables definidos.</p>
          ) : (
            <div className="space-y-2">
              {deliverables.map((del: { id: string; name: string; status: string; description?: string }) => {
                const Icon = statusIcons[del.status] || Clock;
                return (
                  <div
                    key={del.id}
                    className={`flex items-center gap-3 rounded-lg p-3 ${
                      del.status === "completed" ? "bg-green-500/5" : "bg-northpeak-bg"
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${
                      del.status === "completed" ? "text-green-400" :
                      del.status === "in_progress" ? "text-yellow-400" :
                      del.status === "review" ? "text-purple-400" :
                      "text-northpeak-text-dim"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        del.status === "completed" ? "text-northpeak-text-muted line-through" : "text-northpeak-text"
                      }`}>
                        {del.name}
                      </p>
                      {del.description && (
                        <p className="text-xs text-northpeak-text-dim mt-0.5">{del.description}</p>
                      )}
                    </div>
                    <Badge className={`${statusColors[del.status]} text-[10px]`}>
                      {statusLabels[del.status]}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

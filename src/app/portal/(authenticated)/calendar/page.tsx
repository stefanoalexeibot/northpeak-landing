import { getClientData } from "@/lib/supabase/get-client-data";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import ProjectCalendar from "@/components/portal/project-calendar";
import type { ProjectMilestone } from "@/lib/types";

export default async function CalendarPage() {
  const { supabase, client } = await getClientData();

  // Get milestones for all client projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("client_id", client.id);

  let milestones: (ProjectMilestone & { project?: { id: string; name: string } })[] = [];
  if (projects && projects.length > 0) {
    const projectIds = projects.map(p => p.id);
    const { data: ms } = await supabase
      .from("project_milestones")
      .select("*")
      .in("project_id", projectIds)
      .order("due_date");

    milestones = (ms || []).map(m => ({
      ...m,
      project: projects.find(p => p.id === m.project_id),
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Calendario</h1>
        <p className="text-northpeak-text-muted mt-1">Hitos y fechas importantes de tus proyectos</p>
      </div>

      {milestones.length === 0 && (!projects || projects.length === 0) ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <CalendarDays className="h-12 w-12 text-northpeak-text-dim mx-auto mb-4" />
            <p className="text-northpeak-text-muted">No hay hitos de proyecto registrados.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-6">
            <ProjectCalendar milestones={milestones} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { getClientData } from "@/lib/supabase/get-client-data";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import ProjectCalendar, { type CalendarEvent } from "@/components/portal/project-calendar";

export default async function CalendarPage() {
  const { supabase, client } = await getClientData();

  const events: CalendarEvent[] = [];

  // Project milestones
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("client_id", client.id);

  if (projects && projects.length > 0) {
    const projectIds = projects.map(p => p.id);
    const { data: ms } = await supabase
      .from("project_milestones")
      .select("*")
      .in("project_id", projectIds)
      .order("due_date");

    for (const m of ms || []) {
      const proj = projects.find(p => p.id === m.project_id);
      events.push({
        id: `ms-${m.id}`,
        title: m.title,
        date: m.due_date,
        type: "milestone",
        completed: m.completed,
        subtitle: proj?.name,
      });
    }

    // Project end dates
    const { data: projFull } = await supabase
      .from("projects")
      .select("id, name, end_date, status")
      .eq("client_id", client.id)
      .not("end_date", "is", null);

    for (const p of projFull || []) {
      if (p.end_date) {
        events.push({
          id: `proj-${p.id}`,
          title: `Entrega: ${p.name}`,
          date: p.end_date,
          type: "project",
          completed: p.status === "completed",
        });
      }
    }
  }

  // Deliverables with scheduled_date
  if (projects && projects.length > 0) {
    const projectIds = projects.map(p => p.id);
    const { data: deliverables } = await supabase
      .from("deliverables")
      .select("id, name, status, scheduled_date, project_id")
      .in("project_id", projectIds)
      .not("scheduled_date", "is", null)
      .order("scheduled_date");

    for (const del of deliverables || []) {
      if (del.scheduled_date) {
        const proj = projects.find(p => p.id === del.project_id);
        events.push({
          id: `del-${del.id}`,
          title: del.name,
          date: del.scheduled_date,
          type: "entregable",
          completed: del.status === "completed",
          subtitle: proj?.name,
        });
      }
    }
  }

  // Payments with due_date
  const { data: payments } = await supabase
    .from("payments")
    .select("id, concept, amount, status, due_date")
    .eq("client_id", client.id)
    .not("due_date", "is", null)
    .order("due_date");

  for (const pay of payments || []) {
    if (pay.due_date) {
      events.push({
        id: `pay-${pay.id}`,
        title: pay.concept,
        date: pay.due_date,
        type: "payment",
        completed: pay.status === "completed",
        amount: pay.amount,
        subtitle: pay.status === "completed" ? "Pagado" : "Pendiente",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-northpeak-text">Calendario</h1>
        <p className="text-northpeak-text-muted mt-1">Hitos, entregas y fechas de pago</p>
      </div>

      {events.length === 0 ? (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-12 text-center">
            <CalendarDays className="h-12 w-12 text-northpeak-text-dim mx-auto mb-4" />
            <p className="text-northpeak-text-muted">No hay fechas registradas aún.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-northpeak-card border-northpeak-surface">
          <CardContent className="p-6">
            <ProjectCalendar events={events} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

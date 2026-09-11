"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { status: string; count: number }[];
}

const statusLabels: Record<string, string> = {
  planning: "Planeación",
  in_progress: "En progreso",
  review: "Revisión",
  completed: "Completado",
  paused: "Pausado",
};

export default function ProjectsChart({ data }: Props) {
  const formatted = data.map(d => ({ ...d, label: statusLabels[d.status] || d.status }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#161821" />
          <XAxis dataKey="label" stroke="#7A7D8A" fontSize={11} />
          <YAxis stroke="#7A7D8A" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0C0D12", border: "1px solid #161821", borderRadius: 8, color: "#E8E9ED" }}
            labelStyle={{ color: "#7A7D8A" }}
          />
          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Proyectos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { month: string; count: number }[];
}

export default function ClientsChart({ data }: Props) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#161821" />
          <XAxis dataKey="month" stroke="#7A7D8A" fontSize={12} />
          <YAxis stroke="#7A7D8A" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0C0D12", border: "1px solid #161821", borderRadius: 8, color: "#E8E9ED" }}
            labelStyle={{ color: "#7A7D8A" }}
          />
          <Line type="monotone" dataKey="count" stroke="#00E5A0" strokeWidth={2} dot={{ fill: "#00E5A0", r: 4 }} name="Clientes" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

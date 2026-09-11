"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { month: string; count: number }[];
}

export default function ReferralsChart({ data }: Props) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#161821" />
          <XAxis dataKey="month" stroke="#7A7D8A" fontSize={12} />
          <YAxis stroke="#7A7D8A" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0C0D12", border: "1px solid #161821", borderRadius: 8, color: "#E8E9ED" }}
            labelStyle={{ color: "#7A7D8A" }}
          />
          <Area type="monotone" dataKey="count" stroke="#A855F7" fill="#A855F7" fillOpacity={0.15} strokeWidth={2} name="Referidos" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

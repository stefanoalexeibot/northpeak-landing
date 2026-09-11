"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { month: string; amount: number }[];
}

export default function RevenueChart({ data }: Props) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#161821" />
          <XAxis dataKey="month" stroke="#7A7D8A" fontSize={12} />
          <YAxis stroke="#7A7D8A" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0C0D12", border: "1px solid #161821", borderRadius: 8, color: "#E8E9ED" }}
            labelStyle={{ color: "#7A7D8A" }}
            formatter={(value) => [`$${Number(value ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`, "Ingresos"]}
          />
          <Area type="monotone" dataKey="amount" stroke="#00E5A0" fill="#00E5A0" fillOpacity={0.1} strokeWidth={2} name="Ingresos" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

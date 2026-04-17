import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { currency } from "../../lib/utils";

export function SpendingChart({ data = [] }) {
  return (
    <div className="chart-wrap h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="categoryName" stroke="#6b7b8d" tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7b8d" tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#101723", borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)" }}
            formatter={(value) => currency(value)}
          />
          <Bar dataKey="spent" fill="#22d3ee" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

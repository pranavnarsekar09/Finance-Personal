import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { currency } from "../../lib/utils";

export function SpendingChart({ data = [] }) {
  return (
    <div className="chart-wrap h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="categoryName" stroke="#64748b" tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" tickFormatter={(value) => `Rs ${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", boxShadow: "0 16px 32px rgba(15, 23, 42, 0.08)" }}
            formatter={(value) => currency(value)}
          />
          <Bar dataKey="spent" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

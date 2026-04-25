import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#0ea5e9", "#34d399", "#fb7185"];

export function MacroChart({ protein = 0, carbs = 0, fat = 0 }) {
  const data = [
    { name: "Protein", value: protein },
    { name: "Carbs", value: carbs },
    { name: "Fat", value: fat },
  ];

  return (
    <div className="chart-wrap h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", boxShadow: "0 16px 32px rgba(15, 23, 42, 0.08)" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#22d3ee", "#3bff9f", "#fb7185"];

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
          <Tooltip
            contentStyle={{ background: "#101723", borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

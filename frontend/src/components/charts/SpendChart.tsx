import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { format, parseISO } from "date-fns";
import { formatRupees } from "@/lib/utils";
import type { DailySpendSummary } from "@/lib/types";

interface SpendChartProps {
  data: DailySpendSummary[];
}

export function SpendChart({ data }: SpendChartProps) {
  const chartData = data.map((d) => ({
    d: format(parseISO(d.date), "EEE"),
    v: d.amount ?? 0,
    fullDate: format(parseISO(d.date), "MMM d"),
  }));
  
  const max = chartData.length > 0 ? Math.max(...chartData.map((s) => s.v)) : 0;
  const total = chartData.reduce((a, b) => a + b.v, 0);

  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Daily Spend</div>
          <div className="font-display text-2xl font-bold mt-1">{formatRupees(total)}</div>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-full bg-secondary">This cycle</div>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="d" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-surface-dark text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-float">
                      {payload[0].payload.fullDate}: {formatRupees(payload[0].value as number)}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="v" radius={[8, 8, 8, 8]} barSize={32}>
              {chartData.map((s, i) => (
                <Cell key={i} fill={s.v === max && s.v > 0 ? "hsl(var(--surface-dark))" : "hsl(var(--mint))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

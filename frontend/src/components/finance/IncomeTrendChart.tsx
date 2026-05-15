import { useMemo } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatRupees } from "@/lib/utils";
import { Income } from "@/lib/types";
import { generateMonthlyTrends } from "./incomeUtils";
import { motion } from "framer-motion";

interface IncomeTrendChartProps {
  incomes: Income[];
  isLoading?: boolean;
}

export function IncomeTrendChart({ incomes, isLoading = false }: IncomeTrendChartProps) {
  const trends = useMemo(() => generateMonthlyTrends(incomes, 6), [incomes]);

  const total = trends.reduce((acc, t) => acc + t.total, 0);
  const avg = trends.length > 0 ? total / trends.length : 0;

  if (isLoading) {
    return (
      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 mb-6 border border-primary/5">
        <div className="h-56 bg-secondary/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-card rounded-[1.75rem] shadow-soft p-5 mb-6 border border-primary/5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Income Flow
          </div>
          <div className="font-display text-2xl font-bold mt-1">{formatRupees(total)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Last 6 months total</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Monthly Avg
          </div>
          <div className="font-display text-xl font-bold text-emerald-600 mt-1">
            {formatRupees(avg)}
          </div>
        </div>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--emerald-500))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--emerald-500))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              cursor={{ stroke: "hsl(var(--mint))", strokeDasharray: "4 4" }}
              formatter={(value: number) => [formatRupees(value), "Income"]}
              contentStyle={{
                borderRadius: "1rem",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                boxShadow: "var(--shadow-soft)",
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="hsl(160 45% 40%)"
              strokeWidth={3}
              dot={{ r: 4, fill: "hsl(160 45% 40%)", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "hsl(160 35% 18%)", strokeWidth: 2, stroke: "hsl(160 45% 50%)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-2 px-1">
        {trends.map((trend) => (
          <div key={trend.month} className="text-center">
            <div className="text-[10px] font-bold text-muted-foreground">{trend.month}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
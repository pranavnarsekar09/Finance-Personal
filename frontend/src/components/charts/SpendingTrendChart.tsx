import { useState } from "react";
import {
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isSameYear,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatRupees } from "@/lib/utils";
import type { Expense } from "@/lib/types";

type TrendView = "week" | "month" | "year";

interface SpendingTrendChartProps {
  expenses: Expense[];
  isLoading?: boolean;
}

export function SpendingTrendChart({ expenses, isLoading = false }: SpendingTrendChartProps) {
  const [view, setView] = useState<TrendView>("week");
  const now = new Date();
  const expenseRows = expenses.map((expense) => ({ ...expense, parsedDate: parseISO(expense.date) }));

  const weeklyData = Array.from({ length: 7 }, (_, index) => {
    const date = subDays(endOfWeek(now, { weekStartsOn: 1 }), 6 - index);
    const total = expenseRows
      .filter((expense) => isSameDay(expense.parsedDate, date))
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      label: format(date, "EEE"),
      amount: total,
    };
  });

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = monthEnd.getDate();
  const monthlyData = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), index + 1);
    const total = expenseRows
      .filter((expense) => isSameDay(expense.parsedDate, date))
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      label: format(date, "d"),
      amount: total,
    };
  });

  const yearlyData = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), index, 1);
    const total = expenseRows
      .filter((expense) => isSameMonth(expense.parsedDate, date) && isSameYear(expense.parsedDate, date))
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      label: format(date, "MMM"),
      amount: total,
    };
  });

  const chartMap = {
    week: weeklyData,
    month: monthlyData,
    year: yearlyData,
  };

  const activeData = chartMap[view];
  const total = activeData.reduce((sum, point) => sum + point.amount, 0);
  const subtitle =
    view === "week"
      ? `${format(startOfWeek(now, { weekStartsOn: 1 }), "d MMM")} - ${format(endOfWeek(now, { weekStartsOn: 1 }), "d MMM")}`
      : view === "month"
        ? format(now, "MMMM yyyy")
        : format(now, "yyyy");

  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Spending Trend</div>
          <div className="font-display text-2xl font-bold mt-1">{formatRupees(total)}</div>
          <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
        </div>
        <div className="bg-secondary rounded-full p-1 flex shrink-0">
          {(["week", "month", "year"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setView(option)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${view === option ? "bg-card shadow-soft text-primary" : "text-muted-foreground"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-56 rounded-2xl bg-secondary/50 animate-pulse" />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border) / 0.35)" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={view === "month" ? 14 : 8}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={42}
                tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                cursor={{ stroke: "hsl(var(--mint))", strokeDasharray: "4 4" }}
                formatter={(value: number) => [formatRupees(value), "Spend"]}
                contentStyle={{
                  borderRadius: "1rem",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--mint))"
                strokeWidth={3}
                dot={{ r: 3, fill: "hsl(var(--mint))" }}
                activeDot={{ r: 5, fill: "hsl(var(--surface-dark))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

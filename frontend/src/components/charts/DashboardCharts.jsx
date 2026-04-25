import { useMemo, useState, memo } from "react";
import {
  Area,
  AreaChart,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { AppCard, PillTabs, SectionHeader } from "../../ui/fintech";
import { currency } from "../../lib/utils";

const COLORS = ["#0ea5e9", "#22c55e", "#8b5cf6", "#f97316", "#f43f5e", "#14b8a6"];
const PERIODS = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{currency(payload[0].value)}</p>
    </div>
  );
};

export const DashboardCharts = memo(function DashboardCharts({ dailySpending = [], categorySpending = [] }) {
  const [period, setPeriod] = useState("week");
  const sorted = useMemo(
    () => [...dailySpending].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [dailySpending],
  );

  const lineData = useMemo(() => {
    if (!sorted.length) {
      return [];
    }

    if (period === "week") {
      return sorted.slice(-7).map((item) => ({
        ...item,
        label: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(new Date(item.date)),
      }));
    }

    if (period === "month") {
      return sorted.map((item) => ({
        ...item,
        label: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(item.date)),
      }));
    }

    const monthMap = new Map();
    sorted.forEach((item) => {
      const label = new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(item.date));
      monthMap.set(label, (monthMap.get(label) || 0) + item.amount);
    });
    return [...monthMap.entries()].map(([label, amount]) => ({ label, amount }));
  }, [period, sorted]);

  const activePointIndex = Math.max(0, lineData.length - 1);
  const categoryData = categorySpending.filter((entry) => entry.spent > 0);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <AppCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <SectionHeader
            eyebrow="Statistics"
            title="Spending trend"
            description="Track movement over time with a cleaner financial view."
          />
          <PillTabs items={PERIODS} value={period} onChange={setPeriod} />
        </div>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineData}>
              <defs>
                <linearGradient id="spendFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
              <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} tickFormatter={(value) => `Rs ${value}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#7dd3fc", strokeDasharray: "3 3" }} />
              <Area type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} fill="url(#spendFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {lineData[activePointIndex] ? (
          <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Latest</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {lineData[activePointIndex].label}: {currency(lineData[activePointIndex].amount)}
            </p>
          </div>
        ) : null}
      </AppCard>

      <AppCard>
        <SectionHeader
          eyebrow="Categories"
          title="Top split"
          description="See which budgets are absorbing the month."
        />
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="categoryName" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
              <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} tickFormatter={(value) => `Rs ${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="spent" radius={[12, 12, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={entry.categoryName} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AppCard>
    </div>
  );
});

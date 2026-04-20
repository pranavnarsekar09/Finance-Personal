import { useState, useMemo, memo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { currency, haptic } from "../../lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const COLORS = ["#22d3ee", "#34d399", "#818cf8", "#f472b6", "#fbbf24", "#a78bfa"];

export const DashboardCharts = memo(function DashboardCharts({ dailySpending = [], categorySpending = [] }) {
  const [weekOffset, setWeekOffset] = useState(0);

  // Group daily spending into weeks (7-day chunks)
  const weeks = useMemo(() => {
    const sorted = [...dailySpending].sort((a, b) => new Date(a.date) - new Date(b.date));
    const result = [];
    for (let i = 0; i < sorted.length; i += 7) {
      result.push(sorted.slice(i, i + 7));
    }
    return result.length > 0 ? result : [[]];
  }, [dailySpending]);

  // Current week data based on offset (reverse order so latest is 0)
  const currentWeekIndex = Math.max(0, Math.min(weeks.length - 1, weeks.length - 1 + weekOffset));
  const currentWeekData = weeks[currentWeekIndex].map((item) => ({
    ...item,
    formattedDate: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
      new Date(item.date)
    ),
  }));

  const nextWeek = () => {
    if (weekOffset < 0) {
      haptic(5);
      setWeekOffset((v) => v + 1);
    }
  };

  const prevWeek = () => {
    if (Math.abs(weekOffset) < weeks.length - 1) {
      haptic(5);
      setWeekOffset((v) => v - 1);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2" style={{ transform: 'translateZ(0)' }}>
      {/* Weekly Spending Trend */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Weekly Trend</h3>
            <p className="text-xs text-slate-500">Week {currentWeekIndex + 1} of {weeks.length}</p>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={prevWeek} 
              disabled={Math.abs(weekOffset) >= weeks.length - 1}
              className="rounded-lg bg-white/5 p-1 text-white disabled:opacity-20"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextWeek} 
              disabled={weekOffset === 0}
              className="rounded-lg bg-white/5 p-1 text-white disabled:opacity-20"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="h-64 w-full" style={{ contain: 'layout size' }}>
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <LineChart data={currentWeekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="formattedDate" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                formatter={(val) => currency(val)}
              />
              <Line type="monotone" dataKey="amount" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: "#22d3ee" }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Vertical Bar Chart */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-4 font-display text-lg font-bold text-white">Category Split</h3>
        <div className="h-64 w-full" style={{ contain: 'layout size' }}>
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <BarChart data={categorySpending.filter((c) => c.spent > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="categoryName" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `₹${val}`} 
              />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                formatter={(val) => currency(val)}
              />
              <Bar dataKey="spent" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {categorySpending.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

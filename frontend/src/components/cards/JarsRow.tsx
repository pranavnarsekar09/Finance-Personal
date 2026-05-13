import { useGoals } from "@/hooks/useApi";
import type { Goal } from "@/lib/types";

const colorMap: Record<number, { bg: string; bar: string }> = {
  0: { bg: "bg-mint", bar: "bg-mint" },
  1: { bg: "bg-coral", bar: "bg-coral" },
  2: { bg: "bg-sun", bar: "bg-sun" },
  3: { bg: "bg-sky-pastel", bar: "bg-sky-pastel" },
  4: { bg: "bg-lavender", bar: "bg-lavender" },
};

export function JarsRow() {
  const { data: goals, isLoading } = useGoals();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card rounded-2xl shadow-soft p-3 h-28" />
        ))}
      </div>
    );
  }

  const savingsGoals = (goals || []).filter((goal: Goal) => goal.type === "SAVINGS");

  if (savingsGoals.length === 0) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Savings Jars</span>
        <button className="text-xs text-muted-foreground hover:text-primary transition">View All</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {savingsGoals.map((j: Goal, i: number) => {
          const c = colorMap[i % 5];
          const pct = Math.min(100, j.progress || (j.targetAmount > 0 ? (j.currentAmount / j.targetAmount) * 100 : 0));
          return (
            <div key={j.id} className="bg-card rounded-2xl shadow-soft p-3 border border-border/30 hover:border-mint/20 transition-all duration-200 group">
              <div className={`h-7 w-7 rounded-full ${c.bg} mb-2 shadow-sm`} />
              <div className="text-xs font-semibold truncate">Savings Goal</div>
              <div className="text-[10px] text-muted-foreground mb-2">Target: ₹{Math.round(j.targetAmount)}</div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden shadow-inner">
                <div className={`h-full ${c.bar} rounded-full shadow-sm`} style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{Math.round(pct)}%</div>
            </div>
          ); 
        })}
      </div>
    </div>
  );
}

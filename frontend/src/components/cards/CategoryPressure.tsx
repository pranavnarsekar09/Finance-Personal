import { formatRupees } from "@/lib/utils";
import type { CategorySpendSummary } from "@/lib/types";

interface CategoryPressureProps {
  data: CategorySpendSummary[];
}

const colorMap: Record<number, { from: string; to: string }> = {
  0: { from: "hsl(145 45% 70%)", to: "hsl(160 40% 60%)" },
  1: { from: "hsl(42 90% 70%)", to: "hsl(45 85% 60%)" },
  2: { from: "hsl(200 70% 75%)", to: "hsl(200 65% 65%)" },
  3: { from: "hsl(260 50% 80%)", to: "hsl(270 45% 70%)" },
  4: { from: "hsl(8 80% 72%)", to: "hsl(15 75% 65%)" },
};

function getBarColor(index: number, over: boolean) {
  if (over) {
    return { from: "hsl(8 80% 72%)", to: "hsl(350 75% 65%)" };
  }
  return colorMap[index % 5];
}

export function CategoryPressure({ data }: CategoryPressureProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5 border border-border/30">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Category Pressure</div>
      <div className="space-y-4">
        {data.map((c, i) => {
          const pct = c.budget > 0 ? Math.min(100, (c.spent / c.budget) * 100) : 0;
          const over = c.spent > c.budget && c.budget > 0;
          const colors = getBarColor(i, over);
          
          return (
            <div key={c.categoryName}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center text-sm font-medium border border-border/30">
                    {c.categoryName.substring(0, 2)}
                  </div>
                  <span className="text-sm font-medium">{c.categoryName}</span>
                </div>
                <span className={`text-sm font-medium ${over ? "text-coral" : ""}`}>
                  {formatRupees(c.spent)}
                  <span className="text-muted-foreground text-[10px]"> / {formatRupees(c.budget)}</span>
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden ml-9 shadow-inner">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${pct}%`,
                    background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
                    boxShadow: over ? `0 0 8px hsl(8 80% 72% / 0.4)` : 'none'
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

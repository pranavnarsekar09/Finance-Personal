import { formatRupees } from "@/lib/utils";
import type { CategorySpendSummary } from "@/lib/types";

interface CategoryPressureProps {
  data: CategorySpendSummary[];
}

const colorMap: Record<number, string> = {
  0: "bg-mint",
  1: "bg-sun",
  2: "bg-sky-pastel",
  3: "bg-lavender",
  4: "bg-coral",
};

export function CategoryPressure({ data }: CategoryPressureProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Category Pressure</div>
      <div className="space-y-4">
        {data.map((c, i) => {
          const pct = c.budget > 0 ? Math.min(100, (c.spent / c.budget) * 100) : 0;
          const over = c.spent > c.budget && c.budget > 0;
          return (
            <div key={c.categoryName}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-sm">
                    {c.categoryName.substring(0, 2)}
                  </div>
                  <span className="text-sm font-medium">{c.categoryName}</span>
                </div>
                <span className={`text-sm font-medium ${over ? "text-coral" : ""}`}>
                  {formatRupees(c.spent)}
                  <span className="text-muted-foreground text-[10px]"> / {formatRupees(c.budget)}</span>
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden ml-9">
                <div 
                  className={`h-full rounded-full ${over ? "bg-coral" : (colorMap[i % 5] || "bg-mint")}`} 
                  style={{ width: `${pct}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

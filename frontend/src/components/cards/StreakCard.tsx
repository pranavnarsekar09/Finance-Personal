import { Flame } from "lucide-react";

interface StreakCardProps {
  streak: number;
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-coral" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Streak</span>
        </div>
        <span className="font-display text-2xl font-bold">{streak}d</span>
      </div>
      <div className="flex gap-1.5">
        {[...Array(7)].map((_, i) => (
          <div key={i} className={`flex-1 h-9 rounded-full flex items-center justify-center text-[10px] font-bold ${i < streak % 7 ? "bg-mint text-primary" : "bg-secondary text-muted-foreground"}`}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CalorieBarProps {
  eaten: number;
  goal: number;
}

export function CalorieBar({ eaten, goal }: CalorieBarProps) {
  const pct = Math.min((eaten / goal) * 100, 100);
  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Calories Today</span>
        <span className="text-sm font-medium">{Math.round(eaten)} / {goal} kcal</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-gradient-mint rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
import { Flame } from "lucide-react";

interface StreakCardProps {
  streak: number;
  isTodayActive?: boolean;
}

export function StreakCard({ streak, isTodayActive = false }: StreakCardProps) {
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // 0=M, 1=T, ..., 5=S, 6=S

  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5 border border-border/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-coral/15 flex items-center justify-center">
            <Flame className="h-4 w-4 text-coral" />
          </div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Streak</span>
        </div>
        <span className="font-display text-2xl font-bold text-coral">{streak}d</span>
      </div>
      <div className="flex gap-1.5">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
          const isActive = isTodayActive 
            ? (i <= currentDayIndex && i > currentDayIndex - streak)
            : (i < currentDayIndex && i >= currentDayIndex - streak);
          const isToday = i === currentDayIndex;
          
          return (
            <div 
              key={i} 
              className={`flex-1 h-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                isActive 
                  ? "bg-gradient-to-br from-mint to-emerald-400 text-primary shadow-md shadow-mint/30" 
                  : isToday 
                    ? "bg-secondary/50 text-muted-foreground ring-1 ring-coral/30"
                    : "bg-secondary/50 text-muted-foreground/50"
              }`}
            >
              {day}
            </div>
          );
        })}
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
  const isOver = eaten > goal;
  
  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-5 border border-border/30">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Calories Today</span>
        <span className={`text-sm font-medium ${isOver ? "text-coral" : ""}`}>{Math.round(eaten)} / {goal} kcal</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-gradient-to-r from-coral to-rose-500" : "bg-gradient-to-r from-mint to-emerald-400"}`} 
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
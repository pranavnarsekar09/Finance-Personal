import { useState, useContext, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDashboard, useFoodLogs, useDeleteFoodLog } from "@/hooks/useApi";
import { useSwipeNative } from "@/hooks/useSwipe";
import { useHaptic } from "@/hooks/useHaptic";
import { Camera, Utensils, UtensilsCrossed, Trash2 } from "lucide-react";
import { format, parseISO, isSameWeek, subDays } from "date-fns";
import type { FoodLog } from "@/lib/types";
import { SheetContext } from "@/context/SheetContext";

export default function Health() {
  const { setMealOpen, setAnalyzeOpen } = useContext(SheetContext);
  const [view, setView] = useState<"today" | "week">("today");
  const [direction, setDirection] = useState(0);
  const { medium } = useHaptic();
  
  const month = format(new Date(), "yyyy-MM");
  const todayStr = format(new Date(), "yyyy-MM-dd");
  
  const { data: dashboard, isLoading: dashLoading } = useDashboard(undefined, month, todayStr);
  const { data: foodLogs, isLoading: logsLoading } = useFoodLogs(undefined, month);
  const deleteFoodLog = useDeleteFoodLog();

  const pageVariants = {
    initial: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.24, ease: "easeOut" } },
    exit: (dir: number) => ({ x: dir > 0 ? -20 : 20, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }),
  };

  const changeView = (nextView: "today" | "week") => {
    setDirection(nextView === "week" ? 1 : -1);
    setView(nextView);
    medium();
  };

  useSwipeNative({
    onSwipeLeft: () => {
      if (view === "today") {
        changeView("week");
      }
    },
    onSwipeRight: () => {
      if (view === "week") {
        changeView("today");
      }
    },
    threshold: 50,
    scopeSelector: "[data-health-swipe='true']",
  });

  const todaysLogs = (foodLogs || []).filter((l: FoodLog) => l.date === todayStr);

  const arcs = [
    { label: "Cal", value: dashboard?.caloriesToday || 0, goal: dashboard?.calorieGoal || 2000, color: "hsl(var(--mint))" },
    { label: "Protein", value: todaysLogs.reduce((acc, l) => acc + (l.protein || 0), 0), goal: 150, color: "hsl(var(--coral))" },
    { label: "Carbs", value: todaysLogs.reduce((acc, l) => acc + (l.carbs || 0), 0), goal: 250, color: "hsl(var(--sun))" },
    { label: "Fat", value: todaysLogs.reduce((acc, l) => acc + (l.fat || 0), 0), goal: 80, color: "hsl(var(--sky))" },
  ];

  const remainingKcal = Math.max(0, (dashboard?.calorieGoal || 2000) - (dashboard?.caloriesToday || 0));

  // --- WEEK VIEW LOGIC ---
  const { 
    weeklyAvgKcal, 
    avgProtein, 
    avgCarbs, 
    avgFat, 
    avgFiber,
    dailyHistory 
  } = useMemo(() => {
    if (!foodLogs || foodLogs.length === 0) {
      return { weeklyAvgKcal: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0, avgFiber: 0, dailyHistory: [] };
    }

    // Group logs by date
    const grouped = foodLogs.reduce((acc: Record<string, FoodLog[]>, log: FoodLog) => {
      const d = log.date.split('T')[0];
      if (!acc[d]) acc[d] = [];
      acc[d].push(log);
      return acc;
    }, {});

    const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    
    let totalKcal = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    const daysCount = dates.length;

    const history = dates.map(dateStr => {
      const logs = grouped[dateStr];
      const dayKcal = logs.reduce((sum, l) => sum + (l.calories || 0), 0);
      const dayProtein = logs.reduce((sum, l) => sum + (l.protein || 0), 0);
      const dayCarbs = logs.reduce((sum, l) => sum + (l.carbs || 0), 0);
      const dayFat = logs.reduce((sum, l) => sum + (l.fat || 0), 0);
      
      totalKcal += dayKcal;
      totalProtein += dayProtein;
      totalCarbs += dayCarbs;
      totalFat += dayFat;

      return {
        dateStr,
        dayKcal,
        mealsCount: logs.length,
        mealNames: logs.map(l => l.foodName?.trim() || "Food").join(", ")
      };
    });

    return {
      weeklyAvgKcal: Math.round(totalKcal / daysCount) || 0,
      avgProtein: Math.round(totalProtein / daysCount) || 0,
      avgCarbs: Math.round(totalCarbs / daysCount) || 0,
      avgFat: Math.round(totalFat / daysCount) || 0,
      avgFiber: Math.round((totalCarbs * 0.15) / daysCount) || 0, // Mocking fiber as 15% of carbs for UI parity
      dailyHistory: history
    };
  }, [foodLogs]);

  return (
    <div data-health-swipe="true" className="space-y-5 touch-pan-y">
      <div className="flex justify-between items-center">
        <div className="bg-card/70 backdrop-blur rounded-full p-1 flex shadow-soft">
          <button 
            onClick={() => changeView("today")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${view === "today" ? "bg-card shadow-soft text-primary" : "text-muted-foreground"}`}
          >
            Today
          </button>
          <button 
            onClick={() => changeView("week")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${view === "week" ? "bg-card shadow-soft text-primary" : "text-muted-foreground"}`}
          >
            Week
          </button>
        </div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {view === "today" ? format(new Date(), "MMM d") : "Overview"}
        </span>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={view}
          custom={direction}
          className="space-y-5"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {view === "today" ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-5">
          <h1 className="font-display text-4xl font-bold tracking-tight">Today's Plate</h1>

          <div className="bg-card rounded-[1.75rem] shadow-soft p-6 flex flex-col items-center">
            <div className="relative w-56 h-56">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                {arcs.map((a, i) => {
                  const r = 88 - i * 14;
                  const c = 2 * Math.PI * r;
                  const pct = Math.min(1, a.value / (a.goal || 1));
                  return (
                    <g key={a.label}>
                      <circle cx="100" cy="100" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                      <circle cx="100" cy="100" r={r} fill="none" stroke={a.color} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${c * pct} ${c}`} />
                    </g>
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Remaining</div>
                <div className="font-display text-4xl font-bold">{Math.round(remainingKcal)}</div>
                <div className="text-xs text-muted-foreground">kcal</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4 w-full">
              {arcs.map((a) => (
                <div key={a.label} className="text-center">
                  <div className="h-1.5 rounded-full mx-auto w-8" style={{ background: a.color }} />
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{a.label}</div>
                  <div className="text-xs font-bold">{Math.round(a.value)}<span className="text-muted-foreground text-[10px]">/{a.goal}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setMealOpen(true)}
              className="bg-surface-dark text-primary-foreground rounded-[1.5rem] py-4 font-semibold flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-soft"
            >
              <Utensils className="h-5 w-5" />
              <span className="text-xs">Log Meal</span>
            </button>
            <button 
              onClick={() => setAnalyzeOpen(true)}
              className="bg-card text-primary rounded-[1.5rem] py-4 font-semibold flex flex-col items-center justify-center gap-2 hover:bg-secondary transition-colors shadow-soft"
            >
              <Camera className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs">AI Photo</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Meals Today</div>
            {dashLoading || logsLoading ? (
               <div className="p-10 text-center text-muted-foreground animate-pulse">Loading meals...</div>
            ) : todaysLogs.length > 0 ? (
              todaysLogs.map((m) => (
                <div key={m.id} className="bg-card rounded-2xl shadow-soft p-4 border border-white/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold">{m.foodName?.trim() || "Food"}</div>
                      <div className="text-xs text-muted-foreground">{typeof m.date === 'string' ? format(parseISO(m.date), "MMM d") : "?"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-secondary px-2.5 py-1 rounded-full text-xs font-medium">₹{m.estimatedCost?.toFixed(2) || "0.00"}</span>
                      <button
                        onClick={() => deleteFoodLog.mutate(m.id)}
                        className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        disabled={deleteFoodLog.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-mint/40 text-[10px] font-bold text-primary">{Math.round(m.calories)} kcal</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-coral/40 text-[10px] font-bold text-primary">P {Math.round(m.protein)}g</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sun/40 text-[10px] font-bold text-primary">C {Math.round(m.carbs)}g</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-pastel/40 text-[10px] font-bold text-primary">F {Math.round(m.fat)}g</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-muted-foreground border-2 border-dashed border-muted-foreground/10 rounded-2xl">
                No meals logged today.
              </div>
            )}
          </div>
        </div>
      ) : (
        // --- WEEK VIEW ---
        <div className="animate-in fade-in slide-in-from-right-2 space-y-4">
          <div className="bg-card rounded-[2rem] p-6 shadow-soft relative overflow-hidden">
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Weekly Average</div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold tracking-tight">{weeklyAvgKcal.toLocaleString()}</span>
              <span className="text-lg font-bold text-muted-foreground">kcal</span>
            </div>

            <div className="mt-12">
              <div className="flex items-center justify-end mb-1">
                <span className="text-[10px] text-muted-foreground font-bold tracking-widest">GOAL: {dashboard?.calorieGoal || 2000}</span>
              </div>
              <div className="relative h-[2px] bg-secondary w-full border-t-2 border-dashed border-muted-foreground/20"></div>
              
              <div className="flex justify-between items-end h-24 mt-4 px-2">
                {/* Mock Bar Chart for Days of Week */}
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d, i) => {
                  const h = 20 + Math.random() * 60; // Mock heights for visual parity
                  return (
                    <div key={d} className="flex flex-col items-center gap-2">
                      <div className="w-4 bg-mint/50 rounded-full" style={{ height: `${h}%` }}></div>
                      <div className="text-[9px] font-bold text-muted-foreground">{d}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-mint/20 rounded-[1.5rem] p-5 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] font-bold text-mint uppercase tracking-widest">Protein</div>
              <div className="font-display text-2xl font-bold mt-1">{avgProtein}g</div>
            </div>
            <div className="bg-coral/10 rounded-[1.5rem] p-5 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] font-bold text-coral uppercase tracking-widest">Carbs</div>
              <div className="font-display text-2xl font-bold mt-1">{avgCarbs}g</div>
            </div>
            <div className="bg-secondary rounded-[1.5rem] p-5 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fats</div>
              <div className="font-display text-2xl font-bold mt-1">{avgFat}g</div>
            </div>
            <div className="bg-mint/10 rounded-[1.5rem] p-5 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] font-bold text-mint uppercase tracking-widest">Fiber</div>
              <div className="font-display text-2xl font-bold mt-1">{avgFiber}g</div>
            </div>
          </div>

          <div className="mt-8 space-y-4 pb-6">
            <h3 className="font-display text-2xl font-bold">Daily History</h3>
            <div className="space-y-3">
              {dailyHistory.map((day) => {
                const dateObj = parseISO(day.dateStr);
                return (
                  <div key={day.dateStr} className="bg-card rounded-3xl p-4 shadow-soft flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center">
                      <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{day.mealNames}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {format(dateObj, "EEEE, MMM d")} • {day.dayKcal.toLocaleString()} kcal
                      </div>
                    </div>
                    <div className="flex gap-1 pr-2">
                      <div className="w-1.5 h-4 bg-mint/50 rounded-full" />
                      <div className="w-1.5 h-4 bg-coral/50 rounded-full" />
                      <div className="w-1.5 h-4 bg-sun/50 rounded-full" />
                    </div>
                  </div>
                );
              })}
              {dailyHistory.length === 0 && (
                <div className="p-8 text-center text-muted-foreground bg-card rounded-3xl">
                  No meal history yet.
                </div>
              )}
            </div>
            
            {dailyHistory.length > 0 && (
              <div className="text-center pt-4">
                <button className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition">
                  View Full History
                </button>
              </div>
            )}
          </div>
        </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

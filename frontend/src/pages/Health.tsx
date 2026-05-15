import { useState, useContext, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useDashboard, useFoodLogs, useDeleteFoodLog } from "@/hooks/useApi";
import { useSwipeNative } from "@/hooks/useSwipe";
import { useHaptic } from "@/hooks/useHaptic";
import { Camera, Utensils, UtensilsCrossed, Trash2, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, parseISO, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import type { FoodLog } from "@/lib/types";
import { SheetContext } from "@/context/SheetContext";
import { SubtabPillBarWithIndicator } from "@/components/layout/SubtabPillBar";
import { formatRupees, cn } from "@/lib/utils";

const HEALTH_TABS = ["today", "week", "history"] as const;
type HealthTab = (typeof HEALTH_TABS)[number];

export default function Health() {
  const { setMealOpen, setAnalyzeOpen } = useContext(SheetContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const initialTab: HealthTab = HEALTH_TABS.includes(urlTab as HealthTab) ? (urlTab as HealthTab) : "today";
  
  const [tab, setTab] = useState<HealthTab>(initialTab);
  const [direction, setDirection] = useState(0);
  const { medium } = useHaptic();

  useEffect(() => {
    if (urlTab && HEALTH_TABS.includes(urlTab as HealthTab)) {
      setTab(urlTab as HealthTab);
    }
  }, [urlTab]);

  const pageVariants = {
    initial: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.24, ease: "easeOut" } },
    exit: (dir: number) => ({ x: dir > 0 ? -20 : 20, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }),
  };

  const changeTab = (nextTab: HealthTab) => {
    const currentIndex = HEALTH_TABS.indexOf(tab);
    const nextIndex = HEALTH_TABS.indexOf(nextTab);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setTab(nextTab);
    setSearchParams({ tab: nextTab });
    medium();
  };

  useSwipeNative({
    onSwipeLeft: () => {
      const currentIndex = HEALTH_TABS.indexOf(tab);
      if (currentIndex < HEALTH_TABS.length - 1) {
        changeTab(HEALTH_TABS[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      const currentIndex = HEALTH_TABS.indexOf(tab);
      if (currentIndex > 0) {
        changeTab(HEALTH_TABS[currentIndex - 1]);
      }
    },
    threshold: 50,
    ignoreSelector: "[data-swipe-ignore]",
    scopeSelector: "[data-health-swipe='true']",
  });

  return (
    <div data-health-swipe="true" className="space-y-5 touch-pan-y">
      <div className="flex justify-between items-center">
        <SubtabPillBarWithIndicator
          tabs={HEALTH_TABS}
          activeTab={tab}
          onTabChange={changeTab}
        />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={tab}
          custom={direction}
          className="space-y-5"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {tab === "today" && <TodayTabContent />}
          {tab === "week" && <WeekTabContent />}
          {tab === "history" && <HistoryTabContent />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TodayTabContent() {
  const { setMealOpen, setAnalyzeOpen } = useContext(SheetContext);
  const month = format(new Date(), "yyyy-MM");
  const todayStr = format(new Date(), "yyyy-MM-dd");
  
  const { data: dashboard, isLoading: dashLoading } = useDashboard(undefined, month, todayStr);
  const { data: foodLogs, isLoading: logsLoading } = useFoodLogs(undefined, month);
  const deleteFoodLog = useDeleteFoodLog();

  const todaysLogs = (foodLogs || []).filter((l: FoodLog) => l.date === todayStr);

  const arcs = [
    { label: "Cal", value: dashboard?.caloriesToday || 0, goal: dashboard?.calorieGoal || 2000, color: "hsl(var(--mint))" },
    { label: "Protein", value: todaysLogs.reduce((acc, l) => acc + (l.protein || 0), 0), goal: 150, color: "hsl(var(--coral))" },
    { label: "Carbs", value: todaysLogs.reduce((acc, l) => acc + (l.carbs || 0), 0), goal: 250, color: "hsl(var(--sun))" },
    { label: "Fat", value: todaysLogs.reduce((acc, l) => acc + (l.fat || 0), 0), goal: 80, color: "hsl(var(--sky))" },
  ];

  const remainingKcal = Math.max(0, (dashboard?.calorieGoal || 2000) - (dashboard?.caloriesToday || 0));
  const totalCost = todaysLogs.reduce((acc, l) => acc + (l.estimatedCost || 0), 0);
  const isOverGoal = (dashboard?.caloriesToday || 0) > (dashboard?.calorieGoal || 2000);

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-1">
          {format(new Date(), "EEEE, d MMMM")}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Today&apos;s Plate</h1>
      </div>

      <div className="bg-card rounded-[1.75rem] shadow-soft p-6 flex flex-col items-center border border-border/30 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-24 w-24 bg-mint/20 rounded-full blur-3xl" />
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
                    strokeDashArray={`${c * pct} ${c}`} 
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: pct > 0.8 ? `drop-shadow(0 0 6px ${a.color})` : 'none'
                    }}
                  />
                </g>
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Remaining</div>
            <div className={`font-display text-4xl font-bold ${remainingKcal < 200 ? "text-coral" : ""}`}>{Math.round(remainingKcal)}</div>
            <div className="text-xs text-muted-foreground">kcal</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4 w-full">
          {arcs.map((a) => (
            <div key={a.label} className="text-center">
              <div className="h-1.5 rounded-full mx-auto w-8 shadow-sm" style={{ background: a.color, boxShadow: `0 0 8px ${a.color}40` }} />
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">{a.label}</div>
              <div className="text-xs font-bold mt-0.5">{Math.round(a.value)}<span className="text-muted-foreground text-[10px]">/{a.goal}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className={cn(
        "rounded-[1.5rem] p-4 text-center text-sm font-medium",
        isOverGoal ? "bg-coral/20 text-coral" : "bg-mint/20 text-mint"
      )}>
        {isOverGoal ? `Over by ${Math.round((dashboard?.caloriesToday || 0) - (dashboard?.calorieGoal || 2000))} kcal` : `${Math.round(remainingKcal)} kcal remaining`}
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

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-[1.5rem] shadow-soft p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Today&apos;s Spend</div>
          <div className="font-display text-xl font-bold mt-1">{formatRupees(totalCost)}</div>
        </div>
        <div className="bg-card rounded-[1.5rem] shadow-soft p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Meals Logged</div>
          <div className="font-display text-xl font-bold mt-1">{todaysLogs.length}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Meals Today</div>
        {dashLoading || logsLoading ? (
           <div className="p-10 text-center text-muted-foreground animate-pulse">Loading meals...</div>
        ) : todaysLogs.length > 0 ? (
          todaysLogs.map((m) => (
            <div key={m.id} className="bg-card rounded-2xl shadow-soft p-4 border border-white/50 hover:border-mint/30 transition-colors group">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold">{m.foodName?.trim() || "Food"}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                    {typeof m.date === 'string' ? format(parseISO(m.date), "MMM d") : "?"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-secondary/80 px-2.5 py-1 rounded-full text-xs font-medium">₹{m.estimatedCost?.toFixed(2) || "0.00"}</span>
                  <button
                    onClick={() => deleteFoodLog.mutate(m.id)}
                    className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    disabled={deleteFoodLog.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-mint/30 text-[10px] font-bold text-primary border border-mint/20">{Math.round(m.calories)} kcal</span>
                <span className="px-2.5 py-0.5 rounded-full bg-coral/20 text-[10px] font-bold text-coral border border-coral/20">P {Math.round(m.protein)}g</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sun/20 text-[10px] font-bold text-amber-600 border border-sun/20">C {Math.round(m.carbs)}g</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-pastel/20 text-[10px] font-bold text-sky-600 border border-sky-pastel/20">F {Math.round(m.fat)}g</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-muted-foreground border-2 border-dashed border-muted-foreground/10 rounded-2xl bg-secondary/30">
            <UtensilsCrossed className="h-8 w-8 mx-auto mb-3 opacity-30" />
            No meals logged today.
          </div>
        )}
      </div>
    </div>
  );
}

function WeekTabContent() {
  const month = format(new Date(), "yyyy-MM");
  const todayStr = format(new Date(), "yyyy-MM-dd");
  
  const { data: dashboard, isLoading: dashLoading } = useDashboard(undefined, month, todayStr);
  const { data: foodLogs, isLoading: logsLoading } = useFoodLogs(undefined, month);

  const { 
    weeklyAvgKcal, 
    avgProtein, 
    avgCarbs, 
    avgFat,
    dailyHistory,
    dailyData
  } = useMemo(() => {
    if (!foodLogs || foodLogs.length === 0) {
      return { weeklyAvgKcal: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0, dailyHistory: [], dailyData: [] };
    }

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
        dayProtein,
        dayCarbs,
        dayFat,
        mealsCount: logs.length,
        mealNames: logs.map(l => l.foodName?.trim() || "Food").join(", ")
      };
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayData = history.find(h => h.dateStr === dateStr);
      return {
        dateStr,
        dayLabel: format(d, "EEE"),
        dayKcal: dayData?.dayKcal || 0,
        hasData: !!dayData
      };
    });

    return {
      weeklyAvgKcal: Math.round(totalKcal / daysCount) || 0,
      avgProtein: Math.round(totalProtein / daysCount) || 0,
      avgCarbs: Math.round(totalCarbs / daysCount) || 0,
      avgFat: Math.round(totalFat / daysCount) || 0,
      dailyHistory: history,
      dailyData: last7Days
    };
  }, [foodLogs]);

  const maxKcal = Math.max(...dailyData.map(d => d.dayKcal), dashboard?.calorieGoal || 2000);

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">This Week</h1>
        <p className="text-sm text-muted-foreground mt-1">Your weekly nutrition overview</p>
      </div>

      {logsLoading ? (
        <div className="h-[300px] bg-secondary/50 rounded-[2rem] animate-pulse" />
      ) : dailyData.length > 0 ? (
        <div className="bg-card rounded-[2rem] p-6 shadow-soft relative overflow-hidden border border-border/30">
          <div className="absolute -top-10 -right-10 h-24 w-24 bg-mint/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Weekly Average</div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold tracking-tight">{weeklyAvgKcal.toLocaleString()}</span>
              <span className="text-lg font-bold text-muted-foreground">kcal</span>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-end mb-1">
                <span className="text-[10px] text-muted-foreground font-bold tracking-widest">GOAL: {dashboard?.calorieGoal || 2000}</span>
              </div>
              <div className="relative h-[100px] bg-secondary w-full border-t-2 border-dashed border-muted-foreground/20"></div>
              
              <div className="flex justify-between items-end h-24 mt-4 px-2">
                {dailyData.map((d, i) => {
                  const height = d.hasData ? Math.max(10, (d.dayKcal / maxKcal) * 80) : 5;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <div 
                        className={cn(
                          "w-4 rounded-full transition-all duration-500",
                          d.dayKcal > (dashboard?.calorieGoal || 2000) 
                            ? "bg-gradient-to-t from-coral to-coral/60" 
                            : d.hasData 
                              ? "bg-gradient-to-t from-mint to-emerald-400" 
                              : "bg-secondary"
                        )}
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-[9px] font-bold text-muted-foreground">{d.dayLabel}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-[2rem] p-8 text-center">
          <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground mt-4">No meal data this week yet.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-mint/20 to-mint/10 rounded-[1.5rem] p-5 flex flex-col items-center justify-center text-center border border-mint/20">
          <div className="text-[10px] font-bold text-mint uppercase tracking-widest">Protein</div>
          <div className="font-display text-2xl font-bold mt-1">{avgProtein}g</div>
        </div>
        <div className="bg-gradient-to-br from-coral/15 to-coral/5 rounded-[1.5rem] p-5 flex flex-col items-center justify-center text-center border border-coral/20">
          <div className="text-[10px] font-bold text-coral uppercase tracking-widest">Carbs</div>
          <div className="font-display text-2xl font-bold mt-1">{avgCarbs}g</div>
        </div>
        <div className="bg-gradient-to-br from-secondary to-secondary/50 rounded-[1.5rem] p-5 flex flex-col items-center justify-center text-center border border-border/30">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fats</div>
          <div className="font-display text-2xl font-bold mt-1">{avgFat}g</div>
        </div>
        <div className="bg-gradient-to-br from-sky-pastel/20 to-sky-pastel/10 rounded-[1.5rem] p-5 flex flex-col items-center justify-center text-center border border-sky-pastel/20">
          <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Days Logged</div>
          <div className="font-display text-2xl font-bold mt-1">{dailyHistory.length}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-2xl font-bold">Daily History</h3>
        <div className="space-y-3">
          {dailyHistory.slice(0, 7).map((day) => {
            const dateObj = parseISO(day.dateStr);
            return (
              <div key={day.dateStr} className="bg-card rounded-3xl p-4 shadow-soft flex items-center gap-4 border border-border/30 hover:border-mint/20 hover:shadow-md transition-all duration-200 group">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center border border-border/30">
                  <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{day.mealNames}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-mint" />
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
            <div className="p-8 text-center text-muted-foreground bg-card rounded-3xl border border-dashed border-border/30">
              No meal history yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryTabContent() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "high-protein" | "low-cal">("all");
  const month = format(new Date(), "yyyy-MM");
  const { data: foodLogs, isLoading } = useFoodLogs(undefined, month);
  const deleteFoodLog = useDeleteFoodLog();

  const filteredLogs = useMemo(() => {
    if (!foodLogs) return [];
    
    return foodLogs
      .filter((log: FoodLog) => {
        const matchesSearch = search === "" || 
          log.foodName?.toLowerCase().includes(search.toLowerCase());
        
        if (filter === "high-protein") {
          return matchesSearch && (log.protein || 0) > 20;
        } else if (filter === "low-cal") {
          return matchesSearch && (log.calories || 0) < 500;
        }
        
        return matchesSearch;
      })
      .sort((a: FoodLog, b: FoodLog) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [foodLogs, search, filter]);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this meal?")) {
      try {
        await deleteFoodLog.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground mt-1">Search and filter your meal archive</p>
      </div>

      <div className="bg-card rounded-full shadow-soft flex items-center px-5 py-3.5 gap-3 border border-border/30">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
          placeholder="Search meals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 no-scrollbar">
        {(["all", "high-protein", "low-cal"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all duration-200 ${filter === f ? "bg-surface-dark text-primary-foreground shadow-lg" : "bg-card text-muted-foreground shadow-soft hover:text-foreground border border-transparent hover:border-border/30"}`}>
            {f === "all" ? "All" : f === "high-protein" ? "High Protein" : "Low Cal"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="p-10 text-center text-muted-foreground animate-pulse">Loading history...</div>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log: FoodLog) => (
            <div key={log.id} className="bg-card rounded-2xl shadow-soft p-4 border border-white/50 hover:border-mint/30 transition-colors group">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold">{log.foodName?.trim() || "Food"}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                    {format(parseISO(log.date), "MMM d, yyyy")}
                    <span className="opacity-60">•</span>
                    <span>{log.paymentMethod || "Meal"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-secondary/80 px-2.5 py-1 rounded-full text-xs font-medium">₹{log.estimatedCost?.toFixed(2) || "0.00"}</span>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    disabled={deleteFoodLog.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-mint/30 text-[10px] font-bold text-primary border border-mint/20">{Math.round(log.calories)} kcal</span>
                <span className="px-2.5 py-0.5 rounded-full bg-coral/20 text-[10px] font-bold text-coral border border-coral/20">P {Math.round(log.protein)}g</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sun/20 text-[10px] font-bold text-amber-600 border border-sun/20">C {Math.round(log.carbs)}g</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-pastel/20 text-[10px] font-bold text-sky-600 border border-sky-pastel/20">F {Math.round(log.fat)}g</span>
              </div>
              {log.note && (
                <div className="mt-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                  {log.note}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-muted-foreground bg-card rounded-2xl border-2 border-dashed border-border/30">
            No meals found.
          </div>
        )}
      </div>
    </div>
  );
}
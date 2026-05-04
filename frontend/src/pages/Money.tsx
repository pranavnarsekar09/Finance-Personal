import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Car, ShoppingBag, Utensils, Zap, Coffee, Trash2 } from "lucide-react";
import { useExpenses, useCalendar, useProfile, useDeleteExpense } from "@/hooks/useApi";
import { useSwipeNative } from "@/hooks/useSwipe";
import { useHaptic } from "@/hooks/useHaptic";
import { format, parseISO, isToday, isYesterday, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from "date-fns";
import { formatRupees } from "@/lib/utils";
import { toast } from "sonner";
import type { CalendarEntry, Expense } from "@/lib/types";

const categoryIcons: Record<string, any> = {
  Groceries: ShoppingBag,
  Dining: Utensils,
  Transport: Car,
  Bills: Zap,
  Entertainment: Coffee,
  default: ShoppingBag,
};

export default function Money() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [direction, setDirection] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { medium } = useHaptic();
  const monthStr = format(currentMonth, "yyyy-MM");
  
  const { data: expenses, isLoading: expLoading } = useExpenses(undefined, monthStr);
  const { data: profile } = useProfile();
  
  const filters = ["All", ...(profile?.categories?.map((c: any) => c.name) || [])];
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const pageVariants = {
    initial: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.24, ease: "easeOut" } },
    exit: (dir: number) => ({ x: dir > 0 ? -20 : 20, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }),
  };

  const changeView = (nextView: "list" | "calendar") => {
    setDirection(nextView === "calendar" ? 1 : -1);
    setView(nextView);
    medium();
  };

  useSwipeNative({
    onSwipeLeft: () => {
      if (view === "list") {
        changeView("calendar");
      }
    },
    onSwipeRight: () => {
      if (view === "calendar") {
        changeView("list");
      }
    },
    threshold: 50,
  });

  const filteredExpenses = (expenses || []).filter((e: Expense) => {
    const matchesFilter = filter === "All" || e.categoryName === filter;
    const matchesSearch =
      (e.note?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      e.categoryName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedExpenses = filteredExpenses.reduce((groups: Record<string, Expense[]>, expense) => {
    const dateKey = expense.date.split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(expense);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, d MMM");
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="bg-card/70 backdrop-blur rounded-full p-1 flex shadow-soft">
          {(["list", "calendar"] as const).map((t) => (
            <button key={t} onClick={() => changeView(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${view === t ? "bg-card shadow-soft text-primary" : "text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{format(currentMonth, "MMMM yyyy")}</div>
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
          {view === "list" ? (
            <>
              <h1 className="font-display text-4xl font-bold tracking-tight">Your Money</h1>

              <div className="bg-card rounded-full shadow-soft flex items-center px-5 py-3.5 gap-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  className="flex-1 bg-transparent outline-none text-sm"
                  placeholder="Search transactions"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 no-scrollbar">
                {filters.map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition ${filter === f ? "bg-surface-dark text-primary-foreground" : "bg-card text-muted-foreground shadow-soft"}`}>
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {expLoading ? (
                  <div className="p-10 text-center text-muted-foreground animate-pulse bg-card rounded-[1.75rem]">Loading transactions...</div>
                ) : sortedDates.length > 0 ? (
                  sortedDates.map((date) => (
                    <div key={date} className="space-y-2">
                      <div className="px-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                        {getDateLabel(date)}
                      </div>
                      <div className="bg-card rounded-[1.75rem] shadow-soft divide-y divide-border/50 overflow-hidden">
                        {groupedExpenses[date].map((t) => (
                          <ExpenseItem key={t.id} t={t} />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-muted-foreground bg-card rounded-[1.75rem]">No transactions found.</div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <button onClick={handlePrevMonth} className="h-10 w-10 rounded-full bg-card shadow-soft flex items-center justify-center hover:bg-secondary transition">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="font-display text-2xl font-bold">{format(currentMonth, "MMMM yyyy")}</h1>
                <button onClick={handleNextMonth} className="h-10 w-10 rounded-full bg-card shadow-soft flex items-center justify-center hover:bg-secondary transition">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <CalendarGrid monthStr={monthStr} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ExpenseItem({ t }: { t: Expense }) {
  const deleteExpense = useDeleteExpense();
  
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense.mutateAsync(t.id);
        toast.success("Expense deleted");
      } catch (err: any) {
        toast.error("Failed to delete: " + err.message);
      }
    }
  };

  return (
    <div className="group flex items-center gap-3 p-4 hover:bg-secondary/30 transition">
      <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center text-lg">💰</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{t.note || t.categoryName}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-secondary">{t.categoryName}</span>
          {t.paymentMethod}
        </div>
      </div>
      <div className="text-right flex items-center gap-4">
        <div className="font-display font-bold">-{formatRupees(t.amount)}</div>
        <button 
          onClick={handleDelete}
          disabled={deleteExpense.isPending}
          className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CalendarGrid({ monthStr }: { monthStr: string }) {
  const { data: calendar, isLoading } = useCalendar(undefined, monthStr);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const deleteExpense = useDeleteExpense();
  
  const currentMonth = parseISO(monthStr + "-01");
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const dateArray = eachDayOfInterval({ start, end });
    
    const firstDay = getDay(start);
    const padding = Array(firstDay).fill(null);
    return [...padding, ...dateArray];
  }, [currentMonth]);

  if (isLoading) return <div className="h-[400px] bg-secondary/50 rounded-[2rem] animate-pulse" />;

  const entries = calendar || [];
  const selectedEntry = entries.find((e: CalendarEntry) => e.date.startsWith(selectedDate));
  const totalSpent = selectedEntry?.expenses?.reduce((acc, e) => acc + e.amount, 0) || 0;

  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense.mutateAsync(id);
        toast.success("Expense deleted");
      } catch (err: any) {
        toast.error("Failed to delete: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-[2.5rem] p-6 shadow-soft">
        <div className="grid grid-cols-7 gap-y-4 text-center">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
            <div key={d} className="text-[10px] font-bold text-muted-foreground/60 tracking-widest">{d}</div>
          ))}
          {days.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;
            
            const dateKey = format(date, "yyyy-MM-dd");
            const entry = entries.find((e: CalendarEntry) => e.date.startsWith(dateKey));
            const hasSpending = entry && entry.expenses && entry.expenses.length > 0;
            const isSelected = selectedDate === dateKey;
            
            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                className={`
                  relative h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${isSelected ? "bg-surface-dark text-primary-foreground shadow-lg scale-110 z-10" : "text-muted-foreground hover:bg-secondary"}
                  ${hasSpending && !isSelected ? "bg-mint/30 text-primary" : ""}
                `}
              >
                {format(date, "d")}
                {hasSpending && !isSelected && (
                   <div className="absolute bottom-1.5 h-1 w-1 rounded-full bg-mint" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-2 space-y-5 pb-10">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Selected Day</div>
            <div className="font-display text-3xl font-bold">{format(parseISO(selectedDate), "MMM d")}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Spent</div>
            <div className="font-display text-2xl font-bold text-coral">-{formatRupees(totalSpent)}</div>
          </div>
        </div>

        <div className="space-y-3">
          {selectedEntry?.expenses && selectedEntry.expenses.length > 0 ? (
            selectedEntry.expenses.map((e) => {
              const Icon = categoryIcons[e.categoryName] || categoryIcons.default;
              return (
                <div key={e.id} className="group bg-card rounded-[1.5rem] p-4 shadow-soft flex items-center gap-4 border border-white/50 hover:bg-secondary/10 transition">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{e.note || e.categoryName}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span className="font-medium">{e.categoryName}</span>
                      <span className="opacity-40">•</span>
                      <span>{e.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="font-display font-bold text-coral">-{formatRupees(e.amount)}</div>
                    <button 
                      onClick={() => handleDelete(e.id)}
                      disabled={deleteExpense.isPending}
                      className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-secondary/30 rounded-[1.5rem] p-10 text-center border-2 border-dashed border-muted-foreground/10">
              <p className="text-sm text-muted-foreground">No expenses logged for this day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

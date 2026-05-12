import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  ArrowUpRight, 
  Calendar, 
  Filter, 
  Trash2, 
  ChevronRight, 
  Banknote,
  Clock,
  LayoutGrid
} from "lucide-react";
import { useIncomes, useDeleteIncome } from "@/hooks/useApi";
import { formatRupees } from "@/lib/utils";
import { format, parseISO, startOfWeek, startOfMonth, subMonths, isAfter } from "date-fns";
import { toast } from "sonner";
import { Income } from "@/lib/types";

type FilterType = "week" | "month" | "3months" | "all";

export function ReceivedTab() {
  const [filter, setFilter] = useState<FilterType>("month");
  const { data: incomes = [], isLoading } = useIncomes();
  const deleteIncome = useDeleteIncome();

  const filteredIncomes = useMemo(() => {
    const now = new Date();
    return incomes.filter((item) => {
      const itemDate = parseISO(item.date);
      if (filter === "week") return isAfter(itemDate, startOfWeek(now));
      if (filter === "month") return isAfter(itemDate, startOfMonth(now));
      if (filter === "3months") return isAfter(itemDate, subMonths(now, 3));
      return true;
    });
  }, [incomes, filter]);

  const totalReceived = useMemo(() => {
    return filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredIncomes]);

  const sourceGroups = useMemo(() => {
    const groups: Record<string, { total: number; count: number }> = {};
    filteredIncomes.forEach((item) => {
      if (!groups[item.source]) {
        groups[item.source] = { total: 0, count: 0 };
      }
      groups[item.source].total += item.amount;
      groups[item.source].count += 1;
    });
    return Object.entries(groups).sort((a, b) => b[1].total - a[1].total);
  }, [filteredIncomes]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this record? This will also adjust your balance.")) {
      try {
        await deleteIncome.mutateAsync(id);
        toast.success("Record deleted and balance adjusted");
      } catch (err) {
        toast.error("Failed to delete record");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading records...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 px-1">
        {(["week", "month", "3months", "all"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
              filter === f
                ? "bg-primary text-white shadow-soft"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f === "week" ? "This Week" : f === "month" ? "This Month" : f === "3months" ? "Last 3 Months" : "All Time"}
          </button>
        ))}
      </div>

      {/* Summary Card */}
      <div className="relative overflow-hidden bg-card rounded-[2.5rem] shadow-soft p-8 mb-8 border border-primary/5">
        <div className="absolute -top-12 -right-12 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp className="h-7 w-7 text-emerald-600" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2">
            Total Received {filter === "all" ? "" : `(${filter})`}
          </div>
          <div className="font-display text-4xl font-bold text-emerald-600">
            {formatRupees(totalReceived)}
          </div>
          <div className="mt-4 flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-full">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              {filteredIncomes.length} Transactions
            </span>
          </div>
        </div>
      </div>

      {/* Source Breakdown */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 px-1">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Source Breakdown</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {sourceGroups.length > 0 ? (
            sourceGroups.map(([source, data]) => (
              <div key={source} className="bg-card rounded-3xl p-5 flex items-center justify-between border border-primary/5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-secondary/50 rounded-2xl flex items-center justify-center">
                    <Banknote className="h-6 w-6 text-primary/60" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{source}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{data.count} times</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-emerald-600">{formatRupees(data.total)}</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    {Math.round((data.total / totalReceived) * 100)}% of total
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-secondary/20 rounded-[2rem] border border-dashed border-muted-foreground/20">
              <p className="text-sm text-muted-foreground">No data for this period</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed List */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Recent Entries</h3>
          </div>
          <button className="text-[10px] uppercase tracking-widest font-bold text-primary hover:underline">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {filteredIncomes.length > 0 ? (
            filteredIncomes.map((item) => (
              <div key={item.id} className="bg-card rounded-3xl p-5 border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{item.source}</div>
                      <div className="text-[10px] text-muted-foreground font-medium italic">
                        {format(parseISO(item.date), "EEE, d MMM yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-display font-bold text-emerald-600 text-lg">+{formatRupees(item.amount)}</div>
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 rounded-full bg-coral/10 flex items-center justify-center text-coral hover:bg-coral hover:text-white transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {item.note && (
                  <div className="mt-2 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-secondary/50">
                    "{item.note}"
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-secondary/20 rounded-[2rem] border border-dashed border-muted-foreground/20">
              <p className="text-sm text-muted-foreground">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

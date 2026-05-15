import { useState, useMemo } from "react";
import {
  ArrowUpRight,
  Clock,
  Trash2,
  Banknote,
  RefreshCw,
  Settings,
  Plus,
  X,
  Calendar,
} from "lucide-react";
import { useIncomes, useDeleteIncome } from "@/hooks/useApi";
import { formatRupees, getIncomeSources, addIncomeSource, removeIncomeSource } from "@/lib/utils";
import { format, parseISO, startOfWeek, startOfMonth, subMonths, isAfter } from "date-fns";
import { toast } from "sonner";
import { Income } from "@/lib/types";
import {
  calculateIncomeAnalytics,
  calculateSourceAnalytics,
  generateIncomeInsights,
} from "./incomeUtils";
import { IncomeSummaryCard } from "./IncomeSummaryCard";
import { IncomeSourceCard } from "./IncomeSourceCard";
import { IncomeInsightStrip } from "./IncomeInsightStrip";

type FilterType = "week" | "month" | "3months" | "all";

const filterConfig: Record<FilterType, { label: string; days: number }> = {
  week: { label: "This Week", days: 7 },
  month: { label: "This Month", days: 30 },
  "3months": { label: "3 Months", days: 90 },
  all: { label: "All Time", days: 0 },
};

export function ReceivedTab() {
  const [filter, setFilter] = useState<FilterType>("month");
  const [showSources, setShowSources] = useState(false);
  const [newSource, setNewSource] = useState("");
  const [sources, setSources] = useState<string[]>(getIncomeSources);
  const { data: incomes = [], isLoading } = useIncomes();
  const deleteIncome = useDeleteIncome();

  const handleAddSource = () => {
    if (!newSource.trim()) return;
    const updated = addIncomeSource(newSource.trim());
    setSources(updated);
    setNewSource("");
    toast.success("Source added");
  };

  const handleRemoveSource = (source: string) => {
    if (window.confirm(`Remove "${source}" from sources?`)) {
      const updated = removeIncomeSource(source);
      setSources(updated);
      toast.success("Source removed");
    }
  };

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

  const analytics = useMemo(() => calculateIncomeAnalytics(filteredIncomes), [filteredIncomes]);

  const sourceAnalytics = useMemo(
    () => calculateSourceAnalytics(filteredIncomes, sourceGroups),
    [filteredIncomes, sourceGroups]
  );

  const insights = useMemo(
    () => generateIncomeInsights(analytics, sourceAnalytics),
    [analytics, sourceAnalytics]
  );

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
        <p className="text-muted-foreground animate-pulse font-medium">Loading income records...</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6">
        {(["week", "month", "3months", "all"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold capitalize transition-all duration-200 whitespace-nowrap ${
              filter === f
                ? "bg-surface-dark text-primary-foreground shadow-lg"
                : "bg-card text-muted-foreground shadow-soft hover:text-foreground border border-transparent hover:border-border/30"
            }`}
          >
            {filterConfig[f].label}
          </button>
        ))}
      </div>

      <IncomeInsightStrip insights={insights} />

      <IncomeSummaryCard incomes={filteredIncomes} isLoading={isLoading} />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-lavender/20 rounded-lg flex items-center justify-center">
              <Banknote className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Source Breakdown
            </h3>
            <span className="text-[10px] bg-secondary/60 text-muted-foreground px-2 py-0.5 rounded-full font-medium">
              {sourceAnalytics.length}
            </span>
          </div>
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-primary/70 hover:text-primary transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            Manage
          </button>
        </div>

        {showSources && (
          <div className="bg-secondary/30 rounded-2xl p-4 mb-4 border border-dashed border-muted-foreground/20">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-bold">
              Income Sources
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {sources.map((source) => (
                <div
                  key={source}
                  className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm"
                >
                  <span>{source}</span>
                  <button
                    onClick={() => handleRemoveSource(source)}
                    className="h-4 w-4 rounded-full bg-coral/10 text-coral hover:bg-coral hover:text-white flex items-center justify-center transition-all"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSource()}
                placeholder="Add new source..."
                className="flex-1 bg-card border border-muted-foreground/10 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleAddSource}
                disabled={!newSource.trim()}
                className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {sourceAnalytics.length > 0 ? (
            sourceAnalytics.map((source, index) => (
              <IncomeSourceCard
                key={source.name}
                source={source}
                totalReceived={totalReceived}
                index={index}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-secondary/20 rounded-[2rem] border border-dashed border-muted-foreground/20">
              <Banknote className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No income sources yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add income to see your source breakdown
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-sky/20 rounded-lg flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-sky" />
            </div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Recent Entries
            </h3>
            <span className="text-[10px] bg-secondary/60 text-muted-foreground px-2 py-0.5 rounded-full font-medium">
              {filteredIncomes.length}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {filteredIncomes.length > 0 ? (
            filteredIncomes.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-2xl p-4 border border-primary/5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-11 w-11 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 rounded-xl flex items-center justify-center border border-emerald-500/10 shrink-0">
                      <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{item.source}</span>
                        {item.isRecurring && (
                          <span className="h-5 w-5 bg-mint/20 rounded-full flex items-center justify-center shrink-0" title="Recurring">
                            <RefreshCw className="h-3 w-3 text-mint" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {format(parseISO(item.date), "EEE, d MMM yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-display font-bold text-emerald-600 text-lg">
                        +{formatRupees(item.amount)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 rounded-full bg-coral/10 flex items-center justify-center text-coral hover:bg-coral hover:text-white transition-all shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {item.note && (
                  <div className="mt-3 text-xs text-muted-foreground/80 bg-secondary/30 p-3 rounded-xl border border-secondary/50 italic">
                    "{item.note}"
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-secondary/20 rounded-[2rem] border border-dashed border-muted-foreground/20">
              <ArrowUpRight className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No transactions found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Try a different time period or add new income
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
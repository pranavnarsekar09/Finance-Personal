import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { monthKey, haptic } from "../../lib/utils";
import { AppCard, PillTabs, SectionHeader, TransactionItem } from "../../ui/fintech";

export function ActivityPage({ profile }) {
  const [month] = useState(monthKey());
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: expenses, loading: loadingExpenses } = useAsync(() => api.getExpenses(USER_ID, month), [month]);
  const { data: logs, loading: loadingLogs } = useAsync(() => api.getFoodLogs(USER_ID, month), [month]);

  const categories = useMemo(() => {
    if (!profile?.categories) return [{ label: "All", value: "All" }];
    return [{ label: "All", value: "All" }, ...profile.categories.map((category) => ({ label: category.name, value: category.name }))];
  }, [profile]);

  const activities = useMemo(() => {
    const allExpenses = (expenses || []).map((entry) => ({ ...entry, kind: "expense" }));
    const allFood = (logs || []).map((entry) => ({
      ...entry,
      kind: "food",
      amount: entry.estimatedCost,
      categoryName: "Food",
      paymentMethod: "Meal log",
    }));

    let combined = [...allExpenses, ...allFood].sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (selectedCategory !== "All") {
      combined = combined.filter((item) => item.categoryName === selectedCategory);
    }

    return combined;
  }, [expenses, logs, selectedCategory]);

  const loading = loadingExpenses || loadingLogs;

  return (
    <div className="page-shell">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">Activity</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Your financial heartbeat</h1>
        <p className="mt-2 text-sm text-slate-500">Expenses and meal logs, organized into one cleaner timeline.</p>
      </div>

      <AppCard className="mb-4">
        <SectionHeader eyebrow="Filters" title="Focus the feed" description="Switch categories without leaving the timeline." />
        <div className="mt-4 overflow-x-auto">
          <PillTabs
            items={categories}
            value={selectedCategory}
            onChange={(value) => {
              haptic(5);
              setSelectedCategory(value);
            }}
          />
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${selectedCategory === "All" ? "all activity" : selectedCategory}...`}
            className="text-input pl-10"
          />
        </div>
      </AppCard>

      <div className="space-y-3">
        {loading ? (
          <AppCard><p className="py-10 text-center text-slate-500">Loading activity...</p></AppCard>
        ) : activities.length ? (
          activities.map((item) => (
            <TransactionItem
              key={`${item.kind}-${item.id}`}
              title={item.kind === "food" ? item.foodName : item.categoryName}
              subtitle={`${item.date} • ${item.kind === "food" ? `${item.calories} kcal` : item.paymentMethod}`}
              amount={item.amount}
              icon={item.kind === "food" ? "food" : "wallet"}
              rightDetail={item.note || "No note"}
            />
          ))
        ) : (
          <AppCard><p className="py-10 text-center text-slate-500">No activity found for this period.</p></AppCard>
        )}
      </div>
    </div>
  );
}

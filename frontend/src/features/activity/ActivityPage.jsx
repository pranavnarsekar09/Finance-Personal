import { useMemo, useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { currency, monthKey, shortDate, haptic } from "../../lib/utils";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Search, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function ActivityPage({ profile }) {
  const [month, setMonth] = useState(monthKey());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { data: summary, loading } = useAsync(() => api.getDashboard(USER_ID, month), [month]);

  const categories = useMemo(() => {
    if (!profile?.categories) return ["All"];
    return ["All", ...profile.categories.map(c => c.name)];
  }, [profile]);

  const activities = useMemo(() => {
    if (!summary) return [];
    let list = summary.recentTransactions || [];
    if (selectedCategory !== "All") {
      list = list.filter(item => item.categoryName === selectedCategory);
    }
    return list;
  }, [summary, selectedCategory]);

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Activity"
        title="Your financial heartbeat."
        description="Every transaction and meal logged, organized by time."
      />

      {/* Category Filters */}
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              haptic(5);
              setSelectedCategory(cat);
            }}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-all ${
              selectedCategory === cat 
                ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20" 
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${selectedCategory === "All" ? "all" : selectedCategory}...`}
            className="text-input pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="py-10 text-center text-slate-500">Loading activity...</p>
        ) : activities.length ? (
          activities.map((item) => (
            <Card key={item.id} className="flex items-center justify-between p-4 transition-all hover:bg-white/5">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-2 ${item.amount > 0 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <p className="font-bold text-white">{item.categoryName}</p>
                  <p className="text-xs text-slate-500">{shortDate(item.date)} • {item.paymentMethod}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{currency(item.amount)}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">{item.note || "No note"}</p>
              </div>
            </Card>
          ))
        ) : (
          <Card className="py-20 text-center">
            <p className="text-slate-500">No activity found for this period.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

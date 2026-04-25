import { memo } from "react";
import { Card } from "./Card";

export const StatCard = memo(function StatCard({ label, value, subtext, accent = "from-cyan-400/20 to-emerald-300/10" }) {
  return (
    <Card className={`bg-gradient-to-br ${accent} border-white/60`}>
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <h3 className="mt-3 text-2xl font-bold text-slate-900">{value}</h3>
      <p className="mt-2 text-sm text-slate-500">{subtext}</p>
    </Card>
  );
});

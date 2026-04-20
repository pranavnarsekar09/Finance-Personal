import { memo } from "react";
import { Card } from "./Card";

export const StatCard = memo(function StatCard({ label, value, subtext, accent = "from-cyan-400/20 to-emerald-300/10" }) {
  return (
    <Card className={`bg-gradient-to-br ${accent}`}>
      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <h3 className="mt-3 font-display text-3xl font-bold text-white">{value}</h3>
      <p className="mt-2 text-sm text-slate-300">{subtext}</p>
    </Card>
  );
});

import { memo } from "react";

export const ProgressBar = memo(function ProgressBar({ value, total = 100, tone = "cyan" }) {
  const pct = Math.max(0, Math.min(100, total === 0 ? 0 : (value / total) * 100));
  const gradient =
    tone === "green" ? "from-emerald-400 to-lime-300" : "from-cyan-400 to-sky-300";

  return (
    <div className="h-3 rounded-full bg-white/5">
      <div
        className={`h-3 rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
});

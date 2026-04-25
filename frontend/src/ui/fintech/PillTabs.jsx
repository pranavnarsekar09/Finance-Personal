import { motion } from "framer-motion";
import { cn, haptic } from "../../lib/utils";

export function PillTabs({ items = [], value, onChange }) {
  return (
    <div className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800/50">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              haptic(5);
              onChange(item.value);
            }}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400",
            )}
          >
            {active ? (
              <motion.span
                layoutId={`pill-tab-${items.map((entry) => entry.value).join("-")}`}
                className="absolute inset-0 rounded-full bg-white shadow-md dark:bg-slate-700"
              />
            ) : null}
            <span className="relative z-10">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

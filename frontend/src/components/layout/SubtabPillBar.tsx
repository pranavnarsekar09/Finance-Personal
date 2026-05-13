import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SubtabPillBarProps<T extends string> {
  tabs: readonly T[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export function SubtabPillBar<T extends string>({ tabs, activeTab, onTabChange }: SubtabPillBarProps<T>) {
  return (
    <div className="bg-card/80 backdrop-blur-md rounded-full p-1 flex shadow-soft border border-border/30 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200 whitespace-nowrap",
            activeTab === tab
              ? "bg-surface-dark text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function SubtabPillBarWithIndicator<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: SubtabPillBarProps<T>) {
  return (
    <div className="overflow-x-auto no-scrollbar [-webkit-overflow-scrolling:touch]">
      <div className="bg-card/80 backdrop-blur-md rounded-full px-1.5 py-1 flex shadow-soft border border-border/30 relative min-w-[max-content]">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                "min-w-[4.5rem] px-2 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200 relative z-10",
                isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="subtab-pill"
                  className="absolute inset-0 bg-surface-dark rounded-full shadow-md"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
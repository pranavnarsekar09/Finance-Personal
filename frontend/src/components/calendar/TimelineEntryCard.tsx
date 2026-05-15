import { formatRupees } from "@/lib/utils";
import { RefreshCw, Trash2, Utensils, CreditCard } from "lucide-react";

interface TimelineEntryCardProps {
  entry: any;
  onDelete?: () => void;
}

export function TimelineEntryCard({ entry, onDelete }: TimelineEntryCardProps) {
  const Icon = entry?.type === "meal" ? Utensils : CreditCard;
  const isExpense = entry?.type === "expense";

  return (
    <div className={`rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all duration-200 ${
      isExpense ? "bg-coral/5 border-coral/10" : "bg-emerald-500/5 border-emerald-500/10"
    }`}>
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-xl bg-card flex items-center justify-center border border-border/20 shrink-0">
          <Icon className={`h-5 w-5 ${entry?.color || "text-muted-foreground"}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate">{entry?.label || "Unknown"}</span>
                {entry?.isRecurring && (
                  <span className="h-5 w-5 bg-mint/20 rounded-full flex items-center justify-center shrink-0">
                    <RefreshCw className="h-3 w-3 text-mint" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground/70 font-medium">
                  {entry?.category || "Other"}
                </span>
                {entry?.time && (
                  <>
                    <span className="text-[10px] text-muted-foreground/50">•</span>
                    <span className="text-[10px] text-muted-foreground/50">{entry.time}</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className={`font-display font-bold ${isExpense ? "text-coral" : "text-emerald-600"}`}>
                {isExpense ? "-" : ""}{formatRupees(entry?.amount || 0)}
              </div>
              {entry?.calories && (
                <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  {entry.calories} cal
                </div>
              )}
            </div>
          </div>

          {entry?.note && isExpense && (
            <div className="mt-2 text-[10px] text-muted-foreground/70 bg-secondary/20 px-2 py-1 rounded-lg">
              {entry.note}
            </div>
          )}
        </div>

        {onDelete && (
          <button
            onClick={onDelete}
            className="h-8 w-8 rounded-full bg-coral/10 flex items-center justify-center text-coral hover:bg-coral hover:text-white transition-all shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
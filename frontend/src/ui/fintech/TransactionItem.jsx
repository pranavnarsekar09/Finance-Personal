import { Utensils, Wallet, Landmark, Repeat2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn, currency } from "../../lib/utils";

const ICONS = {
  food: Utensils,
  wallet: Wallet,
  bank: Landmark,
  recurring: Repeat2,
};

export function TransactionItem({
  title,
  subtitle,
  amount,
  tone = "expense",
  icon = "wallet",
  rightDetail,
  className = "",
}) {
  const Icon = ICONS[icon] || Wallet;
  const isPositive = tone === "income";

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      className={cn("flex items-center justify-between gap-3 rounded-[24px] border border-slate-100 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900", className)}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", isPositive ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600")}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-bold", isPositive ? "text-emerald-600" : "text-slate-900 dark:text-slate-100")}>
          {isPositive ? "+" : "-"}
          {currency(amount)}
        </p>
        {rightDetail ? <p className="text-xs text-slate-500 dark:text-slate-400">{rightDetail}</p> : null}
      </div>
    </motion.div>
  );
}

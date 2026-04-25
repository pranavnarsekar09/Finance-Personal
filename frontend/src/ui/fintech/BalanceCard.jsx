import { CreditCard, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { currency } from "../../lib/utils";

export function BalanceCard({ name, balance = 0, spentToday = 0, remainingBudget = 0 }) {
  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      whileHover={{ scale: 1.01 }}
      className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-sky-900 to-cyan-500 p-6 text-white shadow-2xl shadow-sky-900/15"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.16),transparent_30%)]" />
      <div className="absolute -right-10 top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
      <div className="relative space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/80">Available balance</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">{currency(balance)}</h2>
            <p className="mt-2 text-sm text-cyan-50/80">{name ? `${name}'s primary balance` : "Primary balance snapshot"}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm text-cyan-50/80">
            <span>Today</span>
            <Eye className="h-4 w-4" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-50/60">Spent</p>
              <p className="mt-1 text-lg font-semibold">{currency(spentToday)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-50/60">Budget left</p>
              <p className="mt-1 text-lg font-semibold">{currency(remainingBudget)}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";

export function SavingsJar({ progress = 0, label = "Savings" }) {
  // progress is 0 to 1
  const percentage = Math.min(100, Math.max(0, progress * 100));

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-32 w-24 overflow-hidden rounded-b-[40px] rounded-t-xl border-4 border-slate-100 bg-slate-50 shadow-lg shadow-slate-900/5">
        {/* Liquid/Filling */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute bottom-0 w-full bg-gradient-to-t from-sky-500 to-cyan-300"
        >
          {/* Wave effect */}
          <motion.div
            animate={{ x: [-20, 0, -20] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 h-8 w-[200%] bg-white/20 blur-md"
            style={{ borderRadius: "40%" }}
          />
        </motion.div>
        
        {/* Shine */}
        <div className="absolute right-3 top-2 h-10 w-1 rounded-full bg-white/50" />
      </div>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900">{Math.round(percentage)}%</p>
      </div>
    </div>
  );
}

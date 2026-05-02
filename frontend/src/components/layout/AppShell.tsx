import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Wallet, Apple, User, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import HomePage from "@/pages/Home";
import MoneyPage from "@/pages/Money";
import HealthPage from "@/pages/Health";
import YouPage from "@/pages/You";
import { ChatSheet } from "@/components/sheets/ChatSheet";
import { AddExpenseSheet } from "@/components/sheets/AddExpenseSheet";
import { LogMealSheet } from "@/components/sheets/LogMealSheet";
import { AnalyzeFoodSheet } from "@/components/sheets/AnalyzeFoodSheet";
import { SheetContext } from "@/context/SheetContext";

const tabs = [
  { id: "home", label: "Home", icon: Home, Comp: HomePage },
  { id: "money", label: "Money", icon: Wallet, Comp: MoneyPage },
  { id: "health", label: "Health", icon: Apple, Comp: HealthPage },
  { id: "you", label: "You", icon: User, Comp: YouPage },
] as const;

export default function AppShell() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("home");
  const [chatOpen, setChatOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  
  const Active = tabs.find((t) => t.id === active)!.Comp;

  return (
    <SheetContext.Provider value={{ setMealOpen, setAddOpen, setChatOpen, setAnalyzeOpen }}>
      <div className="min-h-screen bg-gradient-cream grain">
        <div className="mx-auto max-w-md md:max-w-2xl pb-32 px-5 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Active />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating action cluster */}
        <div className="fixed bottom-28 right-5 z-40 flex flex-col gap-3">
          <button
            onClick={() => setChatOpen(true)}
            aria-label="Open AI chat"
            className="h-12 w-12 rounded-full bg-card shadow-float flex items-center justify-center hover:scale-105 transition"
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </button>
          <button
            onClick={() => setAddOpen(true)}
            aria-label="Add expense"
            className="h-14 w-14 rounded-full bg-surface-dark shadow-float flex items-center justify-center hover:scale-105 transition"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Bottom nav */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-card/90 backdrop-blur-xl shadow-float rounded-full px-2 py-2 flex gap-1 border border-border/40">
            {tabs.map((t) => {
              const Icon = t.icon;
              const on = active === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors",
                    on ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {on && (
                    <motion.div
                      layoutId="navpill"
                      className="absolute inset-0 bg-surface-dark rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className={cn("hidden sm:inline", on && "inline")}>{on ? t.label : ""}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <ChatSheet open={chatOpen} onClose={() => setChatOpen(false)} />
        <AddExpenseSheet open={addOpen} onClose={() => setAddOpen(false)} />
        <LogMealSheet open={mealOpen} onClose={() => setMealOpen(false)} />
        <AnalyzeFoodSheet open={analyzeOpen} onClose={() => setAnalyzeOpen(false)} />
      </div>
    </SheetContext.Provider>
  );
}
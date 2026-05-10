import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Wallet, Apple, User, Plus, Sparkles, BrainCircuit, X } from "lucide-react";
import { cn } from "@/lib/utils";
import HomePage from "@/pages/Home";
import MoneyPage from "@/pages/Money";
import HealthPage from "@/pages/Health";
import AIPage from "@/pages/AI";
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
  { id: "ai", label: "Ai", icon: BrainCircuit, Comp: AIPage },
  { id: "you", label: "You", icon: User, Comp: YouPage },
] as const;

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const modalHistoryPushed = useRef(false);

  const active = useMemo(() => {
    const path = location.pathname.replace(/^\//, "") || "home";
    return tabs.some((t) => t.id === path) ? (path as (typeof tabs)[number]["id"]) : "home";
  }, [location.pathname]);

  const activeSheet = chatOpen ? "chat" : addOpen ? "add" : mealOpen ? "meal" : analyzeOpen ? "analyze" : null;

  const closeAllSheets = () => {
    setChatOpen(false);
    setAddOpen(false);
    setMealOpen(false);
    setAnalyzeOpen(false);
    setFabMenuOpen(false);
  };

  useEffect(() => {
    if (!activeSheet) {
      modalHistoryPushed.current = false;
      return;
    }

    if (!modalHistoryPushed.current) {
      window.history.pushState({ sheet: activeSheet }, "");
      modalHistoryPushed.current = true;
    }
  }, [activeSheet]);

  useEffect(() => {
    const handlePopState = () => {
      if (activeSheet) {
        closeAllSheets();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeSheet]);

  useEffect(() => {
    if (activeSheet) setFabMenuOpen(false);
  }, [activeSheet]);

  useEffect(() => {
    setFabMenuOpen(false);
  }, [location.pathname]);

  const closeSheet = () => {
    if (window.history.state?.sheet) {
      window.history.back();
    } else {
      closeAllSheets();
    }
  };

  const Active = tabs.find((t) => t.id === active)!.Comp;

  return (
    <SheetContext.Provider value={{ setMealOpen, setAddOpen, setChatOpen, setAnalyzeOpen }}>
      <div className="min-h-screen overflow-x-hidden bg-gradient-cream grain">
        <div
          className="mx-auto max-w-md overflow-x-hidden md:max-w-2xl pb-32 px-5 pt-6"
        >
          <div className="overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
              >
                <Active />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Single FAB: expands to Gemini chat + Add expense */}
        {fabMenuOpen ? (
          <button
            type="button"
            aria-label="Close quick actions"
            className="fixed inset-0 z-[39] cursor-default bg-black/20 backdrop-blur-[1px]"
            onClick={() => setFabMenuOpen(false)}
          />
        ) : null}
        <div className="fixed bottom-28 right-5 z-40 flex flex-col items-end gap-2">
          <AnimatePresence>
            {fabMenuOpen ? (
              <motion.div
                key="fab-actions"
                initial={{ opacity: 0, y: 16, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-end gap-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setChatOpen(true);
                    setFabMenuOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-full bg-card pl-4 pr-2 py-2 shadow-float border border-border/40 hover:scale-[1.02] transition"
                >
                  <span className="text-sm font-medium text-foreground">Gemini chat</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-mint">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddOpen(true);
                    setFabMenuOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-full bg-card pl-4 pr-2 py-2 shadow-float border border-border/40 hover:scale-[1.02] transition"
                >
                  <span className="text-sm font-medium text-foreground">Add expense</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-dark text-white">
                    <Plus className="h-6 w-6" />
                  </span>
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => setFabMenuOpen((o) => !o)}
            aria-expanded={fabMenuOpen}
            aria-label={fabMenuOpen ? "Close quick actions" : "Open quick actions"}
            className="h-14 w-14 rounded-full bg-surface-dark text-white shadow-float flex items-center justify-center hover:scale-105 transition"
          >
            {fabMenuOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
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
                  onClick={() => navigate(t.id === "home" ? "/" : `/${t.id}`)}
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

        <ChatSheet open={chatOpen} onClose={closeSheet} />
        <AddExpenseSheet open={addOpen} onClose={closeSheet} />
        <LogMealSheet open={mealOpen} onClose={closeSheet} />
        <AnalyzeFoodSheet open={analyzeOpen} onClose={closeSheet} />
      </div>
    </SheetContext.Provider>
  );
}

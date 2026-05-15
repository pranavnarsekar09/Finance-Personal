import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wallet, Apple, User, Plus, Sparkles, X, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardPage from "@/pages/Dashboard";
import MoneyPage from "@/pages/Money";
import HealthPage from "@/pages/Health";
import YouPage from "@/pages/You";
import { ChatSheet } from "@/components/sheets/ChatSheet";
import { AddExpenseSheet } from "@/components/sheets/AddExpenseSheet";
import { LogMealSheet } from "@/components/sheets/LogMealSheet";
import { AnalyzeFoodSheet } from "@/components/sheets/AnalyzeFoodSheet";
import { AddMoneySheet } from "@/components/sheets/AddMoneySheet";
import { SheetContext } from "@/context/SheetContext";
import { TabNavigatorSheet } from "@/components/navigation/TabNavigatorSheet";
import { MainTabId, NAVIGATION_CONFIG } from "@/lib/navigationConfig";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, Comp: DashboardPage },
  { id: "money", label: "Money", icon: Wallet, Comp: MoneyPage },
  { id: "health", label: "Health", icon: Apple, Comp: HealthPage },
  { id: "you", label: "You", icon: User, Comp: YouPage },
] as const;

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [navigatorTab, setNavigatorTab] = useState<MainTabId | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const modalHistoryPushed = useRef(false);

  const handleLongPressStart = useCallback((tabId: MainTabId) => {
    const timer = setTimeout(() => {
      setNavigatorTab(tabId);
    }, 500);
    setLongPressTimer(timer);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const closeNavigator = useCallback(() => {
    setNavigatorTab(null);
  }, []);

  const active = useMemo(() => {
    const path = location.pathname.replace(/^\//, "") || "dashboard";
    return tabs.some((t) => t.id === path) ? (path as (typeof tabs)[number]["id"]) : "dashboard";
  }, [location.pathname]);

  const activeSheet = chatOpen ? "chat" : addOpen ? "add" : mealOpen ? "meal" : analyzeOpen ? "analyze" : addMoneyOpen ? "addMoney" : null;

  const closeAllSheets = () => {
    setChatOpen(false);
    setAddOpen(false);
    setMealOpen(false);
    setAnalyzeOpen(false);
    setAddMoneyOpen(false);
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
    <SheetContext.Provider value={{ setMealOpen, setAddOpen, setChatOpen, setAnalyzeOpen, setAddMoneyOpen }}>
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
                  className="group flex items-center gap-3 rounded-full bg-card pl-4 pr-2 py-2 shadow-float border border-border/40 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(139,92,246,0.2)] transition-all duration-200"
                >
                  <span className="text-sm font-medium text-foreground">Gemini chat</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 group-hover:scale-110 transition-transform duration-200">
                    <Sparkles className="h-5 w-5 text-white" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddMoneyOpen(true);
                    setFabMenuOpen(false);
                  }}
                  className="group flex items-center gap-3 rounded-full bg-card pl-4 pr-2 py-2 shadow-float border border-border/40 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] transition-all duration-200"
                >
                  <span className="text-sm font-medium text-foreground">Add money</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 group-hover:scale-110 transition-transform duration-200">
                    <Banknote className="h-5 w-5 text-white" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddOpen(true);
                    setFabMenuOpen(false);
                  }}
                  className="group flex items-center gap-3 rounded-full bg-card pl-4 pr-2 py-2 shadow-float border border-border/40 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)] transition-all duration-200"
                >
                  <span className="text-sm font-medium text-foreground">Add expense</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:scale-110 transition-transform duration-200">
                    <Plus className="h-6 w-6 text-white" />
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
            className="group relative h-14 w-14 rounded-full bg-gradient-to-br from-surface-dark via-surface-dark to-zinc-800 text-white shadow-float flex items-center justify-center hover:scale-105 transition-all duration-300"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 via-transparent to-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">{fabMenuOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}</span>
          </button>
        </div>

        {/* Bottom nav */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-card/95 backdrop-blur-xl shadow-float rounded-full px-2 py-2 flex gap-1 border border-border/40 shadow-lg">
            {tabs.map((t) => {
              const Icon = t.icon;
              const on = active === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => navigate(`/${t.id}`)}
                  onMouseDown={() => handleLongPressStart(t.id as MainTabId)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={() => handleLongPressStart(t.id as MainTabId)}
                  onTouchEnd={handleLongPressEnd}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 select-none",
                    on ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {on && (
                    <motion.div
                      layoutId="navpill"
                      className="absolute inset-0 bg-surface-dark rounded-full shadow-md shadow-surface-dark/20"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", on && "text-mint")} />
                    <span className={cn("hidden sm:inline", on && "inline")}>{on ? t.label : ""}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <TabNavigatorSheet
          isOpen={navigatorTab !== null}
          onClose={closeNavigator}
          activeTab={navigatorTab || "dashboard"}
        />

        <ChatSheet open={chatOpen} onClose={closeSheet} />
        <AddExpenseSheet open={addOpen} onClose={closeSheet} />
        <LogMealSheet open={mealOpen} onClose={closeSheet} />
        <AnalyzeFoodSheet open={analyzeOpen} onClose={closeSheet} />
        <AddMoneySheet open={addMoneyOpen} onClose={closeSheet} />
      </div>
    </SheetContext.Provider>
  );
}

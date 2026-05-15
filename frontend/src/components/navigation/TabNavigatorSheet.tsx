import { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useHaptic } from "@/hooks/useHaptic";
import { SheetContext } from "@/context/SheetContext";
import { MainTabId, NAVIGATION_CONFIG, SubTab, QuickAction } from "@/lib/navigationConfig";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface TabNavigatorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: MainTabId;
}

export function TabNavigatorSheet({ isOpen, onClose, activeTab }: TabNavigatorSheetProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { light, medium } = useHaptic();
  const { setAddOpen, setMealOpen, setAddMoneyOpen } = useContext(SheetContext);
  
  const config = NAVIGATION_CONFIG[activeTab];

  const currentSubtab = useMemo(() => {
    const path = location.pathname;
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    return tab || config?.defaultSubtab;
  }, [location, config]);

  useEffect(() => {
    if (isOpen) {
      light();
    }
  }, [isOpen, light]);

  const handleSubtabSelect = (subtab: SubTab) => {
    light();
    let path = subtab.path;
    if (subtab.queryParams && Object.keys(subtab.queryParams).length > 0) {
      const params = new URLSearchParams(subtab.queryParams);
      const queryString = params.toString();
      if (queryString) {
        path = `${subtab.path}?${queryString}`;
      }
    }
    navigate(path);
    onClose();
  };

  const handleQuickAction = (action: QuickAction) => {
    medium();
    onClose();
    switch (action.action) {
      case "add-expense":
        setAddOpen(true);
        break;
      case "add-income":
        setAddMoneyOpen(true);
        break;
      case "log-meal":
        setMealOpen(true);
        break;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const recentSubtabs = useMemo(() => {
    if (!config?.recentSubtabs) return [];
    return config.recentSubtabs
      .map(id => config.subtabs.find(s => s.id === id))
      .filter(Boolean) as SubTab[];
  }, [config]);

  if (!isOpen || !config) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[2rem] shadow-float border-t border-border/20 overflow-hidden"
          style={{ maxHeight: "75vh" }}
        >
          <div className="p-6 pb-8 overflow-y-auto" style={{ maxHeight: "75vh" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-mint flex items-center justify-center shadow-lg shadow-mint/20">
                  <config.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold">{config.workspaceLabel}</h2>
                  <p className="text-xs text-muted-foreground">
                    {config.subtabs.length} sections available
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {currentSubtab && (
              <div className="mb-6 px-3 py-2 bg-secondary/50 rounded-xl border border-border/20">
                <p className="text-xs text-muted-foreground">
                  Currently active: <span className="text-foreground font-medium">
                    {config.subtabs.find(s => s.id === currentSubtab)?.label || config.subtabs[0].label}
                  </span>
                </p>
              </div>
            )}

            {recentSubtabs.length > 0 && (
              <div className="mb-6">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">Recent</div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {recentSubtabs.map((subtab, index) => (
                    <motion.button
                      key={subtab.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSubtabSelect(subtab)}
                      whileTap={{ scale: 0.96 }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-all",
                        currentSubtab === subtab.id
                          ? "bg-surface-dark text-primary-foreground"
                          : "bg-secondary/60 hover:bg-secondary text-foreground"
                      )}
                    >
                      <subtab.icon className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{subtab.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">Navigate</div>
              <div className="space-y-2">
                {config.subtabs.map((subtab, index) => {
                  const isActive = currentSubtab === subtab.id;
                  return (
                    <motion.button
                      key={subtab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      onClick={() => handleSubtabSelect(subtab)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200",
                        isActive
                          ? "bg-surface-dark text-primary-foreground shadow-lg shadow-surface-dark/20"
                          : "bg-secondary/40 hover:bg-secondary/70 border border-transparent hover:border-border/30"
                      )}
                    >
                      <div className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center",
                        isActive ? "bg-mint/20" : "bg-secondary"
                      )}>
                        <subtab.icon className={cn(
                          "h-4.5 w-4.5",
                          isActive ? "text-mint" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={cn(
                          "font-medium text-sm",
                          isActive ? "text-primary-foreground" : "text-foreground"
                        )}>
                          {subtab.label}
                        </div>
                        {subtab.description && (
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {subtab.description}
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-2 w-2 rounded-full bg-mint"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {config.quickActions.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  {config.quickActions.map((action, index) => (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      onClick={() => handleQuickAction(action)}
                      whileTap={{ scale: 0.96 }}
                      className="flex items-center gap-3 px-4 py-3 bg-gradient-mint rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <action.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-primary">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="w-12 h-1 bg-muted rounded-full" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
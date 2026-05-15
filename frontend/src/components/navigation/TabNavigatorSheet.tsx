import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useHaptic } from "@/hooks/useHaptic";
import { MainTabConfig, SubTab, NAVIGATION_CONFIG, MainTabId } from "@/lib/navigationConfig";
import { cn } from "@/lib/utils";

interface TabNavigatorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: MainTabId;
}

export function TabNavigatorSheet({ isOpen, onClose, activeTab }: TabNavigatorSheetProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { light } = useHaptic();
  const [selectedSubtab, setSelectedSubtab] = useState<string | null>(null);

  const config = NAVIGATION_CONFIG[activeTab];

  useEffect(() => {
    if (isOpen) {
      setSelectedSubtab(null);
    }
  }, [isOpen, activeTab]);

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[2rem] shadow-float border-t border-border/30 overflow-hidden"
          style={{ maxHeight: "70vh" }}
        >
          <div className="p-6 pb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-mint flex items-center justify-center shadow-md shadow-mint/20">
                {config && <config.icon className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">{config?.label}</h2>
                <p className="text-xs text-muted-foreground">Quick navigation</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Navigate to</div>
                <div className="grid grid-cols-1 gap-2">
                  {config?.subtabs.map((subtab) => (
                    <SubtabItem
                      key={subtab.id}
                      subtab={subtab}
                      isSelected={selectedSubtab === subtab.id}
                      onSelect={() => handleSubtabSelect(subtab)}
                      onMouseEnter={() => setSelectedSubtab(subtab.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="w-12 h-1 bg-muted rounded-full" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface SubtabItemProps {
  subtab: SubTab;
  isSelected: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}

function SubtabItem({ subtab, isSelected, onSelect, onMouseEnter }: SubtabItemProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200",
        isSelected 
          ? "bg-gradient-mint shadow-soft" 
          : "bg-secondary/50 hover:bg-secondary"
      )}
    >
      <span className={cn(
        "font-medium",
        isSelected ? "text-primary" : "text-foreground"
      )}>
        {subtab.label}
      </span>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="h-2 w-2 rounded-full bg-primary"
        />
      )}
    </motion.button>
  );
}

export function useLongPressNavigation(activeTabId: MainTabId) {
  const [showNavigator, setShowNavigator] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const { medium } = useHaptic();

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      medium();
      setShowNavigator(true);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleClose = () => {
    setShowNavigator(false);
  };

  return {
    showNavigator,
    handleMouseDown,
    handleMouseUp,
    handleClose,
    navigator: showNavigator ? (
      <TabNavigatorSheet 
        isOpen={showNavigator} 
        onClose={handleClose} 
        activeTab={activeTabId} 
      />
    ) : null,
  };
}
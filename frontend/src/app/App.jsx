import { useState, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAsync } from "../hooks/useAsync";
import { api } from "../lib/api";
import { USER_ID, MOBILE_NAV_ITEMS } from "../lib/constants";
import { haptic } from "../lib/utils";
import { OnboardingWizard } from "../features/onboarding/OnboardingWizard";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { FinancePage } from "../features/finance/FinancePage";
import { FoodPage } from "../features/food/FoodPage";
import { CalendarPage } from "../features/calendar/CalendarPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { ActivityPage } from "../features/activity/ActivityPage";
import { ChatPage } from "../features/chat/ChatPage";
import { BottomNav } from "../components/layout/BottomNav";
import { DesktopNav } from "../components/layout/DesktopNav";
import { ConnectionStatus } from "../components/layout/ConnectionStatus";

function AppLayout({ profile, onProfileUpdate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [transitionConfig, setTransitionConfig] = useState({
    type: "click",
    direction: 0
  });

  const handleSwipe = (direction) => {
    const currentIndex = MOBILE_NAV_ITEMS.findIndex((item) => item.to === location.pathname);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < MOBILE_NAV_ITEMS.length) {
      haptic(10);
      setTransitionConfig({ type: "swipe", direction });
      navigate(MOBILE_NAV_ITEMS[nextIndex].to);
    }
  };

  // Default back to click after transition starts
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransitionConfig(prev => ({ ...prev, type: "click" }));
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const variants = {
    enter: (config) => ({
      x: config.type === "swipe" ? (config.direction > 0 ? 100 : -100) : 0,
      y: config.type === "click" ? 40 : 0,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      y: 0,
      opacity: 1,
    },
    exit: (config) => ({
      zIndex: 0,
      x: config.type === "swipe" ? (config.direction > 0 ? -100 : 100) : 0,
      y: config.type === "click" ? -40 : 0,
      opacity: 0,
    }),
  };

  return (
    <>
      <ConnectionStatus />
      <div className="page-shell pb-32 md:pb-10">
        <DesktopNav />
        <motion.div 
          className="flex-1"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={() => setTransitionConfig(prev => ({ ...prev, type: "swipe" }))}
          onDragEnd={(_, info) => {
            const threshold = 30;
            if (info.offset.x > threshold) handleSwipe(-1); 
            if (info.offset.x < -threshold) handleSwipe(1); 
          }}
        >
          <AnimatePresence mode="wait" custom={transitionConfig}>
            <motion.div
              key={location.pathname}
              custom={transitionConfig}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                y: { type: "spring", stiffness: 250, damping: 25 },
                opacity: { duration: 0.2 }
              }}
            >
              <Routes location={location}>
                <Route path="/" element={<DashboardPage profile={profile} />} />
                <Route path="/finance" element={<FinancePage profile={profile} />} />
                <Route path="/food" element={<FoodPage profile={profile} />} />
                <Route path="/calendar" element={<CalendarPage profile={profile} />} />
                <Route path="/activity" element={<ActivityPage profile={profile} />} />
                <Route path="/chat" element={<ChatPage profile={profile} />} />
                <Route path="/profile" element={<ProfilePage profile={profile} onProfileUpdate={onProfileUpdate} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <BottomNav />
    </>
  );
}

export default function App() {
  const { data: profile, loading, error, setData } = useAsync(() => api.getProfile(USER_ID), [], {
    initialData: null,
  });

  if (loading) {
    return <div className="page-shell justify-center text-center text-slate-400">Loading FinTrack...</div>;
  }

  if (error && /Profile not found/i.test(error.message)) {
    return <OnboardingWizard onComplete={setData} />;
  }

  if (error) {
    return <div className="page-shell justify-center text-center text-rose-300">{error.message}</div>;
  }

  if (!profile?.onboardingComplete) {
    return <OnboardingWizard onComplete={setData} />;
  }

  return <AppLayout profile={profile} onProfileUpdate={setData} />;
}

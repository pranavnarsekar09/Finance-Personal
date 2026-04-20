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
  
  const currentIndex = MOBILE_NAV_ITEMS.findIndex((item) => item.to === location.pathname);
  const [session, setSession] = useState({ prevIndex: currentIndex, direction: 0 });

  // Detect direction automatically for any navigation (swipe or click)
  if (currentIndex !== session.prevIndex && currentIndex !== -1) {
    setSession({
      direction: currentIndex > session.prevIndex ? 1 : -1,
      prevIndex: currentIndex
    });
  }

  const handleSwipe = (direction) => {
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < MOBILE_NAV_ITEMS.length) {
      haptic(10);
      navigate(MOBILE_NAV_ITEMS[nextIndex].to);
    }
  };

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : dir < 0 ? "-100%" : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : dir < 0 ? "100%" : 0,
      opacity: 0,
    }),
  };

  return (
    <>
      <ConnectionStatus />
      <div className="page-shell overflow-x-hidden pb-32 md:pb-10">
        <DesktopNav />
        <motion.div 
          className="flex-1"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDragEnd={(_, info) => {
            const threshold = 50;
            if (info.offset.x > threshold) handleSwipe(-1); 
            if (info.offset.x < -threshold) handleSwipe(1); 
          }}
        >
          <AnimatePresence initial={false} custom={session.direction} mode="popLayout">
            <motion.div
              key={location.pathname}
              custom={session.direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", ease: "circOut", duration: 0.35 },
                opacity: { duration: 0.2 }
              }}
              className="w-full"
              style={{ willChange: "transform, opacity" }}
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

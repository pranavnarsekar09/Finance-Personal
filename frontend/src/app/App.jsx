import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAsync } from "../hooks/useAsync";
import { api } from "../lib/api";
import { USER_ID } from "../lib/constants";
import { OnboardingWizard } from "../features/onboarding/OnboardingWizard";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { FinancePage } from "../features/finance/FinancePage";
import { FoodPage } from "../features/food/FoodPage";
import { CalendarPage } from "../features/calendar/CalendarPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { ChatPage } from "../features/chat/ChatPage";
import { BottomNav } from "../components/layout/BottomNav";
import { DesktopNav } from "../components/layout/DesktopNav";

function AppLayout({ profile, onProfileUpdate }) {
  const location = useLocation();

  return (
    <>
      <div className="page-shell pb-32 md:pb-10">
        <DesktopNav />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <Routes>
              <Route path="/" element={<DashboardPage profile={profile} />} />
              <Route path="/finance" element={<FinancePage profile={profile} />} />
              <Route path="/food" element={<FoodPage profile={profile} />} />
              <Route path="/calendar" element={<CalendarPage profile={profile} />} />
              <Route path="/chat" element={<ChatPage profile={profile} />} />
              <Route path="/profile" element={<ProfilePage profile={profile} onProfileUpdate={onProfileUpdate} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
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

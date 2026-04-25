import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { MOBILE_NAV_ITEMS } from "../../lib/constants";
import { LayoutDashboard, Plus, Utensils, History, Activity, MessageSquare, User } from "lucide-react";

const ICON_MAP = {
  "/": LayoutDashboard,
  "/finance": Plus,
  "/food": Utensils,
  "/calendar": History,
  "/activity": Activity,
  "/chat": MessageSquare,
  "/profile": User,
};

export function BottomNav() {
  const financeItem = MOBILE_NAV_ITEMS.find((item) => item.to === "/finance");
  const sideItems = MOBILE_NAV_ITEMS.filter((item) => item.to !== "/finance");
  const leftItems = sideItems.slice(0, 3);
  const rightItems = sideItems.slice(3);

  return (
    <nav className="bottom-nav-container">
      <div className="flex flex-1 items-center justify-around">
        {leftItems.map((item) => {
          const Icon = ICON_MAP[item.to] || LayoutDashboard;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={({ isActive }) =>
                `bottom-nav-item relative ${isActive ? "is-active text-sky-600 dark:text-sky-300" : "text-slate-500 dark:text-slate-400"}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <motion.div
                      layoutId="active-nav-bg"
                      className="absolute inset-1 z-0 rounded-2xl bg-sky-50 dark:bg-slate-800"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  ) : null}
                  <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                    <Icon size={18} className="transition-all duration-300" />
                    <span className="sr-only">{item.label}</span>
                    <span className={`hidden text-[10px] font-semibold ${isActive ? "sm:block" : ""}`}>{item.label}</span>
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
      {financeItem ? (
        <NavLink
          key={financeItem.to}
          to={financeItem.to}
          aria-label="Add expense"
          className="mx-2 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl shadow-slate-900/15 transition-transform hover:scale-[1.02] dark:bg-sky-500"
        >
          <div className="flex flex-col items-center justify-center">
            <Plus size={20} />
          </div>
        </NavLink>
      ) : null}
      <div className="flex flex-1 items-center justify-around">
        {rightItems.map((item) => {
        const Icon = ICON_MAP[item.to] || LayoutDashboard;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className={({ isActive }) =>
              `bottom-nav-item relative ${isActive ? "is-active text-sky-600 dark:text-sky-300" : "text-slate-500 dark:text-slate-400"}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-1 z-0 rounded-2xl bg-sky-50 dark:bg-slate-800"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                ) : null}
                <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                  <Icon size={18} className="transition-all duration-300" />
                  <span className="sr-only">{item.label}</span>
                  <span className={`hidden text-[10px] font-semibold ${isActive ? "sm:block" : ""}`}>{item.label}</span>
                </div>
              </>
            )}
          </NavLink>
        );
      })}
      </div>
    </nav>
  );
}

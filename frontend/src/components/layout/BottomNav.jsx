import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { MOBILE_NAV_ITEMS } from "../../lib/constants";
import { LayoutDashboard, Wallet, Utensils, History, Activity, MessageSquare, User } from "lucide-react";

const ICON_MAP = {
  "/": LayoutDashboard,
  "/finance": Wallet,
  "/food": Utensils,
  "/calendar": History,
  "/activity": Activity,
  "/chat": MessageSquare,
  "/profile": User,
};

export function BottomNav() {
  return (
    <nav className="bottom-nav-container !max-w-2xl !gap-0 !p-1">
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = ICON_MAP[item.to] || LayoutDashboard;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex h-12 flex-col items-center justify-center transition-all duration-300 ${
                isActive ? "flex-[2] text-cyan-100" : "flex-1 text-slate-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 z-0 rounded-2xl bg-cyan-400/15"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                  <Icon size={isActive ? 22 : 18} className="transition-all duration-300" />
                  <span
                    className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                      isActive ? "scale-100 opacity-100" : "scale-0 h-0 opacity-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

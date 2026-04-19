import { useRef, useEffect } from "react";
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
    <nav className="bottom-nav-container !max-w-none !gap-0 !p-1 !px-2 shadow-2xl shadow-cyan-900/20">
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = ICON_MAP[item.to] || LayoutDashboard;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex h-12 flex-col items-center justify-center transition-all duration-300 overflow-hidden ${
                isActive ? "is-active flex-[1.5] text-cyan-200" : "flex-1 text-slate-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-x-1 inset-y-1 z-0 rounded-xl bg-cyan-400/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center justify-center gap-0">
                  <Icon size={isActive ? 20 : 16} className="transition-all duration-300" />
                  <span
                    className={`whitespace-nowrap text-[8px] font-black uppercase tracking-tighter transition-all duration-300 ${
                      isActive ? "scale-100 opacity-100 mt-0.5" : "scale-0 h-0 opacity-0"
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

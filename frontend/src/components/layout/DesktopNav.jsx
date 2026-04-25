import { NavLink } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { MOBILE_NAV_ITEMS } from "../../lib/constants";

export function DesktopNav({ theme = "light", onToggleTheme }) {
  const isDark = theme === "dark";

  return (
    <div className="mb-8 hidden items-center justify-between rounded-[28px] border border-white/80 bg-white/80 px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20 md:flex">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-500 dark:text-sky-400">FinTrack</p>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Personal Finance + Nutrition</h2>
      </div>
      <div className="flex items-center gap-2">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-pill ${isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 dark:bg-sky-500" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onToggleTheme}
          className="ml-2 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

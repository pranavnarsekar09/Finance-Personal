import { NavLink } from "react-router-dom";
import { MOBILE_NAV_ITEMS } from "../../lib/constants";

export function DesktopNav() {
  return (
    <div className="mb-8 hidden items-center justify-between rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl md:flex">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300">FinTrack</p>
        <h2 className="font-display text-xl font-bold text-white">Personal Finance + Nutrition</h2>
      </div>
      <div className="flex gap-2">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-pill ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

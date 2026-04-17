import { NavLink } from "react-router-dom";
import { MOBILE_NAV_ITEMS } from "../../lib/constants";

export function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 rounded-[28px] border border-white/10 bg-slate-950/75 p-2 shadow-glass backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-6 gap-1">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-pill justify-center ${isActive ? "bg-cyan-400/15 text-cyan-100" : "text-slate-400"}`
            }
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

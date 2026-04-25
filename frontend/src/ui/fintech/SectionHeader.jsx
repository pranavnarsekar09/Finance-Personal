import { cn } from "../../lib/utils";

export function SectionHeader({ eyebrow, title, description, actions, className = "" }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500 dark:text-sky-400">{eyebrow}</p> : null}
        <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

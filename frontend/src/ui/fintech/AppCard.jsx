import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function AppCard({
  children,
  className = "",
  as: Component = "div",
  interactive = false,
  padding = "p-5",
}) {
  const cardClassName = cn(
    "rounded-[28px] border border-slate-100 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20",
    padding,
    interactive && "transition duration-200 hover:-translate-y-0.5 hover:shadow-xl",
    className,
  );

  if (interactive) {
    return (
      <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }} className={cardClassName}>
        {children}
      </motion.div>
    );
  }

  return <Component className={cardClassName}>{children}</Component>;
}
